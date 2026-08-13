const { Post, User, Like, Comment, Notification } = require('../models');
const { logActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notifier');
const { Op } = require('sequelize');
const path = require('path');
require('dotenv').config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

const createPost = async (req, res) => {
  try {
    const { title, content, media_type } = req.body;
    const user_id = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio.' });
    }

    let media_url = '';
    let detected_media_type = media_type || 'text';

    if (req.file) {
      // We save the file path relative to public uploads
      media_url = `/uploads/${req.file.filename}`;
      
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
        detected_media_type = 'video';
      } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        detected_media_type = 'image';
      }
    }

    let ai_tags = null;

    // Call Video Classifier AI if it is a video
    if (detected_media_type === 'video' && media_url) {
      const fullLocalPath = path.resolve(__dirname, '..', `uploads/${req.file.filename}`);
      console.log(`Calling AI video classifier for: ${fullLocalPath}`);
      
      try {
        const response = await fetch(`${AI_SERVICE_URL}/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            video_path: fullLocalPath,
            title: title,
            content: content
          })
        });

        if (response.ok) {
          const result = await response.json();
          ai_tags = result.tags;
          console.log('AI Classifier output:', ai_tags);
        } else {
          console.warn('AI Classifier returned non-200 status:', response.status);
        }
      } catch (error) {
        console.error('Failed to communicate with AI Service. Using local semantic fallback...');
        
        // Local semantic fallback if Python AI service is down
        const textToAnalyze = `${title} ${content}`.toLowerCase();
        let exercise_type = 'Otro';
        let muscle_group = 'Todo el cuerpo';
        let intensity = 'Media';

        if (textToAnalyze.includes('squat') || textToAnalyze.includes('sentadilla')) {
          exercise_type = 'Squats';
          muscle_group = 'Cuádriceps/Glúteos';
          intensity = 'Alta';
        } else if (textToAnalyze.includes('pushup') || textToAnalyze.includes('lagartija') || textToAnalyze.includes('pecho')) {
          exercise_type = 'Pushups';
          muscle_group = 'Pecho/Tríceps';
          intensity = 'Media';
        } else if (textToAnalyze.includes('bicep') || textToAnalyze.includes('curl') || textToAnalyze.includes('brazo')) {
          exercise_type = 'Bicep Curl';
          muscle_group = 'Bíceps';
          intensity = 'Baja';
        } else if (textToAnalyze.includes('plank') || textToAnalyze.includes('plancha') || textToAnalyze.includes('abdomen')) {
          exercise_type = 'Plank';
          muscle_group = 'Core';
          intensity = 'Media';
        } else if (textToAnalyze.includes('correr') || textToAnalyze.includes('run') || textToAnalyze.includes('cardio')) {
          exercise_type = 'Running';
          muscle_group = 'Cardio';
          intensity = 'Alta';
        } else if (textToAnalyze.includes('peso muerto') || textToAnalyze.includes('deadlift') || textToAnalyze.includes('espalda')) {
          exercise_type = 'Deadlift';
          muscle_group = 'Espalda/Femoral';
          intensity = 'Alta';
        }

        ai_tags = {
          exercise_type,
          muscle_group,
          intensity,
          confidence: 0.85,
          mode: 'local_fallback'
        };
      }
    }

    const post = await Post.create({
      user_id,
      title,
      content: content || '',
      media_url,
      media_type: detected_media_type,
      ai_tags
    });

    await logActivity(user_id, 'CREATE_POST', `Publicación creada con ID: ${post.id}. Tipo: ${post.media_type}`, req);

    return res.status(201).json({
      message: 'Publicación creada exitosamente.',
      post
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    return res.status(500).json({ error: 'Error interno al crear publicación.' });
  }
};

const getFeed = async (req, res) => {
  try {
    const current_user_id = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'profile_picture', 'role']
        },
        {
          model: Comment,
          attributes: ['id', 'content', 'created_at'],
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'full_name', 'profile_picture']
            }
          ]
        },
        {
          model: Like,
          attributes: ['user_id']
        }
      ],
      distinct: true // Required to correctly count and limit with includes
    });

    // Formatear posts para incluir conteos y si el usuario actual le dio like
    const formattedPosts = posts.map(post => {
      const postJSON = post.toJSON();
      const likes = postJSON.Likes || [];
      const likedByCurrentUser = likes.some(like => like.user_id === current_user_id);
      
      delete postJSON.Likes;
      
      return {
        ...postJSON,
        likesCount: likes.length,
        likedByCurrentUser,
        commentsCount: postJSON.Comments ? postJSON.Comments.length : 0
      };
    });

    return res.json({
      posts: formattedPosts,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get Feed Error:', error);
    return res.status(500).json({ error: 'Error al obtener el feed.' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id: post_id } = req.params;
    const user_id = req.user.id;

    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    const existingLike = await Like.findOne({
      where: { user_id, post_id }
    });

    if (existingLike) {
      await existingLike.destroy();
      await logActivity(user_id, 'UNLIKE_POST', `Quitó like de publicación ID: ${post_id}`, req);
      return res.json({ message: 'Like removido.', liked: false });
    } else {
      await Like.create({ user_id, post_id });
      await logActivity(user_id, 'LIKE_POST', `Dio like a publicación ID: ${post_id}`, req);
      
      // Notify post owner
      await createNotification(post.user_id, user_id, 'like', post.id);
      
      return res.json({ message: 'Like registrado.', liked: true });
    }
  } catch (error) {
    console.error('Like Error:', error);
    return res.status(500).json({ error: 'Error al registrar el like.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id: post_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'El contenido del comentario es obligatorio.' });
    }

    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    const comment = await Comment.create({
      user_id,
      post_id,
      content
    });

    await logActivity(user_id, 'COMMENT_POST', `Comentó en publicación ID: ${post_id}`, req);
    
    // Notify post owner
    await createNotification(post.user_id, user_id, 'comment', post.id);

    // Fetch comment with user info to return to frontend
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        }
      ]
    });

    return res.status(201).json({
      message: 'Comentario agregado exitosamente.',
      comment: fullComment
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    return res.status(500).json({ error: 'Error al agregar comentario.' });
  }
};

const searchContent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'La consulta de búsqueda es obligatoria.' });
    }

    const searchRegex = `%${query}%`;

    // Search users
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: searchRegex } },
          { full_name: { [Op.like]: searchRegex } }
        ]
      },
      attributes: ['id', 'username', 'full_name', 'profile_picture', 'role'],
      limit: 5
    });

    // Search posts
    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: searchRegex } },
          { content: { [Op.like]: searchRegex } }
        ]
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'full_name', 'profile_picture', 'role']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    return res.json({ users, posts });
  } catch (error) {
    console.error('Search Error:', error);
    return res.status(500).json({ error: 'Error al realizar la búsqueda.' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const post = await Post.findOne({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada.' });
    
    // Compare user IDs as strings safely
    if (String(post.user_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sin autorización para editar esta publicación.' });
    }
    
    post.title = title || post.title;
    post.content = content !== undefined ? content : post.content;
    await post.save();
    
    await logActivity(req.user.id, 'UPDATE_POST', `Publicación editada: ${post.title} (ID: ${post.id})`, req);
    return res.json({ message: 'Publicación actualizada exitosamente.', post });
  } catch (error) {
    console.error('Update Post Error:', error);
    return res.status(500).json({ error: 'Error al actualizar la publicación.' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findOne({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada.' });
    
    // Compare user IDs as strings safely
    if (String(post.user_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sin autorización para eliminar esta publicación.' });
    }
    
    // Manually delete associated Comments, Likes, and Notifications to prevent FOREIGN KEY constraint issues in SQLite
    await Comment.destroy({ where: { post_id: id } });
    await Like.destroy({ where: { post_id: id } });
    await Notification.destroy({ where: { post_id: id } });
    
    await post.destroy();
    await logActivity(req.user.id, 'DELETE_POST', `Publicación eliminada (ID: ${id})`, req);
    return res.json({ message: 'Publicación eliminada exitosamente.' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    return res.status(500).json({ error: 'Error al eliminar la publicación.' });
  }
};

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  searchContent,
  updatePost,
  deletePost
};
