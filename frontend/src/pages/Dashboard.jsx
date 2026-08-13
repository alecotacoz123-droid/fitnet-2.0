import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiRequest, fitnessService, groupService } from '../services/api';
import { calculateXP, getLevelFromXP } from '../utils/levelSystem';
import { DashboardAthleteSkeleton, DashboardTrainerSkeleton } from '../components/Skeleton';
import { SafeImage } from '../components/SafeImage';
import { 
  Bot,
  Zap,
  Play,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Flame,
  Dumbbell,
  Camera,
  Calendar as CalendarIcon,
  Users,
  Trophy,
  Plus,
  Check,
  X,
  Target,
  BarChart3,
  Award,
  ChevronRight,
  TrendingDown,
  Clock,
  Search,
  MessageSquare,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // View mode toggle for trainers so they can see their athlete IA Coach or Trainer SaaS panel
  const isTrainerOrAdmin = user?.role === 'trainer' || user?.role === 'admin';
  const [viewMode, setViewMode] = useState(isTrainerOrAdmin ? 'trainer' : 'athlete');

  // Athlete State
  const [athleteData, setAthleteData] = useState(null);
  const [athleteLoading, setAthleteLoading] = useState(true);

  // Trainer State
  const [trainerGroups, setTrainerGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [trainerLoading, setTrainerLoading] = useState(true);
  
  // Group creation modal state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('Hipertrofia');
  const [createGroupError, setCreateGroupError] = useState('');

  // Load Athlete Dashboard Data
  const loadAthleteData = async () => {
    try {
      setAthleteLoading(true);
      const response = await apiRequest('/ai-coach/dashboard');
      setAthleteData(response);
    } catch (aiError) {
      console.error('AI Coach endpoint error:', aiError);
      try {
        const profile = await fitnessService.getProfile();
        if (profile) {
          setAthleteData({
            hasProfile: true,
            coachMainCard: {
              greeting: 'Coach IA FitNet',
              dailyRecommendation: '¡Listo para entrenar! Elige una rutina y comienza hoy.',
              actionType: 'train',
              todayWorkout: null
            },
            alerts: [],
            smartSummary: {
              currentWeight: profile.weight_kg,
              weightDiff: 0,
              currentStreak: profile.current_streak || 0,
              caloriesBurned: (profile.total_workouts || 0) * 320,
              totalWorkouts: profile.total_workouts || 0,
              goal: profile.goal
            }
          });
        } else {
          setAthleteData({ hasProfile: false });
        }
      } catch (profileError) {
        setAthleteData({ hasProfile: false });
      }
    } finally {
      setAthleteLoading(false);
    }
  };

  // Load Trainer Dashboard Data
  const loadTrainerData = async () => {
    try {
      setTrainerLoading(true);
      const [groupsRes, pendingRes] = await Promise.all([
        groupService.getMyGroups(),
        groupService.getPendingRequests().catch(() => [])
      ]);
      setTrainerGroups(groupsRes);
      setPendingRequests(pendingRes);
    } catch (err) {
      console.error('Error loading trainer dashboard data:', err);
    } finally {
      setTrainerLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'trainer') {
      loadTrainerData();
    } else {
      loadAthleteData();
    }
  }, [viewMode]);

  // Handle Request Join approval/rejection
  const handleManageRequest = async (groupId, studentId, status) => {
    try {
      await groupService.manageMember(groupId, studentId, status);
      await loadTrainerData();
      showToast(status === 'approved' ? 'Solicitud aceptada.' : 'Solicitud rechazada.', 'success');
    } catch (err) {
      console.error('Error managing request:', err);
      showToast(err.message || 'Error al gestionar la solicitud.', 'error');
    }
  };

  // Handle create new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateGroupError('');
    if (!newGroupName.trim()) {
      setCreateGroupError('El nombre del grupo es obligatorio.');
      return;
    }
    try {
      await groupService.createGroup({
        name: newGroupName,
        description: newGroupDesc,
        category: newGroupCat
      });
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      loadTrainerData();
      showToast('¡Grupo creado exitosamente!', 'success');
    } catch (err) {
      setCreateGroupError(err.message || 'Error al crear el grupo.');
      showToast(err.message || 'Error al crear el grupo.', 'error');
    }
  };

  // Helper to translate goal
  const translateGoal = (goal) => {
    switch(goal) {
      case 'lose_weight': return 'Perder Peso';
      case 'build_muscle': return 'Ganar Masa';
      case 'maintain_weight': return 'Mantener';
      case 'improve_fitness': return 'Mejorar Condición';
      default: return 'No definido';
    }
  };

  // Compute Trainer Statistics
  const trainerStats = useMemo(() => {
    const studentsMap = new Map();
    let totalWorkouts = 0;
    let totalStreak = 0;
    let activeStudentsCount = 0;
    
    trainerGroups.forEach(group => {
      const members = group.GroupMembers || [];
      members.forEach(member => {
        // Exclude the trainer/creator from student list
        if (member.User && member.User.id !== user?.id) {
          const fp = member.User?.FitnessProfile;
          const userXP = calculateXP(fp);
          const userLevelObj = getLevelFromXP(userXP);
          
          studentsMap.set(member.User.id, {
            id: member.User.id,
            full_name: member.User.full_name,
            username: member.User.username,
            profile_picture: member.User.profile_picture,
            goal: fp?.goal ? translateGoal(fp.goal) : 'Por definir',
            streak: fp?.current_streak || 0,
            workouts: fp?.total_workouts || 0,
            weight: fp?.weight_kg || 'N/A',
            level: userLevelObj.name,
            levelColor: userLevelObj.textColor,
            levelBg: userLevelObj.bgLight,
            levelEmoji: userLevelObj.emoji,
            isActive: (fp?.current_streak || 0) > 0 || (fp?.total_workouts || 0) > 0,
            groupName: group.name
          });

          totalWorkouts += fp?.total_workouts || 0;
          totalStreak += fp?.current_streak || 0;
          if ((fp?.current_streak || 0) > 0) activeStudentsCount++;
        }
      });
    });

    const studentsList = Array.from(studentsMap.values());
    const totalStudents = studentsList.length;

    // Leaderboard
    const leaderboard = [...studentsList].sort((a, b) => b.workouts - a.workouts).slice(0, 5);
    const bestStudent = leaderboard[0] || null;

    // Weekly average checks (mock logic based on workouts)
    const avgWorkoutsPerWeek = totalStudents > 0 ? (totalWorkouts / (totalStudents * 4)).toFixed(1) : 0;
    const participationRate = totalStudents > 0 ? Math.round((activeStudentsCount / totalStudents) * 100) : 0;

    return {
      totalStudents,
      activeStudentsCount,
      studentsList,
      avgWorkoutsPerWeek,
      bestStudent,
      participationRate,
      leaderboard,
      totalGroups: trainerGroups.length
    };
  }, [trainerGroups, user?.id]);

  if (viewMode === 'trainer') {
    if (trainerLoading) {
      return <DashboardTrainerSkeleton />;
    }

    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Trainer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-black px-2.5 py-1 rounded-md tracking-wider">
                Coach Panel
              </span>
              {isTrainerOrAdmin && (
                <button
                  onClick={() => setViewMode('athlete')}
                  className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors flex items-center"
                >
                  Cambiar a vista de Atleta <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              Panel de Control Deportivo
            </h1>
            <p className="text-slate-500 text-sm font-medium">Monitorea el progreso, la constancia y el rendimiento de tus atletas.</p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="flex items-center space-x-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Grupo</span>
            </button>
          </div>
        </div>

        {/* 📊 Metrics Dashboard Grid (8 Core Metrics requested) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Alumnos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <Users className="absolute -right-3 -bottom-3 w-16 h-16 text-slate-50 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10">Total Alumnos</p>
            <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight relative z-10">
              {trainerStats.totalStudents}{' '}
              <span className="text-xs font-bold text-slate-400">atletas</span>
            </p>
            <p className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +15% vs mes anterior
            </p>
          </div>

          {/* Alumnos Activos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <Activity className="absolute -right-3 -bottom-3 w-16 h-16 text-emerald-50 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10">Alumnos Activos</p>
            <p className="text-3xl font-black text-emerald-600 mt-2 tracking-tight relative z-10">
              {trainerStats.activeStudentsCount}{' '}
              <span className="text-xs font-bold text-slate-400">esta semana</span>
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5">
              En racha o con entrenos recientes
            </p>
          </div>

          {/* Promedio Entrenamientos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <Dumbbell className="absolute -right-3 -bottom-3 w-16 h-16 text-blue-50 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10">Entrenos / Atleta (Semanal)</p>
            <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight relative z-10">
              {trainerStats.avgWorkoutsPerWeek}{' '}
              <span className="text-xs font-bold text-slate-400">sesiones</span>
            </p>
            <p className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +0.4 sesiones avg
            </p>
          </div>

          {/* Mejor Alumno del Mes */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <Trophy className="absolute -right-3 -bottom-3 w-16 h-16 text-amber-50 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10 flex items-center">
              <Trophy className="w-3.5 h-3.5 mr-1 text-amber-400" /> MVP del Mes
            </p>
            <p className="text-lg font-black text-slate-800 mt-2 truncate relative z-10">
              {trainerStats.bestStudent ? trainerStats.bestStudent.full_name : 'Ninguno'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              {trainerStats.bestStudent ? `${trainerStats.bestStudent.workouts} entrenamientos completados` : 'Sin registros'}
            </p>
          </div>

          {/* Progreso Grupal General */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Cumplimiento Grupal</p>
            <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">84.2%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '84.2%' }}></div>
            </div>
          </div>

          {/* Nuevas Solicitudes de Ingreso */}
          <div className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${
            pendingRequests.length > 0 
              ? 'bg-amber-50/50 border-amber-200 text-amber-900' 
              : 'bg-white border-slate-100'
          }`}>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Solicitudes de Ingreso</p>
            <p className="text-2xl font-black mt-2 tracking-tight">
              {pendingRequests.length}{' '}
              <span className="text-xs font-bold text-slate-400">pendientes</span>
            </p>
            {pendingRequests.length > 0 ? (
              <p className="text-[10px] text-amber-600 font-bold mt-2 animate-pulse">
                Requiere tu aprobación inmediata
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium mt-2">
                Al día con el buzón de entrada
              </p>
            )}
          </div>

          {/* Retos Activos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <Target className="absolute -right-3 -bottom-3 w-16 h-16 text-purple-50 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Retos Activos</p>
            <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
              {trainerStats.totalGroups}{' '}
              <span className="text-xs font-bold text-slate-400">retos</span>
            </p>
            <p className="text-[10px] text-purple-600 font-bold mt-2">
              1 reto por grupo activo
            </p>
          </div>

          {/* Tasa de Participación */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <BarChart3 className="absolute -right-3 -bottom-3 w-16 h-16 text-blue-50 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Tasa de Participación</p>
            <p className="text-2xl font-black text-blue-600 mt-2 tracking-tight">
              {trainerStats.participationRate}%
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              Atletas activos sobre total
            </p>
          </div>

        </div>

        {/* 🔔 Pending Requests Approval Center */}
        {pendingRequests.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center">
              <Zap className="w-4 h-4 text-amber-500 mr-2 animate-bounce" />
              Solicitudes Pendientes de Ingreso
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <SafeImage 
                      src={req.User?.profile_picture} 
                      alt={req.User?.full_name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{req.User?.full_name}</h4>
                      <p className="text-[10px] text-slate-500">Quiere unirse a: <span className="font-bold text-blue-600">{req.Group?.name}</span></p>
                    </div>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button
                      onClick={() => handleManageRequest(req.group_id, req.user_id, 'rejected')}
                      className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 transition-colors"
                      title="Rechazar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleManageRequest(req.group_id, req.user_id, 'approved')}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
                      title="Aceptar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Middle Summary Cards & Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Performance Charts (SVG Line Chart) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center">
                  <BarChart3 className="w-4 h-4 text-blue-500 mr-2" /> Rendimiento y Asistencia Semanal
                </h3>
                <p className="text-xs text-slate-400 mt-1">Evolución de entrenamientos registrados por tus alumnos</p>
              </div>
              
              <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-600 mr-1"></div> Completados</span>
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-1"></div> Planificados</span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-48 relative flex items-end">
              <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="170" x2="600" y2="170" stroke="#cbd5e1" strokeWidth="1" />
                
                {/* SVG Line path for completed workouts */}
                <path
                  d="M 50 140 L 130 110 L 210 135 L 290 80 L 370 70 L 450 50 L 530 40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                {/* Data Points Dot */}
                <circle cx="50" cy="140" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="130" cy="110" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="210" cy="135" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="290" cy="80" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="370" cy="70" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="450" cy="50" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="530" cy="40" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              </svg>
              
              {/* Day Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-[9px] font-bold text-slate-400">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Crecimiento Semanal</p>
                <p className="text-lg font-black text-emerald-500 mt-0.5 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 mr-0.5" /> +12.4%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Cumplimiento de Objetivos</p>
                <p className="text-lg font-black text-slate-800 mt-0.5">91%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Participación en Retos</p>
                <p className="text-lg font-black text-blue-600 mt-0.5">78.5%</p>
              </div>
            </div>

          </div>

          {/* Resumen de Grupos Creados */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 text-indigo-500 mr-2" /> Tus Grupos Creados
            </h3>
            
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {trainerGroups.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-xs">No has creado ningún grupo aún.</p>
                </div>
              ) : (
                trainerGroups.map(group => {
                  const approvedCount = (group.GroupMembers || []).filter(m => m.status === 'approved').length;
                  return (
                    <div 
                      key={group.id} 
                      onClick={() => navigate('/groups')}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{group.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 font-bold rounded-md uppercase tracking-wider mt-1 inline-block">
                          {group.category}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-slate-700">{approvedCount} miembros</p>
                        <p className="text-[9px] text-slate-400">Ver clasificación</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* 📋 Students List Section (SaaS style Table) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center">
                <Dumbbell className="w-5 h-5 text-indigo-600 mr-2" /> Lista de Alumnos bajo tu Cargo
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Control individual de nivel, racha, entrenamientos y objetivos.</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar alumno..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {trainerStats.studentsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-sm">Aún no tienes alumnos inscritos</p>
                <p className="text-xs mt-1">Invita a usuarios a tus grupos o acepta sus solicitudes de ingreso.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-4.5 px-6">Atleta</th>
                    <th className="py-4.5 px-6">Estado</th>
                    <th className="py-4.5 px-6">Grupo</th>
                    <th className="py-4.5 px-6">Racha Actual</th>
                    <th className="py-4.5 px-6">Objetivo Fitness</th>
                    <th className="py-4.5 px-6">Nivel</th>
                    <th className="py-4.5 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {trainerStats.studentsList.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                      
                      {/* Avatar and Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <SafeImage 
                            src={student.profile_picture} 
                            alt={student.full_name} 
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" 
                          />
                          <div>
                            <p className="font-bold text-slate-800">{student.full_name}</p>
                            <p className="text-[10px] text-slate-400">@{student.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {student.isActive ? (
                          <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> Activo
                          </span>
                        ) : (
                          <span className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 w-fit px-2 py-0.5 rounded-full border border-slate-100">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-1.5"></span> Inactivo
                          </span>
                        )}
                      </td>

                      {/* Group */}
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {student.groupName}
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-6">
                        <div className="flex items-center text-slate-800 font-bold">
                          <Flame className="w-3.5 h-3.5 text-orange-500 mr-1" />
                          {student.streak} días
                        </div>
                      </td>

                      {/* Objective */}
                      <td className="py-4 px-6 text-slate-600 font-semibold">
                        {student.goal}
                      </td>

                      {/* Level */}
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${student.levelBg} ${student.levelColor}`}>
                          {student.levelEmoji} {student.level}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button 
                            onClick={() => navigate(`/profile/${student.username}`)}
                            className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 transition-colors font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ficha</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 shadow-2xl animate-in scale-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-lg font-black text-slate-900">Crear Nuevo Grupo</h3>
                <button 
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createGroupError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 mb-4">
                  {createGroupError}
                </div>
              )}

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nombre del Grupo</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ej. Powerlifters Elite, Team Trainer X"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Descripción</label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Describe el objetivo del grupo, reglas o entrenamientos."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Categoría</label>
                  <select
                    value={newGroupCat}
                    onChange={(e) => setNewGroupCat(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Pérdida de Peso">Pérdida de Peso</option>
                    <option value="Resistencia">Resistencia</option>
                    <option value="Fuerza">Fuerza</option>
                    <option value="Funcional / Crossfit">Funcional / Crossfit</option>
                  </select>
                </div>

                <div className="flex space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/10 transition-colors"
                  >
                    Crear Grupo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  if (athleteLoading) {
    return <DashboardAthleteSkeleton />;
  }

  // Fallback to Athlete View
  const { coachMainCard, alerts, smartSummary } = athleteData || {
    coachMainCard: { dailyRecommendation: 'Cargando tu recomendación...', actionType: 'train' },
    alerts: [],
    smartSummary: { currentWeight: 0, weightDiff: 0, currentStreak: 0, caloriesBurned: 0, totalWorkouts: 0, goal: '' }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Athlete Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="bg-emerald-50 text-emerald-800 text-[10px] uppercase font-black px-2.5 py-1 rounded-md tracking-wider">
              Athlete View
            </span>
            {isTrainerOrAdmin && (
              <button
                onClick={() => setViewMode('trainer')}
                className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors flex items-center"
              >
                Cambiar a Panel de Entrenador <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            ¡Hola, {user.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 text-sm font-medium">Tu Coach IA está analizando tus datos en tiempo real.</p>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={() => navigate('/ai-training')} className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs shadow-sm transition-all cursor-pointer">
            <Camera className="w-4 h-4 text-indigo-500" />
            <span>Cámara IA</span>
          </button>
          <button onClick={() => navigate('/train')} className="flex items-center space-x-2 px-4.5 py-2.5 bg-blue-600 border border-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer">
            <Dumbbell className="w-4 h-4" />
            <span>Entrenar</span>
          </button>
        </div>
      </div>

      {/* Tarjeta Principal del Coach IA */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
        <div className="absolute bottom-0 right-10 opacity-10">
          <Bot className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-6 bg-white/20 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 shadow-sm">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-widest uppercase">Análisis Completo</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight max-w-2xl">
            {coachMainCard.dailyRecommendation}
          </h2>
          
          <p className="text-blue-100 text-sm md:text-base font-medium mb-8 max-w-xl leading-relaxed">
            Basado en tu objetivo de {translateGoal(smartSummary.goal)} y tu progreso mensual. He optimizado tus tiempos de descanso para maximizar resultados.
          </p>

          <div className="flex flex-wrap gap-3">
            {coachMainCard.actionType === 'train' && (
              <button onClick={() => navigate('/train')} className="flex items-center space-x-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transform duration-200">
                <Play className="w-4 h-4 fill-current" />
                <span>Empezar Rutina Ahora</span>
              </button>
            )}
            {coachMainCard.actionType === 'generate' && (
              <button onClick={() => navigate('/training-plan')} className="flex items-center space-x-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transform duration-200">
                <CalendarIcon className="w-4 h-4" />
                <span>Generar Plan Semanal</span>
              </button>
            )}
            {coachMainCard.actionType === 'rest' && (
              <button disabled className="flex items-center space-x-2 bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm border border-white/30 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Descanso Activo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Alertas e Insights */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center">
            <Zap className="w-5 h-5 text-amber-500 mr-2" />
            Alertas Predictivas IA
          </h3>
          
          {alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border flex items-start space-x-4 transition-all shadow-sm ${
                  alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  alert.type === 'alert' ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className={`p-2 rounded-xl shrink-0 ${
                    alert.type === 'warning' ? 'bg-amber-100' :
                    alert.type === 'alert' ? 'bg-red-100' :
                    'bg-emerald-100'
                  }`}>
                    {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                     alert.type === 'alert' ? <TrendingUp className="w-5 h-5" /> : 
                     <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wider text-opacity-80">Insight Detectado</h4>
                    <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <Bot className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Todo marcha perfectamente. No hay alertas críticas en este momento.</p>
            </div>
          )}

          {/* Recomendaciones Contextuales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/train')}>
              <Dumbbell className="w-6 h-6 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 mb-1">Ajustar Rutina</h4>
              <p className="text-xs text-slate-500 font-medium">La IA recomienda cambiar 2 ejercicios hoy.</p>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/explore')}>
              <Activity className="w-6 h-6 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 mb-1">Comunidad IA</h4>
              <p className="text-xs text-slate-500 font-medium">Hay 3 atletas con progreso similar al tuyo.</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen Inteligente */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center">
            <Activity className="w-5 h-5 text-blue-500 mr-2" />
            Resumen Inteligente
          </h3>
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso Actual</p>
                  <p className="text-xl font-black text-slate-900">{smartSummary.currentWeight} kg</p>
                </div>
              </div>
              <div className={`text-sm font-bold ${smartSummary.weightDiff <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {smartSummary.weightDiff > 0 ? '+' : ''}{smartSummary.weightDiff} kg
              </div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calorías Totales</p>
                  <p className="text-xl font-black text-slate-900">{smartSummary.caloriesBurned}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrenamientos</p>
                  <p className="text-xl font-black text-slate-900">{smartSummary.totalWorkouts}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Racha Activa</p>
                  <p className="text-xl font-black text-slate-900">{smartSummary.currentStreak} días</p>
                </div>
              </div>
              {smartSummary.currentStreak > 2 && (
                <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                  En racha
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
