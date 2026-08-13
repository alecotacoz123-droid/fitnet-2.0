// ─────────────────────────────────────────────────────────────
// FitNet Level System — XP & Gamification Engine
// ─────────────────────────────────────────────────────────────

export const LEVELS = [
  {
    level: 1,
    name: 'Principiante',
    minXP: 0,
    maxXP: 149,
    color: '#64748b',        // slate
    gradient: 'from-slate-400 to-slate-500',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-600',
    border: 'border-slate-200',
    emoji: '🌱',
    reward: 'Acceso a rutinas básicas de IA',
    description: 'Estás dando tus primeros pasos fitness.'
  },
  {
    level: 2,
    name: 'Activo',
    minXP: 150,
    maxXP: 499,
    color: '#22c55e',        // green
    gradient: 'from-green-400 to-emerald-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    border: 'border-emerald-200',
    emoji: '⚡',
    reward: 'Insignia "Activo" en tu perfil + retos grupales exclusivos',
    description: 'Tienes el hábito. ¡Sigue así!'
  },
  {
    level: 3,
    name: 'Constante',
    minXP: 500,
    maxXP: 1199,
    color: '#3b82f6',        // blue
    gradient: 'from-blue-400 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    border: 'border-blue-200',
    emoji: '🔥',
    reward: 'Análisis avanzado de IA + badge especial en comentarios',
    description: 'Tu constancia te diferencia del resto.'
  },
  {
    level: 4,
    name: 'Avanzado',
    minXP: 1200,
    maxXP: 2499,
    color: '#8b5cf6',        // purple
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    border: 'border-purple-200',
    emoji: '💎',
    reward: 'Acceso anticipado a funciones beta + coaching IA personalizado',
    description: 'Eres de los mejores atletas de FitNet.'
  },
  {
    level: 5,
    name: 'Elite',
    minXP: 2500,
    maxXP: Infinity,
    color: '#f59e0b',        // amber/gold
    gradient: 'from-amber-400 via-orange-400 to-red-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    border: 'border-amber-300',
    emoji: '👑',
    reward: 'Perfil verificado Elite + visible en ranking global de FitNet',
    description: 'Eres una leyenda de la plataforma.'
  }
];

// ─── XP Calculation ─────────────────────────────────────────
// All based on existing FitnessProfile + ProgressLog data
export const calculateXP = (fitnessProfile) => {
  if (!fitnessProfile) return 0;

  const workouts = fitnessProfile.total_workouts || 0;
  const maxStreak = fitnessProfile.max_streak || 0;
  const currentStreak = fitnessProfile.current_streak || 0;

  // Base XP
  let xp = 0;
  xp += workouts * 10;           // 10 XP per completed workout
  xp += maxStreak * 5;           // 5 XP per best streak day
  xp += currentStreak * 3;       // 3 XP per current streak day (bonus for keeping it)

  // Streak milestones
  if (maxStreak >= 7)  xp += 50;
  if (maxStreak >= 14) xp += 100;
  if (maxStreak >= 30) xp += 250;
  if (maxStreak >= 60) xp += 500;

  // Workout milestones
  if (workouts >= 10)  xp += 50;
  if (workouts >= 25)  xp += 100;
  if (workouts >= 50)  xp += 200;
  if (workouts >= 100) xp += 500;

  // Profile completion bonus
  if (fitnessProfile.goal)              xp += 20;
  if (fitnessProfile.height_cm)         xp += 10;
  if (fitnessProfile.weight_kg)         xp += 10;

  return Math.round(xp);
};

// ─── Get Level from XP ───────────────────────────────────────
export const getLevelFromXP = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
};

// ─── Get Next Level ──────────────────────────────────────────
export const getNextLevel = (currentLevel) => {
  const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
};

// ─── Progress % to next level ────────────────────────────────
export const getLevelProgress = (xp, currentLevel, nextLevel) => {
  if (!nextLevel) return 100; // Already at max level
  const rangeSize = nextLevel.minXP - currentLevel.minXP;
  const earned = xp - currentLevel.minXP;
  return Math.min(100, Math.round((earned / rangeSize) * 100));
};

// ─── XP to next level ────────────────────────────────────────
export const getXPToNextLevel = (xp, nextLevel) => {
  if (!nextLevel) return 0;
  return Math.max(0, nextLevel.minXP - xp);
};
