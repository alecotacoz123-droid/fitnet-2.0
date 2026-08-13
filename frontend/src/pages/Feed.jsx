import React, { useState, useEffect } from 'react';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Video, 
  Image as ImageIcon, 
  FileText,
  Loader2, 
  Bot, 
  ThumbsUp, 
  User as UserIcon, 
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import { LevelBadge } from '../components/LevelBadge';
import { useToast } from '../context/ToastContext';
import { PostSkeleton } from '../components/Skeleton';
import { SafeImage } from '../components/SafeImage';

const Feed = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Post Form State
  const [title, setTitle] = useState('');

  const renderAITags = (aiTags) => {
    if (!aiTags) return null;
    let tags = aiTags;
    if (typeof aiTags === 'string') {
      try {
        tags = JSON.parse(aiTags);
      } catch (e) {
        return null;
      }
    }
    
    if (!tags || (!tags.exercise_type && !tags.muscle_group)) return null;

    return (
      <div className="mt-3 bg-blue-50/70 border border-blue-100/70 p-4 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between text-blue-700">
          <div className="flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-blue-600 animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-wider">Clasificación de Video IA</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-blue-100/80 text-blue-800 rounded-md border border-blue-200">
            {tags.mode === 'local_fallback' ? 'NLP Analizador' : 'Visión Artificial'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-0.5">
          {tags.exercise_type && (
            <span className="text-xs font-bold px-2.5 py-1 bg-white text-blue-700 border border-blue-100 shadow-sm rounded-xl flex items-center space-x-1">
              <span>🏋️</span>
              <span>{tags.exercise_type}</span>
            </span>
          )}
          {tags.muscle_group && (
            <span className="text-xs font-bold px-2.5 py-1 bg-white text-emerald-700 border border-emerald-100 shadow-sm rounded-xl flex items-center space-x-1">
              <span>💪</span>
              <span>{tags.muscle_group}</span>
            </span>
          )}
          {tags.intensity && (
            <span className="text-xs font-bold px-2.5 py-1 bg-white text-orange-700 border border-orange-100 shadow-sm rounded-xl flex items-center space-x-1">
              <span>🔥</span>
              <span>Intensidad {tags.intensity}</span>
            </span>
          )}
        </div>
      </div>
    );
  };
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [formError, setFormError] = useState('');

  // Comment drawers per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState({});

  // Edit & Delete state
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleCommentTextChange = (postId, val) => {
    setNewCommentText(prev => ({ ...prev, [postId]: val }));
  };

  const handleEditSubmit = async (e, postId) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setEditSubmitting(true);
    try {
      await postService.updatePost(postId, { title: editTitle, content: editContent });
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return { ...post, title: editTitle, content: editContent };
          }
          return post;
        })
      );
      setEditingPost(null);
      showToast('Publicación editada correctamente.', 'success');
    } catch (error) {
      console.error('Error updating post:', error);
      showToast('Error al actualizar la publicación: ' + error.message, 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setShowDeleteConfirm(null);
      showToast('Publicación eliminada correctamente.', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Error al eliminar la publicación: ' + error.message, 'error');
    }
  };

  const fetchFeed = async (pageNum = 1, append = false) => {
    try {
      const data = await postService.getFeed(pageNum, 10);
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, false);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title) return setFormError('El título es obligatorio.');
    
    setFormError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    try {
      await postService.createPost(formData);
      setTitle('');
      setContent('');
      setMediaFile(null);
      setMediaPreview('');
      fetchFeed(1, false);
      showToast('¡Publicación creada exitosamente!', 'success');
    } catch (error) {
      setFormError(error.message || 'Error al crear la publicación.');
      showToast(error.message || 'Error al crear la publicación.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await postService.toggleLike(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likesCount: result.liked ? post.likesCount + 1 : post.likesCount - 1,
              likedByCurrentUser: result.liked
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    try {
      const result = await postService.addComment(postId, text);
      
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              Comments: [...(post.Comments || []), result.comment],
              commentsCount: post.commentsCount + 1
            };
          }
          return post;
        })
      );

      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Comunidad</h1>
      </div>

      {/* Main Header / Composer Trigger */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <ThumbsUp className="w-5 h-5 text-blue-600" />
          <span>Comparte tu progreso Fitness</span>
        </h2>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center space-x-2 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreatePost} className="space-y-4">
          <input
            type="text"
            placeholder="Título del entrenamiento o publicación *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
            disabled={submitting}
          />
          
          <textarea
            placeholder="Describe tu rutina, sensaciones o consejos..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="3"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
            disabled={submitting}
          />

          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-[300px] flex items-center justify-center">
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} controls className="max-h-[300px] w-full object-contain" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="max-h-[300px] object-contain" />
              )}
              <button
                type="button"
                onClick={() => { setMediaFile(null); setMediaPreview(''); }}
                className="absolute top-2 right-2 bg-white/90 text-red-600 hover:bg-red-50 hover:text-red-700 p-1.5 rounded-full text-xs font-bold shadow-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-4">
            <label className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl border border-slate-200 cursor-pointer text-xs font-semibold transition-colors">
              <Video className="w-4 h-4 text-blue-600" />
              <ImageIcon className="w-4 h-4 text-green-500" />
              <span className="hidden sm:inline">Subir Media</span>
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={submitting}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Publicar</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Feed Posts */}
      {loading ? (
        <div className="space-y-6">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-3xl border border-slate-100 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-900 font-bold text-base">Feed Vacío</h3>
          <p className="text-slate-500 text-sm mt-1">Nadie ha publicado nada todavía. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-50">
                <Link to={`/profile/${post.User?.username}`} className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      <SafeImage 
                        src={post.User?.profile_picture} 
                        alt={post.User?.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{post.User?.full_name}</span>
                      <span className="text-xs text-slate-400">@{post.User?.username}</span>
                      {post.User?.FitnessProfile && (
                        <LevelBadge fitnessProfile={post.User.FitnessProfile} size="xs" />
                      )}
                    </div>
                    <span className={`text-[10px] uppercase font-black tracking-wider ${post.User?.role === 'trainer' ? 'text-blue-600' : 'text-green-600'}`}>
                      {post.User?.role === 'trainer' ? 'Coach' : post.User?.role === 'admin' ? 'Admin' : 'Atleta'}
                    </span>
                  </div>
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-medium text-slate-400">
                    {new Date(post.created_at).toLocaleDateString('es-ES', { 
                      day: 'numeric', month: 'short'
                    })}
                  </span>
                  {(user?.id === post.user_id || user?.role === 'admin') && (
                    <div className="flex items-center space-x-1 border-l border-slate-100 pl-3">
                      <button
                        onClick={() => {
                          setEditingPost(post.id);
                          setEditTitle(post.title);
                          setEditContent(post.content || '');
                        }}
                        title="Editar publicación"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(post.id)}
                        title="Eliminar publicación"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Media Rendering */}
              {post.media_url && (
                <div className="bg-slate-50 w-full flex items-center justify-center border-b border-slate-100 overflow-hidden max-h-[450px]">
                  {post.media_type === 'video' ? (
                    <video src={post.media_url} controls className="w-full max-h-[450px] object-contain" />
                  ) : (
                    <img src={post.media_url} alt={post.title} className="w-full max-h-[450px] object-contain" />
                  )}
                </div>
              )}

              {/* Content */}
              {editingPost === post.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, post.id)} className="p-5 space-y-3 border-t border-slate-50 bg-slate-50/30">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Título de la Publicación</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold transition-all"
                      placeholder="Título *"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contenido / Descripción</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="3"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                      placeholder="Escribe algo..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={editSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                    >
                      {editSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{post.title}</h3>
                  {post.content && (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  )}

                  {/* AI Tags */}
                  {renderAITags(post.ai_tags)}
                </div>
              )}

              {/* Actions / Delete Confirmation */}
              {showDeleteConfirm === post.id ? (
                <div className="px-5 py-4 border-t border-slate-100 bg-red-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">¿Eliminar esta publicación de forma permanente?</span>
                  </div>
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDeleteSubmit(post.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Eliminar permanentemente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center space-x-6 text-sm">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 font-bold transition-colors ${
                      post.likedByCurrentUser ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                    className="flex items-center space-x-2 font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{post.commentsCount}</span>
                  </button>
                </div>
              )}

              {/* Comments Section */}
              {activeCommentsPostId === post.id && (
                <div className="border-t border-slate-100 bg-white p-4 space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {post.Comments && post.Comments.length > 0 ? (
                      post.Comments.map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-3 text-xs">
                          <Link to={`/profile/${comment.User?.username}`} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            <SafeImage 
                              src={comment.User?.profile_picture} 
                              alt={comment.User?.username}
                              className="w-full h-full object-cover" 
                            />
                          </Link>
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <Link to={`/profile/${comment.User?.username}`} className="font-bold text-slate-900 hover:text-blue-600">
                                @{comment.User?.username}
                              </Link>
                              <span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-700 leading-normal">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-medium text-slate-400 text-center py-2">Sin comentarios aún.</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-50">
                    <input
                      type="text"
                      placeholder="Escribe un comentario..."
                      value={newCommentText[post.id] || ''}
                      onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newCommentText[post.id]?.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {page < totalPages && (
        <button
          onClick={() => fetchFeed(page + 1, true)}
          className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-bold transition-colors cursor-pointer text-sm shadow-sm"
        >
          Cargar más publicaciones
        </button>
      )}
    </div>
  );
};

export default Feed;
