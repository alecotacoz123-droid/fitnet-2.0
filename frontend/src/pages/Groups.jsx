import React, { useState, useEffect } from 'react';
import { groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeImage } from '../components/SafeImage';
import {
  Users, Check, X, Loader2, AlertCircle, Clock,
  User as UserIcon, Trash2, UserMinus, Trophy, Zap,
  Flame, Activity, ChevronRight, ArrowLeft, Star,
  Target, Medal, TrendingUp, Crown, Shield
} from 'lucide-react';

// ─────────────────────────────────────────────
// Helper: translate fitness goal
// ─────────────────────────────────────────────
const translateGoal = (goal) => {
  switch (goal) {
    case 'lose_weight': return 'Perder Peso';
    case 'build_muscle': return 'Ganar Masa';
    case 'maintain_weight': return 'Mantener';
    case 'improve_fitness': return 'Mejorar Condición';
    default: return 'No definido';
  }
};

// ─────────────────────────────────────────────
// Medal badge for top-3
// ─────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm font-black text-slate-400">#{rank}</span>;
};

// ─────────────────────────────────────────────
// Group Detail Panel
// ─────────────────────────────────────────────
const GroupDetailPanel = ({ groupId, isOwner, onBack, onRemoveMember, onDeleteGroup }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ranking');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await groupService.getGroupDetail(groupId);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!data) return (
    <div className="text-center py-12 text-slate-500">No se pudo cargar el grupo.</div>
  );

  const { group, rankedMembers, stats } = data;
  const top3 = rankedMembers.slice(0, 3);

  // Mock group challenge (gamification static)
  const groupChallenge = {
    title: 'Reto 30 Días Sin Fallar',
    description: 'Entrena al menos 4 días esta semana. Cada sesión suma 10 puntos.',
    daysLeft: 12,
    progress: Math.min(100, Math.round((stats.totalWorkouts / Math.max(stats.totalMembers * 4, 1)) * 100))
  };

  const tabs = [
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'stats', label: 'Estadísticas', icon: Activity },
    { id: 'challenge', label: 'Reto', icon: Target },
    { id: 'members', label: 'Miembros', icon: Users },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a mis grupos</span>
      </button>

      {/* Group Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/20">
        <div className="absolute -right-6 -top-6 opacity-10">
          <Users className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 mb-3 inline-block">
                {group.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-black leading-tight mb-1">{group.name}</h2>
              {group.description && (
                <p className="text-blue-100 text-sm max-w-lg leading-relaxed">{group.description}</p>
              )}
            </div>
            {isOwner && (
              <button
                onClick={() => onDeleteGroup(group.id)}
                className="p-2 bg-white/10 hover:bg-red-500/30 rounded-xl border border-white/20 transition-colors"
                title="Eliminar grupo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-bold">{stats.totalMembers} miembros</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold">Racha máx. {stats.topStreak} días</span>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-sm font-bold">{stats.totalCalories.toLocaleString()} kcal grupales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-5">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-900">Top 3 de la Semana</h3>
          </div>
          <div className="flex items-end justify-center gap-3">
            {/* Silver - 2nd */}
            {top3[1] && (
              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center mb-2">
                  <SafeImage src={top3[1].profile_picture} alt={top3[1].username} className="w-full h-full object-cover" />
                </div>
                <span className="text-lg">🥈</span>
                <p className="text-xs font-bold text-slate-900 text-center truncate w-full mt-1">{top3[1].full_name?.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-500 font-bold">{top3[1].points} pts</p>
                <div className="h-16 w-full bg-slate-200 rounded-t-xl mt-2 flex items-end justify-center pb-1">
                  <span className="text-[10px] font-black text-slate-500">2°</span>
                </div>
              </div>
            )}
            {/* Gold - 1st */}
            {top3[0] && (
              <div className="flex flex-col items-center flex-1 max-w-[120px] -mb-2">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-300 overflow-hidden flex items-center justify-center mb-2 shadow-lg shadow-amber-200">
                  <SafeImage src={top3[0].profile_picture} alt={top3[0].username} className="w-full h-full object-cover" />
                </div>
                <span className="text-xl">🥇</span>
                <p className="text-sm font-black text-slate-900 text-center truncate w-full mt-1">{top3[0].full_name?.split(' ')[0]}</p>
                <p className="text-[11px] text-amber-600 font-black">{top3[0].points} pts</p>
                <div className="h-24 w-full bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-xl mt-2 flex items-end justify-center pb-1 shadow-md">
                  <span className="text-[10px] font-black text-amber-800">1°</span>
                </div>
              </div>
            )}
            {/* Bronze - 3rd */}
            {top3[2] && (
              <div className="flex flex-col items-center flex-1 max-w-[110px]">
                <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-orange-200 overflow-hidden flex items-center justify-center mb-2">
                  <SafeImage src={top3[2].profile_picture} alt={top3[2].username} className="w-full h-full object-cover" />
                </div>
                <span className="text-lg">🥉</span>
                <p className="text-xs font-bold text-slate-900 text-center truncate w-full mt-1">{top3[2].full_name?.split(' ')[0]}</p>
                <p className="text-[10px] text-orange-500 font-bold">{top3[2].points} pts</p>
                <div className="h-10 w-full bg-orange-200 rounded-t-xl mt-2 flex items-end justify-center pb-1">
                  <span className="text-[10px] font-black text-orange-600">3°</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: RANKING ── */}
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {rankedMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Nadie tiene puntos todavía.
            </div>
          ) : rankedMembers.map((member, idx) => (
            <div key={member.user_id} className={`flex items-center space-x-4 p-4 ${idx === 0 ? 'bg-amber-50/50' : ''}`}>
              <div className="w-8 text-center shrink-0">
                <RankBadge rank={idx + 1} />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                <SafeImage src={member.profile_picture} alt={member.username} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{member.full_name}</p>
                <p className="text-[11px] text-slate-500">@{member.username}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-blue-600">{member.points} pts</p>
                <p className="text-[10px] text-slate-400">{member.total_workouts} sesiones · {member.current_streak}d racha</p>
              </div>
              {isOwner && member.user_id !== group.creator_id && (
                <button
                  onClick={() => onRemoveMember(group.id, member.user_id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Expulsar"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: ESTADÍSTICAS ── */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Miembros Activos', value: stats.totalMembers, icon: Users, color: 'blue' },
              { label: 'Entrenamientos', value: stats.totalWorkouts, icon: Activity, color: 'green' },
              { label: 'Kcal Grupales', value: stats.totalCalories.toLocaleString(), icon: Flame, color: 'orange' },
              { label: 'Racha Promedio', value: `${stats.avgStreak} días`, icon: Zap, color: 'amber' },
              { label: 'Racha Más Alta', value: `${stats.topStreak} días`, icon: TrendingUp, color: 'purple' },
              { label: 'Con Perfil IA', value: stats.totalMembers, icon: Shield, color: 'indigo' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${s.color}-50`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                </div>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar per member */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-black text-slate-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Rendimiento Individual</span>
            </h4>
            <div className="space-y-4">
              {rankedMembers.map((member, idx) => {
                const maxWorkouts = rankedMembers[0]?.total_workouts || 1;
                const pct = maxWorkouts > 0 ? Math.round((member.total_workouts / maxWorkouts) * 100) : 0;
                return (
                  <div key={member.user_id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-700">{member.full_name?.split(' ')[0]}</span>
                      <span className="text-xs font-bold text-blue-600">{member.total_workouts} sesiones</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: RETO GRUPAL ── */}
      {activeTab === 'challenge' && (
        <div className="space-y-4">
          {/* Active Challenge Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Target className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                  Reto Activo
                </span>
                <span className="bg-amber-400/30 text-amber-100 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {groupChallenge.daysLeft} días restantes
                </span>
              </div>
              <h3 className="text-xl font-black mb-2">{groupChallenge.title}</h3>
              <p className="text-emerald-100 text-sm mb-5 leading-relaxed">{groupChallenge.description}</p>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Progreso Grupal</span>
                  <span>{groupChallenge.progress}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${groupChallenge.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Points system explanation */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-black text-slate-900 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span>Sistema de Puntos</span>
            </h4>
            <div className="space-y-3">
              {[
                { action: 'Completar una sesión', pts: '+10 pts', color: 'blue' },
                { action: 'Mantener racha diaria', pts: '+5 pts/día', color: 'amber' },
                { action: 'Alcanzar racha de 7 días', pts: '+50 pts bonus', color: 'emerald' },
                { action: 'Completar el reto grupal', pts: '+100 pts', color: 'purple' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl bg-${item.color}-50 border border-${item.color}-100`}>
                  <span className="text-sm font-medium text-slate-700">{item.action}</span>
                  <span className={`text-sm font-black text-${item.color}-600`}>{item.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recompensas */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-black text-slate-900 mb-4 flex items-center space-x-2">
              <Medal className="w-5 h-5 text-indigo-500" />
              <span>Recompensas del Grupo</span>
            </h4>
            <div className="space-y-3">
              {[
                { badge: '🏅', title: 'Atleta Constante', desc: '7 días de racha consecutiva', unlocked: true },
                { badge: '⚡', title: 'Velocista', desc: '10 sesiones en el mes', unlocked: stats.totalWorkouts >= 10 },
                { badge: '🔥', title: 'En Llamas', desc: 'Racha de 14 días', unlocked: false },
                { badge: '👑', title: 'Leyenda del Grupo', desc: '1° en el ranking 4 semanas', unlocked: false },
              ].map((reward, i) => (
                <div key={i} className={`flex items-center space-x-4 p-3 rounded-xl border transition-all ${reward.unlocked ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <span className="text-2xl">{reward.badge}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{reward.title}</p>
                    <p className="text-xs text-slate-500">{reward.desc}</p>
                  </div>
                  {reward.unlocked
                    ? <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Desbloqueado</span>
                    : <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Bloqueado</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: MIEMBROS ── */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {rankedMembers.map((member, idx) => (
            <div key={member.user_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    <SafeImage src={member.profile_picture} alt={member.username} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-black text-slate-900">{member.full_name}</p>
                      {idx < 3 && <RankBadge rank={idx + 1} />}
                    </div>
                    <p className="text-[11px] text-slate-500">@{member.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                    {member.points} pts
                  </span>
                  {isOwner && member.user_id !== group.creator_id && (
                    <button
                      onClick={() => onRemoveMember(group.id, member.user_id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Expulsar"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {member.hasProfile ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                    <p className="text-xs font-black text-slate-900">{member.total_workouts}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sesiones</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
                    <p className="text-xs font-black text-amber-700">{member.current_streak}d</p>
                    <p className="text-[9px] text-amber-500 uppercase font-bold tracking-wider">Racha</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
                    <p className="text-xs font-black text-blue-700">{member.weight_kg ? `${member.weight_kg}kg` : '-'}</p>
                    <p className="text-[9px] text-blue-400 uppercase font-bold tracking-wider">Peso</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-xs text-slate-400 italic">Sin Perfil Fitness IA configurado</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN Groups Page
// ─────────────────────────────────────────────
const Groups = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const fetchData = async () => {
    try {
      const pendingData = await groupService.getPendingRequests();
      setRequests(pendingData);
      const groupsData = await groupService.getMyGroups();
      setMyGroups(groupsData);
    } catch (err) {
      console.error(err);
      setError('No se pudieron obtener los datos de grupos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (groupId, userId, status) => {
    try {
      await groupService.manageMember(groupId, userId, status);
      fetchData();
      showToast(status === 'approved' ? 'Solicitud aprobada correctamente.' : 'Solicitud rechazada correctamente.', 'success');
    } catch (err) {
      showToast('Error al procesar solicitud: ' + (err.message || 'Inténtalo más tarde.'), 'error');
    }
  };

  const handleRemoveMember = async (groupId, userId) => {
    if (!window.confirm('¿Expulsar a este atleta del grupo?')) return;
    try {
      await groupService.removeMember(groupId, userId);
      fetchData();
      setSelectedGroupId(null);
      showToast('Miembro expulsado del grupo.', 'success');
    } catch (err) {
      showToast(err.message || 'Error al expulsar al miembro.', 'error');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('ALERTA: ¿Eliminar este grupo definitivamente?')) return;
    try {
      await groupService.deleteGroup(groupId);
      setSelectedGroupId(null);
      fetchData();
      showToast('Grupo eliminado exitosamente.', 'success');
    } catch (err) {
      showToast(err.message || 'Error al eliminar el grupo.', 'error');
    }
  };

  if (user && !['trainer', 'admin'].includes(user.role)) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-slate-900 font-bold text-lg">Acceso Denegado</h3>
        <p className="text-slate-500 mt-1">Esta sección de gestión de grupos solo está disponible para Entrenadores y Administradores.</p>
      </div>
    );
  }

  if (selectedGroupId) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8">
        <GroupDetailPanel
          groupId={selectedGroupId}
          isOwner={myGroups.some(g => g.id === selectedGroupId)}
          onBack={() => setSelectedGroupId(null)}
          onRemoveMember={handleRemoveMember}
          onDeleteGroup={handleDeleteGroup}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-slate-200 pb-4">
        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 border border-blue-100 shadow-sm">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Administración de Grupos</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">Gestión de membresías, ranking y retos grupales</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Solicitudes Pendientes ({requests.length})</span>
        </h3>

        {loading ? (
          <div className="flex justify-center items-center py-12 space-x-2 text-slate-500 text-sm font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Cargando...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center space-x-2 font-medium">
            <AlertCircle className="w-5 h-5" /><span>{error}</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-3xl border border-slate-100 shadow-sm">
            <div className="inline-flex items-center justify-center bg-green-50 p-3 rounded-full border border-green-100 mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium">No hay solicitudes pendientes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={`${req.group_id}-${req.user_id}`}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    <SafeImage src={req.User?.profile_picture} alt={req.User?.username} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">{req.User?.full_name}</span>
                      <span className="text-xs font-medium text-slate-400">@{req.User?.username}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Solicita unirse a:</span>
                      <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{req.Group?.name}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{req.Group?.category}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(req.group_id, req.user_id, 'rejected')}
                    className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <X className="w-4 h-4" /><span>Rechazar</span>
                  </button>
                  <button
                    onClick={() => handleAction(req.group_id, req.user_id, 'approved')}
                    className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/20"
                  >
                    <Check className="w-4 h-4" /><span>Aprobar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Groups Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Trophy className="w-4 h-4 text-blue-600" />
          <span>Mis Grupos ({myGroups.length})</span>
        </h3>

        {!loading && myGroups.length === 0 ? (
          <p className="text-sm text-slate-500 italic font-medium">No has creado ningún grupo aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myGroups.map((group) => {
              const memberCount = group.GroupMembers?.length || 0;
              const totalWorkouts = group.GroupMembers?.reduce((s, m) => s + (m.User?.FitnessProfile?.total_workouts || 0), 0) || 0;
              const topStreak = group.GroupMembers?.reduce((max, m) => Math.max(max, m.User?.FitnessProfile?.current_streak || 0), 0) || 0;

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group"
                >
                  {/* Group card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg mb-2 inline-block">
                        {group.category}
                      </span>
                      <h4 className="text-base font-black text-slate-900 leading-tight">{group.name}</h4>
                      {group.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{group.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className="text-sm font-black text-slate-900">{memberCount}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Miembros</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
                      <p className="text-sm font-black text-blue-700">{totalWorkouts}</p>
                      <p className="text-[9px] text-blue-400 uppercase font-bold">Sesiones</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
                      <p className="text-sm font-black text-amber-700">{topStreak}d</p>
                      <p className="text-[9px] text-amber-400 uppercase font-bold">Top Racha</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Ver ranking y retos</span>
                    <div className="flex -space-x-1.5">
                      {group.GroupMembers?.slice(0, 4).map((m, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border border-white overflow-hidden flex items-center justify-center">
                          <SafeImage src={m.User?.profile_picture} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {memberCount > 4 && (
                        <div className="w-6 h-6 rounded-full bg-blue-100 border border-white flex items-center justify-center">
                          <span className="text-[8px] font-black text-blue-600">+{memberCount - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
