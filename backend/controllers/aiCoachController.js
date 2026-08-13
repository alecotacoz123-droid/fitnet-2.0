const { FitnessProfile, ProgressLog, CalendarEvent } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch fitness profile — required
    const profile = await FitnessProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.json({
        hasProfile: false,
        message: 'Por favor configura tu Perfil Fitness IA para habilitar tu Coach IA.'
      });
    }

    // 2. Build date strings (SQLite stores dates as 'YYYY-MM-DD' strings)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const sevenDaysAgoDate = new Date(now);
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().split('T')[0];

    // 3. Fetch recent calendar events (last 7 days)
    let recentEvents = [];
    try {
      recentEvents = await CalendarEvent.findAll({
        where: {
          user_id: userId,
          date: { [Op.gte]: sevenDaysAgoStr }
        },
        order: [['date', 'DESC']]
      });
    } catch (e) {
      console.error('Error fetching calendar events:', e.message);
    }

    // 4. Fetch weight logs
    let logs = [];
    try {
      logs = await ProgressLog.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'ASC']]
      });
    } catch (e) {
      console.error('Error fetching progress logs:', e.message);
    }

    // ── A. Inactivity / Overtraining Detection ──────────────────
    const completedLast7Days = recentEvents.filter(e => e.status === 'completed');
    const lastCompleted = recentEvents.find(e => e.status === 'completed');

    let daysSinceLastWorkout = null;
    if (lastCompleted) {
      const lastDate = new Date(lastCompleted.date);
      const today = new Date(todayStr);
      daysSinceLastWorkout = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    }

    let activityAlert = null;
    if (completedLast7Days.length >= 6) {
      activityAlert = {
        type: 'warning',
        message: 'Has entrenado casi todos los días esta semana. Considera un descanso activo para evitar el sobreentrenamiento.'
      };
    } else if (daysSinceLastWorkout !== null && daysSinceLastWorkout >= 3) {
      activityAlert = {
        type: 'warning',
        message: `Llevas ${daysSinceLastWorkout} días sin entrenar. ¡Es momento de reactivarte!`
      };
    } else if (completedLast7Days.length >= 2) {
      activityAlert = {
        type: 'success',
        message: `Excelente semana: ${completedLast7Days.length} sesiones completadas. ¡Sigue así!`
      };
    }

    // ── B. Weight Progress Detection ─────────────────────────────
    let progressAlert = null;
    let weightDiff = 0;
    if (logs.length >= 2) {
      const firstWeight = parseFloat(logs[0].weight_kg);
      const lastWeight = parseFloat(logs[logs.length - 1].weight_kg);
      weightDiff = parseFloat((lastWeight - firstWeight).toFixed(1));

      if (profile.goal === 'lose_weight' && weightDiff < 0) {
        progressAlert = {
          type: 'success',
          message: `¡Excelente! Has perdido ${Math.abs(weightDiff)} kg desde que comenzaste.`
        };
      } else if (profile.goal === 'lose_weight' && weightDiff > 0) {
        progressAlert = {
          type: 'alert',
          message: `Tu peso subió ${weightDiff} kg. Revisa tus hábitos y aumenta la intensidad.`
        };
      } else if (profile.goal === 'build_muscle' && weightDiff > 0) {
        progressAlert = {
          type: 'success',
          message: `¡Vas bien! Has ganado ${weightDiff} kg de masa total.`
        };
      }
    }

    // ── C. Today's Recommendation ─────────────────────────────────
    let todayEvent = null;
    try {
      todayEvent = await CalendarEvent.findOne({
        where: {
          user_id: userId,
          date: todayStr
        }
      });
    } catch (e) {
      console.error('Error fetching today event:', e.message);
    }

    let dailyRecommendation = '';
    let actionType = 'generate';

    if (!todayEvent) {
      const streak = profile.current_streak || 0;
      if (streak > 0) {
        dailyRecommendation = `¡Llevas ${streak} días en racha! No la rompas hoy — genera una rutina.`;
      } else {
        dailyRecommendation = 'No tienes rutina planificada hoy. ¡Déjame generar una para ti!';
      }
      actionType = 'generate';
    } else if (todayEvent.status === 'completed') {
      dailyRecommendation = '¡Entrenamiento del día completado! Aprovecha para estirar y recuperar.';
      actionType = 'rest';
    } else if (todayEvent.status === 'rest') {
      dailyRecommendation = 'Hoy es tu día de descanso programado. La recuperación es clave.';
      actionType = 'rest';
    } else {
      dailyRecommendation = `Hoy toca: ${todayEvent.title}. ¡Tu Coach IA te espera!`;
      actionType = 'train';
    }

    // 5. Respond
    return res.json({
      hasProfile: true,
      coachMainCard: {
        greeting: 'Coach IA FitNet',
        dailyRecommendation,
        actionType,
        todayWorkout: todayEvent ? todayEvent.title : null
      },
      alerts: [activityAlert, progressAlert].filter(Boolean),
      smartSummary: {
        currentWeight: parseFloat(profile.weight_kg) || 0,
        weightDiff,
        currentStreak: profile.current_streak || 0,
        caloriesBurned: (profile.total_workouts || 0) * 320,
        totalWorkouts: profile.total_workouts || 0,
        goal: profile.goal
      }
    });

  } catch (error) {
    console.error('Fatal error in AI Coach Dashboard:', error);
    res.status(500).json({ error: 'Server error generating AI dashboard' });
  }
};
