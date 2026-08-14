const { 
  sequelize, User, Group, GroupMember, Post, Comment, Like, ActivityLog, FitnessProfile, CalendarEvent, SurveyResponse, Notification, TrainingSession 
} = require('./models');
const bcrypt = require('bcryptjs');

const namesPool = [
  { name: "Carlos Gomez", gender: "male" }, { name: "Maria Rodriguez", gender: "female" },
  { name: "Juan Perez", gender: "male" }, { name: "Luisa Martinez", gender: "female" },
  { name: "Diego Delgado", gender: "male" }, { name: "Camila Castro", gender: "female" },
  { name: "Sebastian Sanchez", gender: "male" }, { name: "Sofia Ramirez", gender: "female" },
  { name: "Andres Torres", gender: "male" }, { name: "Valeria Ortega", gender: "female" },
  { name: "Mateo Muñoz", gender: "male" }, { name: "Daniela Lopez", gender: "female" },
  { name: "Alejandro Ruiz", gender: "male" }, { name: "Laura Morales", gender: "female" },
  { name: "Felipe Cardona", gender: "male" }, { name: "Isabella Vargas", gender: "female" },
  { name: "Santiago Prado", gender: "male" }, { name: "Mariana Rivera", gender: "female" },
  { name: "Nicolas Erazo", gender: "male" }, { name: "Gabriela Ortiz", gender: "female" },
  { name: "Javier Mina", gender: "male" }, { name: "Valentina Solano", gender: "female" },
  { name: "David Chaves", gender: "male" }, { name: "Elena Burbano", gender: "female" },
  { name: "Ricardo Rosero", gender: "male" }, { name: "Paula Narvaez", gender: "female" },
  { name: "Oscar Pardo", gender: "male" }, { name: "Natalia Calvache", gender: "female" },
  { name: "Mauricio Campo", gender: "male" }, { name: "Carolina Guzman", gender: "female" },
  { name: "Gustavo Rojas", gender: "male" }, { name: "Juliana Sandoval", gender: "female" },
  { name: "Camilo Hurtado", gender: "male" }, { name: "Diana Valencia", gender: "female" },
  { name: "Fernando Tobar", gender: "male" }, { name: "Sara Montenegro", gender: "female" },
  { name: "Hector Benitez", gender: "male" }, { name: "Angela Cabrera", gender: "female" },
  { name: "Ivan Beltran", gender: "male" }, { name: "Andrea Astudillo", gender: "female" },
  { name: "Martin Alvarez", gender: "male" }, { name: "Clara Trujillo", gender: "female" },
  { name: "Cristian Paz", gender: "male" }, { name: "Patricia Daza", gender: "female" },
  { name: "Eduardo Lucero", gender: "male" }, { name: "Liliana Rivas", gender: "female" },
  { name: "Jose Villamil", gender: "male" }, { name: "Adriana Portilla", gender: "female" },
  { name: "Ramon Quintero", gender: "male" }, { name: "Beatriz Realpe", gender: "female" }
];

const biosPool = [
  "Atleta aficionado de Timbío. Apasionado por la calistenia y la fuerza.",
  "Entrenando todos los días para mejorar mi salud. ¡Enfocado!",
  "Amante de la vida saludable, el fitness y el running los fines de semana.",
  "Enfocado en ganancia muscular y buena alimentación.",
  "Estudiante y apasionado del entrenamiento de fuerza. Timbío Cauca.",
  "Mejorando mi condición física día a día con disciplina.",
  "Mi meta es la constancia. Entrenando duro en el gimnasio.",
  "Ciclismo y pesas. Siempre buscando superar mis límites.",
  "Entrenando por salud mental y fuerza física.",
  "Madre, atleta y entusiasta de la vida fitness."
];

const postContentPool = [
  { 
    title: "¡Sentadilla de hoy superada!", 
    content: "Logré romper récord personal en sentadilla profunda. Técnica impecable gracias al analizador de postura IA.", 
    media_url: "/uploads/demo_video.mp4",
    media_type: "video",
    tags: { exercise_type: "Sentadilla", muscle_group: "Cuádriceps", intensity: "Alta" } 
  },
  { 
    title: "Rutina de hombros terminada", 
    content: "Dándole duro al entrenamiento militar para fuerza general. ¡Sintiendo el progreso!", 
    media_url: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600",
    media_type: "image",
    tags: { exercise_type: "Pesas", muscle_group: "Hombros", intensity: "Media" } 
  },
  { 
    title: "Cardio al aire libre en Timbío", 
    content: "Excelente trote de 5km hoy por la variante. Manteniendo activa la racha.", 
    media_url: "/uploads/demo_video.mp4",
    media_type: "video",
    tags: { exercise_type: "Cardio", muscle_group: "General", intensity: "Media" } 
  },
  { 
    title: "Técnica de flexiones corregida", 
    content: "El esqueleto de IA me ayudó a alinear bien los codos para proteger mis hombros.", 
    media_url: "/uploads/demo_video.mp4",
    media_type: "video",
    tags: { exercise_type: "Flexiones", muscle_group: "Pecho", intensity: "Alta" } 
  },
  { 
    title: "Planificando la semana", 
    content: "El Coach de FitNet me armó una rutina tremenda para esta semana de hipertrofia. ¡A darle!", 
    media_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600",
    media_type: "image",
    tags: { exercise_type: "Planificacion", muscle_group: "General", intensity: "Baja" } 
  }
];

const commentsPool = [
  "¡Excelente técnica, sigue así!",
  "¡Qué gran racha llevas!",
  "Esa rutina se ve buenísima.",
  "¡Grande! Motivación total.",
  "Yo también entreno en ese grupo, nos vemos allá.",
  "Totalmente de acuerdo, la postura es clave.",
  "¡A romperla con toda!",
  "Inspiración pura para los de Timbío."
];

async function seed() {
  try {
    console.log("=== INICIANDO SIMULACIÓN DE ACTIVIDAD DE USUARIOS REALES ===");

    // 1. Ensure we have an Admin and standard password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Clean old posts, comments, likes, and activity logs to keep everything clean and professional
    console.log("Limpiando antiguas publicaciones e interacciones...");
    await Notification.destroy({ where: {} });
    await Like.destroy({ where: {} });
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await TrainingSession.destroy({ where: {} });
    await ActivityLog.destroy({ where: {} });
    
    // Find or create admin to be group creator
    let admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'mx34673457@bigstoreoficial.com',
        password_hash: passwordHash,
        full_name: 'Administrador FitNet',
        role: 'admin',
        bio: 'Administrador del sistema FitNet para el proyecto de tesis.'
      });
    }

    // 2. Create the 3 groups
    console.log("Creando grupos de gimnasio...");
    const groupsData = [
      { name: "Gimnasio Magnus Timbío", description: "Comunidad de entrenamiento de fuerza y acondicionamiento en el gym Magnus.", category: "Fuerza" },
      { name: "Iron World Club", description: "Atletas y entrenadores enfocados en levantamiento de pesas e hipertrofia.", category: "Fuerza" },
      { name: "FitLife Timbío Community", description: "Grupo abierto para rutinas cardiovasculares, aeróbicos y bienestar general.", category: "Cardio" }
    ];

    const createdGroups = [];
    for (const g of groupsData) {
      let group = await Group.findOne({ where: { name: g.name } });
      if (!group) {
        group = await Group.create({
          name: g.name,
          description: g.description,
          category: g.category,
          creator_id: admin.id
        });
      }
      createdGroups.push(group);
    }

    // 3. Create or update 50 real-looking users
    console.log("Creando/Actualizando 50 usuarios reales y sus perfiles...");
    const users = [];
    const goals = ["lose_weight", "build_muscle", "maintain_weight", "improve_fitness"];
    const activityLevels = ["sedentary", "lightly_active", "moderately_active", "very_active"];
    
    for (let i = 0; i < 50; i++) {
      const poolItem = namesPool[i];
      const username = poolItem.name.toLowerCase().replace(" ", "_") + `_${Math.floor(Math.random() * 90 + 10)}`;
      const email = `${username}@fitnet.com`;
      const fullName = poolItem.name;
      const bio = biosPool[Math.floor(Math.random() * biosPool.length)];

      let user = await User.findOne({ where: { email } });
      if (!user) {
        // Double check username unique
        let userCheck = await User.findOne({ where: { username } });
        const finalUsername = userCheck ? `${username}_v2` : username;

        user = await User.create({
          username: finalUsername,
          email,
          password_hash: passwordHash,
          full_name: fullName,
          role: 'user',
          bio,
          profile_picture: `/uploads/default-avatar.svg`
        });
      }
      users.push(user);

      // Create/Update Fitness Profile
      const age = Math.floor(Math.random() * 25) + 18; // 18-43 years
      const weight = poolItem.gender === 'male' 
        ? parseFloat((Math.random() * 30 + 65).toFixed(1)) 
        : parseFloat((Math.random() * 20 + 50).toFixed(1));
      const height = poolItem.gender === 'male'
        ? Math.floor(Math.random() * 25) + 165 // 165-190 cm
        : Math.floor(Math.random() * 20) + 150; // 150-170 cm
      
      const goal = goals[Math.floor(Math.random() * goals.length)];
      const actLevel = activityLevels[Math.floor(Math.random() * activityLevels.length)];
      const streak = Math.floor(Math.random() * 8) + 1; // 1-8 days streak
      const totalWorkouts = Math.floor(Math.random() * 15) + 3; // 3-18 total

      let fitnessProfile = await FitnessProfile.findOne({ where: { user_id: user.id } });
      if (!fitnessProfile) {
        await FitnessProfile.create({
          user_id: user.id,
          age,
          weight_kg: weight,
          height_cm: height,
          gender: poolItem.gender,
          activity_level: actLevel,
          goal,
          training_location: ['gym', 'home', 'park'][Math.floor(Math.random() * 3)],
          available_days: Math.floor(Math.random() * 3) + 3,
          current_streak: streak,
          max_streak: streak + 2,
          total_workouts: totalWorkouts
        });
      } else {
        fitnessProfile.current_streak = streak;
        fitnessProfile.total_workouts = totalWorkouts;
        await fitnessProfile.save();
      }

      // 3.5 Create completed training sessions for this user to populate their profile table
      const exercisesList = ['sentadilla', 'flexiones', 'cardio', 'pesas', 'plancha'];
      const numSessions = Math.floor(Math.random() * 3) + 3; // 3 to 5 sessions
      for (let s = 0; s < numSessions; s++) {
        const exercise_type = exercisesList[Math.floor(Math.random() * exercisesList.length)];
        const repetitions = Math.floor(Math.random() * 15) + 10;
        const duration_seconds = Math.floor(Math.random() * 60) + 30;
        const calories_burned = Math.floor(repetitions * 1.5 + duration_seconds * 0.1);
        const accuracy_percentage = parseFloat((Math.random() * 15 + 83).toFixed(1));
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() - s); // spread them across recent days
        
        await TrainingSession.create({
          user_id: user.id,
          exercise_type,
          repetitions,
          duration_seconds,
          calories_burned,
          accuracy_percentage,
          date: sessionDate
        });
      }

      // 4. Enroll in the 3 groups (Approved Members)
      for (const group of createdGroups) {
        // Randomly join some or all groups
        if (Math.random() > 0.3) {
          const memberExists = await GroupMember.findOne({ where: { group_id: group.id, user_id: user.id } });
          if (!memberExists) {
            await GroupMember.create({
              group_id: group.id,
              user_id: user.id,
              status: 'approved'
            });
          }
        }
      }
    }

    // 5. Generate Posts, Likes, Comments, and Activity logs for these users
    console.log("Generando posts de comunidad, comentarios e interacciones de likes...");
    const posts = [];
    for (let i = 0; i < 25; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const postTemplate = postContentPool[Math.floor(Math.random() * postContentPool.length)];
      
      const newPost = await Post.create({
        user_id: randomUser.id,
        title: postTemplate.title,
        content: postTemplate.content,
        media_url: postTemplate.media_url,
        media_type: postTemplate.media_type,
        ai_tags: postTemplate.tags
      });
      posts.push(newPost);

      // Create activity log for post creation
      await ActivityLog.create({
        user_id: randomUser.id,
        action: 'CREATE_POST',
        details: `Publicó en el feed de comunidad: "${postTemplate.title}"`,
        ip_address: '192.168.1.50'
      });
    }

    // Generate random comments and likes
    console.log("Agregando interacciones y logs de auditoría para los 50 usuarios...");
    for (const post of posts) {
      // Add 2-5 likes from random users
      const numLikes = Math.floor(Math.random() * 4) + 2;
      for (let l = 0; l < numLikes; l++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        // Check duplicate like
        const likeExists = await Like.findOne({ where: { post_id: post.id, user_id: randomUser.id } });
        if (!likeExists) {
          await Like.create({ post_id: post.id, user_id: randomUser.id });
          
          // Log activity
          await ActivityLog.create({
            user_id: randomUser.id,
            action: 'LIKE_POST',
            details: `Dio like a la publicación ID: ${post.id}`,
            ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10)
          });
        }
      }

      // Add 1-2 comments
      const numComments = Math.floor(Math.random() * 2) + 1;
      for (let c = 0; c < numComments; c++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const commentText = commentsPool[Math.floor(Math.random() * commentsPool.length)];
        await Comment.create({
          post_id: post.id,
          user_id: randomUser.id,
          content: commentText
        });

        // Log activity
        await ActivityLog.create({
          user_id: randomUser.id,
          action: 'COMMENT_POST',
          details: `Comentó en la publicación ID: ${post.id}`,
          ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10)
        });
      }
    }

    // Add random login and profile update logs for audit logs
    for (let u = 0; u < 50; u++) {
      const user = users[u];
      // Random login log
      await ActivityLog.create({
        user_id: user.id,
        action: 'LOGIN',
        details: 'Inicio de sesión exitoso',
        ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10)
      });

      // Random update profile log
      if (Math.random() > 0.5) {
        await ActivityLog.create({
          user_id: user.id,
          action: 'UPDATE_PROFILE',
          details: 'Perfil actualizado',
          ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10)
        });
      }

      // Random join group log
      if (Math.random() > 0.4) {
        const randomGroup = createdGroups[Math.floor(Math.random() * createdGroups.length)];
        await ActivityLog.create({
          user_id: user.id,
          action: 'JOIN_GROUP',
          details: `Se unió al grupo: ${randomGroup.name}`,
          ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10)
        });
      }
    }

    console.log("=== SIMULACIÓN COMPLETADA EXITOSAMENTE ===");
    console.log("Se poblaron grupos, membresías, posts, comentarios, likes y logs de auditoría para 50 usuarios reales.");
    process.exit(0);
  } catch (error) {
    console.error("Error al simular la actividad del piloto:", error);
    process.exit(1);
  }
}

seed();
