import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, postService, fitnessService } from '../services/api';
import {
  User as UserIcon, Edit3,
  Settings, Loader2, Calendar, AlertCircle, FileText,
  Activity, Bot, TrendingUp, Target, Zap, Scale,
  Flame, Clock, Award, Shield, LogOut
} from 'lucide-react';
import { LevelBadge, XPBar, LevelRoadmap } from '../components/LevelBadge';
import { SafeImage } from '../components/SafeImage';

// ─── Helpers ───────────────────────────────────────────────────────────────
const translateGoal = (goal) => {
  switch (goal) {
    case 'lose_weight': return 'Perder Peso';
    case 'build_muscle': return 'Ganar Masa';
    case 'maintain_weight': return 'Mantener Peso';
    case 'improve_fitness': return 'Mejorar Condición';
    default: return 'No definido';
  }
};

const translateLevel = (level) => {
  switch (level) {
    case 'sedentary': return 'Sedentario';
    case 'lightly_active': return 'Poco Activo';
    case 'moderately_active': return 'Moderado';
    case 'very_active': return 'Muy Activo';
    case 'extra_active': return 'Atleta';
    default: return level || 'No definido';
  }
};

const getLevelColor = (level) => {
  switch (level) {
    case 'extra_active': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'very_active': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'moderately_active': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  }
};

// ─── Achievement Definitions ────────────────────────────────────────────────
const getAchievements = (fitnessProfile, joinDate) => {
  const workouts = fitnessProfile?.total_workouts || 0;
  const maxStreak = fitnessProfile?.max_streak || 0;
  const currentStreak = fitnessProfile?.current_streak || 0;
  const daysSinceJoin = joinDate
    ? Math.floor((new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return [
    {
      id: 'first_workout',
      emoji: '🏋️',
      title: 'Primer Entrenamiento',
      desc: 'Completaste tu primera sesión',
      unlocked: workouts >= 1,
      color: 'emerald',
    },
    {
      id: 'streak_7',
      emoji: '🔥',
      title: '7 Días en Racha',
      desc: 'Entrenaste 7 días seguidos',
      unlocked: maxStreak >= 7,
      color: 'orange',
    },
    {
      id: 'streak_30',
      emoji: '⚡',
      title: 'Mes Perfecto',
      desc: '30 días consecutivos de entrenamiento',
      unlocked: maxStreak >= 30,
      color: 'amber',
    },
    {
      id: 'workouts_100',
      emoji: '💯',
      title: '100 Entrenamientos',
      desc: 'Completaste 100 sesiones de entrenamiento',
      unlocked: workouts >= 100,
      color: 'blue',
    },
    {
      id: 'first_goal',
      emoji: '🎯',
      title: 'Primera Meta',
      desc: 'Configuraste tu perfil fitness IA',
      unlocked: !!fitnessProfile,
      color: 'indigo',
    },
    {
      id: 'streak_14',
      emoji: '👑',
      title: 'Miembro Destacado',
      desc: 'Racha activa de 14 días o más',
      unlocked: currentStreak >= 14,
      color: 'purple',
    },
  ];
};

// ─── Badge Component ─────────────────────────────────────────────────────────
const AchievementBadge = ({ achievement }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', glow: 'shadow-emerald-100' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', glow: 'shadow-orange-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', glow: 'shadow-amber-100' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', glow: 'shadow-blue-100' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', glow: 'shadow-indigo-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', glow: 'shadow-purple-100' },
  };
  const c = colorMap[achievement.color] || colorMap.blue;

  return (
    <div className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${
      achievement.unlocked
        ? `${c.bg} ${c.border} shadow-md ${c.glow}`
        : 'bg-slate-50 border-slate-100 opacity-40 grayscale'
    }`}>
      <span className="text-3xl mb-2">{achievement.emoji}</span>
      <p className="text-xs font-black text-slate-900 text-center leading-tight">{achievement.title}</p>
      <p className="text-[9px] text-slate-500 text-center mt-1 leading-snug">{achievement.desc}</p>
      {achievement.unlocked && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-[7px] text-white font-black">✓</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Profile Component ──────────────────────────────────────────────────
const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, refreshUser, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [fitnessProfile, setFitnessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePostTab, setActivePostTab] = useState('posts'); // reserved for future tabs

  const [showEditModal, setShowEditModal] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [editForm, setEditForm] = useState({
    full_name: '', bio: '', profile_picture: '',
    preferences: { goal: '', difficulty: 'beginner' }, password: ''
  });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const isOwnProfile = !username || (currentUser && currentUser.username === username);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let profileData;
        if (isOwnProfile) {
          profileData = await authService.getProfile();
          try {
            const fp = await fitnessService.getProfile();
            setFitnessProfile(fp);
          } catch (_) {}
        } else {
          profileData = await authService.getPublicProfile(username);
        }
        setProfile(profileData);

        const feedData = await postService.getFeed(1, 50);
        setPosts(feedData.posts.filter(p => p.user_id === profileData.id));

        setEditForm({
          full_name: profileData.full_name,
          bio: profileData.bio || '',
          profile_picture: profileData.profile_picture || '',
          preferences: profileData.preferences || { goal: '', difficulty: 'beginner' },
          password: ''
        });
      } catch (err) {
        setError('No se pudo cargar el perfil del usuario.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await authService.unfollow(profile.id);
        setProfile(prev => ({ ...prev, isFollowing: false, followersCount: prev.followersCount - 1 }));
      } else {
        await authService.follow(profile.id);
        setProfile(prev => ({ ...prev, isFollowing: true, followersCount: prev.followersCount + 1 }));
      }
    } catch (err) { console.error(err); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.full_name) return setEditError('El nombre completo es obligatorio.');
    setEditError('');
    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', editForm.full_name);
      formData.append('bio', editForm.bio);
      if (editForm.password) {
        formData.append('password', editForm.password);
      }
      
      if (profileImageFile) {
        formData.append('profile_picture', profileImageFile);
      } else {
        formData.append('profile_picture', editForm.profile_picture);
      }

      await authService.updateProfile(formData);
      await refreshUser();
      
      setProfileImageFile(null);
      setProfileImagePreview('');
      setShowEditModal(false);
      setLoading(true);
      const profileData = await authService.getProfile();
      setProfile(profileData);
      setLoading(false);
    } catch (err) {
      setEditError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-slate-500 text-sm font-medium">Cargando perfil atlético...</p>
    </div>
  );

  if (error || !profile) return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <h3 className="text-slate-900 font-bold text-lg">Error</h3>
      <p className="text-slate-500 mt-1">{error || 'El usuario no existe.'}</p>
      <button onClick={() => navigate('/')} className="mt-4 bg-slate-900 px-6 py-2.5 rounded-xl text-white font-bold">Volver a Inicio</button>
    </div>
  );

  const achievements = getAchievements(fitnessProfile, profile.created_at);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalWorkouts = fitnessProfile?.total_workouts || 0;
  const maxStreak = fitnessProfile?.max_streak || 0;
  const currentStreak = fitnessProfile?.current_streak || 0;
  const caloriesBurned = totalWorkouts * 320;
  const totalMinutes = totalWorkouts * 45;
  const totalHours = Math.floor(totalMinutes / 60);
  const levelColors = getLevelColor(fitnessProfile?.activity_level);

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 animate-in fade-in duration-500">

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <div className="relative">
        {/* Cover background */}
        <div className="h-40 md:h-52 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)'}}
          />
          <div className="absolute bottom-4 right-4 text-white/10">
            <Activity className="w-32 h-32" />
          </div>
          {/* Edit profile btn overlaying cover */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => navigate('/my-profile')}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Datos IA</span>
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile picture overlapping cover */}
        <div className="px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-12 mb-4">
            <div className="flex items-end space-x-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white overflow-hidden flex items-center justify-center shadow-xl shrink-0">
                <SafeImage 
                  src={profile.profile_picture} 
                  alt={profile.username} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Name + username visible on desktop alongside avatar */}
              <div className="hidden sm:block pb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-black text-slate-900">{profile.full_name}</h1>
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${
                    profile.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100'
                    : profile.role === 'trainer' ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {profile.role === 'admin' ? 'Admin' : profile.role === 'trainer' ? 'Coach' : 'Atleta'}
                  </span>
                  {fitnessProfile && <LevelBadge fitnessProfile={fitnessProfile} size="sm" />}
                </div>
                <p className="text-sm text-slate-500 font-medium">@{profile.username}</p>
              </div>
            </div>

            {/* Follow / Actions */}
            <div className="mt-4 sm:mt-0 sm:pb-2">
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black border transition-all ${
                    profile.isFollowing
                      ? 'bg-white text-slate-700 border-slate-200 hover:text-red-600 hover:border-red-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-md shadow-blue-600/20'
                  }`}
                >
                  {profile.isFollowing ? '✓ Siguiendo' : '+ Seguir'}
                </button>
              )}
            </div>
          </div>

          {/* Name on mobile */}
          <div className="sm:hidden mb-4">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h1 className="text-xl font-black text-slate-900">{profile.full_name}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${
                profile.role === 'admin' ? 'bg-red-50 text-red-600'
                : profile.role === 'trainer' ? 'bg-blue-50 text-blue-700'
                : 'bg-emerald-50 text-emerald-700'
              }`}>
                {profile.role === 'admin' ? 'Admin' : profile.role === 'trainer' ? 'Coach' : 'Atleta'}
              </span>
              {fitnessProfile && <LevelBadge fitnessProfile={fitnessProfile} size="xs" />}
            </div>
            <p className="text-sm text-slate-500 font-medium">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-xl">{profile.bio}</p>
          )}

          {/* Social stats row */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
            <div className="text-center">
              <p className="text-xl font-black text-slate-900">{profile.followersCount || 0}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Seguidores</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-xl font-black text-slate-900">{profile.followingCount || 0}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Siguiendo</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-xl font-black text-slate-900">{posts.length}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Publicaciones</p>
            </div>
            {fitnessProfile && (
              <>
                <div className="w-px h-8 bg-slate-100" />
                <div className="text-center">
                  <p className="text-xl font-black text-orange-500 flex items-center justify-center">
                    {currentStreak}<span className="text-sm ml-0.5">🔥</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Racha</p>
                </div>
              </>
            )}
            <div className="ml-auto flex items-center space-x-1 text-slate-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Desde {new Date(profile.created_at).toLocaleDateString('es', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6">

        {/* ── XP LEVEL BAR ─────────────────────────────────────── */}
        {fitnessProfile && <XPBar fitnessProfile={fitnessProfile} />}

        {/* ── FITNESS CARD ──────────────────────────────────────── */}
        {fitnessProfile ? (
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 70% 30%, #60a5fa 0%, transparent 60%)'}} />
            <div className="absolute -bottom-6 -right-6 opacity-[0.07]">
              <Shield className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-400/20">
                    <Activity className="w-4 h-4 text-blue-300" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-300">Tarjeta Fitness</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${levelColors.bg} ${levelColors.text} ${levelColors.border}`}>
                  {translateLevel(fitnessProfile.activity_level)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Peso', value: `${fitnessProfile.weight_kg} kg`, icon: Scale, color: 'blue' },
                  { label: 'Altura', value: `${fitnessProfile.height_cm} cm`, icon: TrendingUp, color: 'indigo' },
                  { label: 'IMC', value: fitnessProfile.calculated_bmi, icon: Target, color: 'purple' },
                  { label: 'TDEE', value: `${fitnessProfile.calculated_tdee} kcal`, icon: Flame, color: 'orange' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
                    <p className="text-[9px] text-white/50 font-black uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-lg font-black text-white leading-none">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    Objetivo: <span className="text-emerald-300">{translateGoal(fitnessProfile.goal)}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 ml-auto">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-xs text-white/40">{fitnessProfile.available_days} días/sem · {fitnessProfile.training_location}</span>
                </div>
              </div>
            </div>
          </div>
        ) : isOwnProfile ? (
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 text-white text-center shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 opacity-[0.07]">
              <Shield className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <Bot className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <p className="font-black text-lg mb-1">Activa tu Tarjeta Fitness</p>
              <p className="text-sm text-slate-400 mb-4">Configura tu perfil IA para ver tus métricas fitness aquí.</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20"
              >
                Configurar Perfil Fitness
              </button>
            </div>
          </div>
        ) : null}

        {/* ── STATS GRID ────────────────────────────────────────── */}
        {fitnessProfile && (
          <div>
            <h2 className="text-base font-black text-slate-900 mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Estadísticas de Rendimiento</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Entrenamientos', value: totalWorkouts, unit: 'sesiones', icon: Activity, gradient: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-400/20' },
                { label: 'Mejor Racha', value: maxStreak, unit: 'días', icon: Flame, gradient: 'from-orange-500 to-red-500', iconBg: 'bg-orange-400/20' },
                { label: 'Calorías', value: caloriesBurned.toLocaleString(), unit: 'kcal quemadas', icon: Zap, gradient: 'from-amber-400 to-orange-500', iconBg: 'bg-amber-400/20' },
                { label: 'Racha Actual', value: currentStreak, unit: 'días activos', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500', iconBg: 'bg-emerald-400/20' },
                { label: 'Tiempo Total', value: totalHours, unit: 'horas entrenadas', icon: Clock, gradient: 'from-indigo-500 to-purple-500', iconBg: 'bg-indigo-400/20' },
                { label: 'Dias/Semana', value: fitnessProfile.available_days, unit: 'disponibles', icon: Calendar, gradient: 'from-purple-500 to-pink-500', iconBg: 'bg-purple-400/20' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-4 text-white shadow-md relative overflow-hidden`}>
                  <div className={`${stat.iconBg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-black leading-none">{stat.value}</p>
                  <p className="text-[10px] text-white/70 font-bold mt-1 uppercase tracking-wider">{stat.unit}</p>
                  <p className="text-[9px] text-white/50 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACHIEVEMENTS ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Logros e Insignias</span>
            </h2>
            <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {unlockedCount}/{achievements.length} desbloqueados
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {achievements.map(a => <AchievementBadge key={a.id} achievement={a} />)}
          </div>
        </div>

        {/* ── LEVEL ROADMAP ─────────────────────────────────────── */}
        {fitnessProfile && <LevelRoadmap fitnessProfile={fitnessProfile} />}

        {/* ── POSTS ────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Publicaciones</span>
            <span className="text-xs text-slate-400 font-medium ml-1">({posts.length})</span>
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-3xl border border-slate-100 shadow-sm">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                {isOwnProfile ? 'Aún no has publicado nada.' : 'Este atleta no tiene publicaciones.'}
              </p>
              {isOwnProfile && (
                <button onClick={() => navigate('/community')} className="mt-3 text-blue-600 text-sm font-bold hover:underline">
                  Hacer mi primera publicación
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate('/community')}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 cursor-pointer transition-all group"
                >
                  {post.media_url ? (
                    <div className="h-40 bg-slate-100 relative overflow-hidden">
                      {post.media_type === 'video'
                        ? <video src={post.media_url} className="w-full h-full object-cover" muted />
                        : <img src={post.media_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{post.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{post.content}</p>
                    {post.ai_tags?.muscle_group && (
                      <span className="inline-block mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                        {post.ai_tags.muscle_group}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT MODAL ──────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Editar Perfil</span>
            </h3>

            {editError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center space-x-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4" /><span>{editError}</span>
              </div>
            )}

             <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center justify-center mb-6 space-y-2">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-inner flex items-center justify-center">
                  <SafeImage
                    src={profileImagePreview || editForm.profile_picture}
                    alt="Vista previa"
                    className="w-full h-full object-cover animate-in fade-in duration-200"
                  />
                  <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                    <span>Cambiar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileImageFile(file);
                          setProfileImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[9px] font-black uppercase text-slate-400">Presiona la foto para subir un archivo</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nombre Completo</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Biografía</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={editForm.password}
                  onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm" disabled={editSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl text-sm shadow-md shadow-blue-600/20 disabled:opacity-50" disabled={editSubmitting}>
                  {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
