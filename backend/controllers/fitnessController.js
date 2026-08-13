const { FitnessProfile, ProgressLog, User, TrainingSession, CalendarEvent, SurveyResponse } = require('../models');
const { Op } = require('sequelize');

// Helper to calculate BMI
const calculateBMI = (weight_kg, height_cm) => {
  const height_m = height_cm / 100;
  return +(weight_kg / (height_m * height_m)).toFixed(2);
};

// Helper to calculate TDEE (Mifflin-St Jeor Equation roughly)
const calculateTDEE = (weight_kg, height_cm, age, gender, activity_level, goal) => {
  // BMR Calculation
  let bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  // Activity Multiplier
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };
  
  let tdee = bmr * (multipliers[activity_level] || 1.2);

  // Goal adjustment
  if (goal === 'lose_weight') tdee -= 500;
  if (goal === 'build_muscle') tdee += 300;

  return Math.round(tdee);
};

exports.upsertProfile = async (req, res) => {
  try {
    const { age, gender, weight_kg, height_cm, activity_level, goal, training_location, available_days, physical_restrictions } = req.body;
    
    const calculated_bmi = calculateBMI(weight_kg, height_cm);
    const calculated_tdee = calculateTDEE(weight_kg, height_cm, age, gender, activity_level, goal);

    const profileData = {
      user_id: req.user.id,
      age, gender, weight_kg, height_cm, activity_level, goal, training_location, available_days, physical_restrictions, calculated_bmi, calculated_tdee
    };

    let profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
    
    if (profile) {
      profile = await profile.update(profileData);
    } else {
      profile = await FitnessProfile.create(profileData);
      // Also save first progress log automatically
      await ProgressLog.create({ user_id: req.user.id, weight_kg, notes: 'Initial weight' });
    }

    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logProgress = async (req, res) => {
  try {
    const { weight_kg, notes } = req.body;
    const log = await ProgressLog.create({ user_id: req.user.id, weight_kg, notes });
    
    // Update profile weight and recalculate TDEE/BMI
    const profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
    if (profile) {
      profile.weight_kg = weight_kg;
      profile.calculated_bmi = calculateBMI(weight_kg, profile.height_cm);
      profile.calculated_tdee = calculateTDEE(weight_kg, profile.height_cm, profile.age, profile.gender, profile.activity_level, profile.goal);
      await profile.save();
    }

    res.json({ message: 'Progress logged', log });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProgressLogs = async (req, res) => {
  try {
    const logs = await ProgressLog.findAll({ where: { user_id: req.user.id }, order: [['date', 'ASC'], ['createdAt', 'ASC']] });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTrainingPlan = async (req, res) => {
  try {
    const profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile required to generate plan' });

    const regenerate = req.query.regenerate === 'true';

    if (regenerate) {
      // Delete all future events starting today (including old completed ones to force a clean slate)
      const todayStr = new Date().toISOString().split('T')[0];
      await CalendarEvent.destroy({
        where: {
          user_id: req.user.id,
          date: { [Op.gte]: todayStr }
        }
      });
    } else {
      // Check if user already has future calendar events generated
      const existingEvents = await CalendarEvent.findAll({
        where: { user_id: req.user.id, date: { [Op.gte]: new Date() } },
        order: [['date', 'ASC']]
      });

      if (existingEvents.length > 0) {
        return res.json({ plan: existingEvents, location: profile.training_location, goal: profile.goal });
      }
    }

    // Generate 4 weeks of routines based on profile
    const daysPerWeek = profile.available_days || 3;
    const isHome = profile.training_location === 'home';
    const goal = profile.goal;
    const level = profile.activity_level;

    const routines = {
      'build_muscle': {
        3: [
          { title: 'Full Body A', ex: [{n:'Sentadillas',s:4,r:12,rest:'90s',d:'Medio',m:'Piernas'},{n:'Flexiones',s:4,r:10,rest:'90s',d:'Medio',m:'Pecho'}] },
          { title: 'Descanso', rest: true },
          { title: 'Full Body B', ex: [{n:'Remo',s:4,r:12,rest:'90s',d:'Medio',m:'Espalda'},{n:'Zancadas',s:3,r:15,rest:'90s',d:'Medio',m:'Piernas'}] },
          { title: 'Descanso', rest: true },
          { title: 'Full Body C', ex: [{n:'Plancha',s:3,r:1,rest:'60s',d:'Bajo',m:'Abdomen'},{n:'Fondos',s:3,r:12,rest:'90s',d:'Alto',m:'Tríceps'}] },
          { title: 'Descanso', rest: true },
          { title: 'Descanso Activo', rest: true }
        ],
        5: [
          { title: 'Pecho y Tríceps', ex: [{n:'Flexiones',s:4,r:15,rest:'60s',d:'Medio',m:'Pecho'}] },
          { title: 'Espalda y Bíceps', ex: [{n:'Dominadas',s:4,r:8,rest:'90s',d:'Alto',m:'Espalda'}] },
          { title: 'Piernas', ex: [{n:'Sentadillas',s:5,r:15,rest:'90s',d:'Medio',m:'Piernas'}] },
          { title: 'Hombros y Abdomen', ex: [{n:'Press Militar',s:4,r:12,rest:'60s',d:'Medio',m:'Hombros'}] },
          { title: 'Glúteos e Isquios', ex: [{n:'Peso Muerto',s:4,r:12,rest:'90s',d:'Medio',m:'Isquios'}] },
          { title: 'Descanso', rest: true },
          { title: 'Descanso', rest: true }
        ]
      }
    };

    const weekTemplate = routines[goal] ? (routines[goal][daysPerWeek] || routines['build_muscle'][3]) : routines['build_muscle'][3];
    const generatedEvents = [];
    const today = new Date();

    for (let w = 0; w < 4; w++) { // 4 weeks
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + (w * 7) + d);
        const dayPlan = weekTemplate[d];
        
        generatedEvents.push({
          user_id: req.user.id,
          date: currentDate.toISOString().split('T')[0],
          title: dayPlan.title,
          exercises: dayPlan.rest ? null : JSON.stringify(dayPlan.ex),
          status: dayPlan.rest ? 'rest' : 'pending',
          duration_minutes: dayPlan.rest ? 0 : 45
        });
      }
    }

    await CalendarEvent.bulkCreate(generatedEvents, { ignoreDuplicates: true });
    
    const events = await CalendarEvent.findAll({
      where: { user_id: req.user.id, date: { [Op.gte]: today } },
      order: [['date', 'ASC']]
    });

    res.json({ plan: events, location: profile.training_location, goal: profile.goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error generating plan' });
  }
};

exports.getCalendarEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.findAll({
      where: { user_id: req.user.id },
      order: [['date', 'ASC']]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'completed', 'missed'
    
    const event = await CalendarEvent.findOne({ where: { id, user_id: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    event.status = status;
    await event.save();

    // Streak Logic
    if (status === 'completed') {
      const profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
      if (profile) {
        profile.current_streak += 1;
        profile.total_workouts += 1;
        if (profile.current_streak > profile.max_streak) {
          profile.max_streak = profile.current_streak;
        }
        await profile.save();
      }
    } else if (status === 'missed') {
      const profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
      if (profile) {
        profile.current_streak = 0;
        await profile.save();
      }
    }

    res.json({ message: 'Event updated', event });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
    const events = await CalendarEvent.findAll({ where: { user_id: req.user.id } });
    
    const completed = events.filter(e => e.status === 'completed').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const missed = events.filter(e => e.status === 'missed').length;
    const totalScheduled = completed + pending + missed;
    
    const complianceRate = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;

    res.json({
      current_streak: profile?.current_streak || 0,
      max_streak: profile?.max_streak || 0,
      total_workouts: profile?.total_workouts || 0,
      complianceRate,
      completed,
      missed
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const logs = await ProgressLog.findAll({ where: { user_id: req.user.id }, order: [['date', 'ASC']] });
    if (logs.length < 2) {
      return res.json({ message: "¡Sigue registrando tu peso para generar análisis automáticos!" });
    }
    
    const firstWeight = logs[0].weight_kg;
    const lastWeight = logs[logs.length - 1].weight_kg;
    const diff = (lastWeight - firstWeight).toFixed(1);

    if (diff < 0) {
      return res.json({ message: `¡Has perdido ${Math.abs(diff)} kg desde que comenzaste! Excelente progreso, continúa así.` });
    } else if (diff > 0) {
      return res.json({ message: `Tu peso ha cambiado en +${diff} kg. Sigue entrenando para alcanzar tu objetivo.` });
    } else {
      return res.json({ message: `Te has mantenido constante en tu peso. ¡Sigue dando lo mejor de ti!` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.saveTrainingSession = async (req, res) => {
  try {
    const { exercise_type, repetitions, duration_seconds, calories_burned, accuracy_percentage } = req.body;
    const session = await TrainingSession.create({
      user_id: req.user.id,
      exercise_type,
      repetitions,
      duration_seconds,
      calories_burned,
      accuracy_percentage
    });
    
    res.status(201).json({ message: 'Session saved', session });
  } catch (error) {
    console.error('Error saving training session:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTrainingSessions = async (req, res) => {
  try {
    const sessions = await TrainingSession.findAll({ 
      where: { user_id: req.user.id },
      order: [['date', 'DESC']]
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.submitSurveyResponse = async (req, res) => {
  try {
    const { q1, q2, q3, q4, q5, comments } = req.body;
    const user_id = req.user.id;

    if (!q1 || !q2 || !q3 || !q4 || !q5) {
      return res.status(400).json({ error: 'Todas las preguntas son obligatorias.' });
    }

    // Check if user already submitted
    let survey = await SurveyResponse.findOne({ where: { user_id } });
    if (survey) {
      return res.status(400).json({ error: 'Ya has enviado tu respuesta para esta encuesta piloto.' });
    }

    survey = await SurveyResponse.create({
      user_id,
      q1_accompaniment: q1,
      q2_adherence: q2,
      q3_usability: q3,
      q4_timbio_conn: q4,
      q5_general_satisfaction: q5,
      comments
    });

    res.status(201).json({ message: 'Encuesta enviada correctamente. ¡Gracias por participar!', survey });
  } catch (error) {
    console.error('Survey Submit Error:', error);
    res.status(500).json({ error: 'Error del servidor al enviar la encuesta.' });
  }
};

exports.getSurveyResults = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'trainer') {
      return res.status(403).json({ error: 'Acceso no autorizado.' });
    }

    const responses = await SurveyResponse.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'full_name', 'role'] }]
    });

    const count = responses.length;
    if (count === 0) {
      return res.json({ responses: [], stats: { count: 0, avgAccompaniment: 0, avgAdherence: 0, avgUsability: 0, avgTimbio: 0, avgSatisfaction: 0 } });
    }

    const sum1 = responses.reduce((acc, r) => acc + r.q1_accompaniment, 0);
    const sum2 = responses.reduce((acc, r) => acc + r.q2_adherence, 0);
    const sum3 = responses.reduce((acc, r) => acc + r.q3_usability, 0);
    const sum4 = responses.reduce((acc, r) => acc + r.q4_timbio_conn, 0);
    const sum5 = responses.reduce((acc, r) => acc + r.q5_general_satisfaction, 0);

    res.json({
      responses,
      stats: {
        count,
        avgAccompaniment: +(sum1 / count).toFixed(2),
        avgAdherence: +(sum2 / count).toFixed(2),
        avgUsability: +(sum3 / count).toFixed(2),
        avgTimbio: +(sum4 / count).toFixed(2),
        avgSatisfaction: +(sum5 / count).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get Survey Results Error:', error);
    res.status(500).json({ error: 'Error al obtener resultados de la encuesta.' });
  }
};
