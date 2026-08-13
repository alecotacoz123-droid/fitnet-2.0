import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService, groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Users, 
  PlusCircle, 
  User as UserIcon, 
  ChevronRight, 
  Loader2, 
  FileText,
  AlertCircle,
  Hash,
  Bot,
  Zap,
  X,
  Trophy,
  Flame,
  Activity,
  Award
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [searching, setSearching] = useState(false);
  
  // Groups State
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Create Group Form
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCat, setGroupCat] = useState('Fuerza');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Group Details Modal State
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (groupId) => {
    setLoadingDetails(true);
    try {
      const data = await groupService.getGroupDetail(groupId);
      setSelectedGroupDetails(data);
    } catch (err) {
      console.error('Error fetching group details:', err);
      alert(err.message || 'Error al obtener los detalles del grupo.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults({ users: [], posts: [] });
      return;
    }

    setSearching(true);
    try {
      const data = await postService.search(query);
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await groupService.requestJoin(groupId);
      fetchGroups();
    } catch (err) {
      console.error('Join request error:', err);
      alert(err.message || 'Error al solicitar ingreso.');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('¿Estás seguro de que deseas salir de este grupo?')) return;
    try {
      await groupService.leaveGroup(groupId);
      fetchGroups();
    } catch (err) {
      console.error('Leave group error:', err);
      alert(err.message || 'Error al salir del grupo.');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || !groupCat) {
      return setFormError('El nombre y la categoría son obligatorios.');
    }

    setFormError('');
    setFormSubmitting(true);

    try {
      await groupService.createGroup({
        name: groupName,
        description: groupDesc,
        category: groupCat
      });
      
      setGroupName('');
      setGroupDesc('');
      setShowCreateGroup(false);
      fetchGroups();
    } catch (err) {
      console.error('Error creating group:', err);
      setFormError(err.message || 'Error al crear el grupo.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Explorar</h1>
      </div>

      {/* AI Recommendations Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <Bot className="w-32 h-32 text-blue-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-blue-900 tracking-tight">Recomendados por tu Coach IA</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2].map((i) => (
              <div key={i} className="min-w-[200px] bg-white rounded-2xl p-4 border border-blue-100/50 shadow-sm flex items-center space-x-3 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Atleta {i}</p>
                  <p className="text-[10px] text-slate-500">Mismo objetivo que tú</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Buscar atletas, entrenadores, rutinas..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400"
          />
        </div>

        {/* Search Results Display */}
        {searchQuery.trim().length >= 2 && (
          <div className="pt-4 border-t border-slate-100 space-y-6">
            {searching ? (
              <div className="flex items-center justify-center py-6 space-x-2 text-slate-500 text-sm font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Buscando coincidencias...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Users Results */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                    Atletas y Entrenadores ({searchResults.users.length})
                  </h3>
                  
                  {searchResults.users.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No se hallaron resultados.</p>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.users.map(user => (
                        <div 
                          key={user.id}
                          onClick={() => navigate(`/profile/${user.username}`)}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              <SafeImage 
                                src={user.profile_picture} 
                                alt={user.username} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.full_name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">@{user.username}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Posts Results */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                    Publicaciones Destacadas ({searchResults.posts.length})
                  </h3>
                  
                  {searchResults.posts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No se hallaron resultados.</p>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.posts.map(post => (
                        <div 
                          key={post.id}
                          className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => navigate('/community')}
                        >
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{post.title}</p>
                          <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500 font-medium">
                            <span>@{post.User?.username}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Groups Directory Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Grupos Temáticos</span>
          </h3>

          {/* Only show Create Group to Trainers and Admins */}
          {['trainer', 'admin'].includes(user?.role) && (
            <button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className="flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer font-bold bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Grupo</span>
            </button>
          )}
        </div>

        {/* Create Group Form Card */}
        {showCreateGroup && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm animate-in slide-in-from-top-3 duration-200">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Nuevo Grupo Fitness</h4>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del grupo (ej. Fuerza Brutal) *"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
                
                <select
                  value={groupCat}
                  onChange={(e) => setGroupCat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="Fuerza">Fuerza & Musculación</option>
                  <option value="Cardio">Cardio & Resistencia</option>
                  <option value="Nutrición">Nutrición & Dieta</option>
                  <option value="Yoga">Yoga & Flexibilidad</option>
                  <option value="General">General</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Descripción corta de los objetivos del grupo..."
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {formSubmitting ? 'Creando...' : 'Crear Grupo'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Groups List */}
        {loadingGroups ? (
          <div className="flex items-center justify-center py-10 space-x-2 text-slate-500 text-sm font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Cargando directorio de grupos...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-3xl border border-slate-100 shadow-sm">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">No existen grupos temáticos. ¡Sé el primero en crear uno!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => {
              return (
                <div 
                  key={group.id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        {group.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        {group.membersCount}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-lg leading-tight pt-1">{group.name}</h4>
                    {group.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{group.description}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="text-[10px] text-slate-400">
                      <span>Creado por </span>
                      <span className="text-slate-700 font-bold">@{group.Creator?.username}</span>
                    </div>

                    {/* Join button states */}
                    {group.userJoinStatus === 'not_joined' ? (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-md"
                      >
                        Unirse al grupo
                      </button>
                    ) : group.userJoinStatus === 'pending' ? (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                        Pendiente
                      </span>
                    ) : group.userJoinStatus === 'approved' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(group.id)}
                          disabled={loadingDetails}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center space-x-1"
                        >
                          {loadingDetails ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Clasificación</span>
                          )}
                        </button>
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-100 transition-colors"
                          title="Clic para salir del grupo"
                        >
                          <span>Salir</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                        Rechazado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Group Detail / Leaderboard Modal */}
      {selectedGroupDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start shrink-0 bg-slate-50">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  {selectedGroupDetails.group.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{selectedGroupDetails.group.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedGroupDetails.group.description || 'Sin descripción'}</p>
              </div>
              <button 
                onClick={() => setSelectedGroupDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Group Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Entrenamientos</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{selectedGroupDetails.stats.totalWorkouts}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Calorías Totales</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{selectedGroupDetails.stats.totalCalories} kcal</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Racha Promedio</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{selectedGroupDetails.stats.avgStreak} días</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Racha Máxima</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{selectedGroupDetails.stats.topStreak} días</p>
                </div>
              </div>

              {/* Podium for top 3 members */}
              {selectedGroupDetails.rankedMembers.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                    Podio del Grupo
                  </h4>
                  <div className="flex justify-center items-end pt-8 pb-4 space-x-2 sm:space-x-4 max-w-md mx-auto">
                    {/* 2nd Place */}
                    {selectedGroupDetails.rankedMembers[1] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-300 shadow-md">
                            <SafeImage 
                              src={selectedGroupDetails.rankedMembers[1].profile_picture} 
                              alt={selectedGroupDetails.rankedMembers[1].username}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="absolute -top-3 -right-1 bg-slate-300 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                            2
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">
                          @{selectedGroupDetails.rankedMembers[1].username}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 mt-0.5">
                          {selectedGroupDetails.rankedMembers[1].points} pts
                        </p>
                        <div className="w-full bg-slate-200 h-16 rounded-t-xl mt-2 flex items-center justify-center border-t border-x border-slate-300/40">
                          <span className="text-sm font-black text-slate-500">2º</span>
                        </div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {selectedGroupDetails.rankedMembers[0] && (
                      <div className="flex flex-col items-center flex-1 z-10 scale-110">
                        <div className="relative mb-2">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg">
                            <SafeImage 
                              src={selectedGroupDetails.rankedMembers[0].profile_picture} 
                              alt={selectedGroupDetails.rankedMembers[0].username}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="absolute -top-3 -right-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                            1
                          </span>
                        </div>
                        <p className="text-xs font-black text-slate-900 truncate max-w-[80px]">
                          @{selectedGroupDetails.rankedMembers[0].username}
                        </p>
                        <p className="text-[10px] font-black text-blue-600 mt-0.5">
                          {selectedGroupDetails.rankedMembers[0].points} pts
                        </p>
                        <div className="w-full bg-amber-100 h-20 rounded-t-xl mt-2 flex items-center justify-center border-t border-x border-amber-200">
                          <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {selectedGroupDetails.rankedMembers[2] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-700/40 shadow-md">
                            <SafeImage 
                              src={selectedGroupDetails.rankedMembers[2].profile_picture} 
                              alt={selectedGroupDetails.rankedMembers[2].username}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="absolute -top-3 -right-1 bg-amber-700/55 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                            3
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">
                          @{selectedGroupDetails.rankedMembers[2].username}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 mt-0.5">
                          {selectedGroupDetails.rankedMembers[2].points} pts
                        </p>
                        <div className="w-full bg-orange-50 h-12 rounded-t-xl mt-2 flex items-center justify-center border-t border-x border-orange-100">
                          <span className="text-sm font-black text-amber-800">3º</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Members Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  Clasificación Completa
                </h4>
                <div className="space-y-2">
                  {selectedGroupDetails.rankedMembers.map((member, index) => (
                    <div 
                      key={member.user_id} 
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        member.user_id === user?.id 
                          ? 'bg-blue-50/50 border-blue-200' 
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-400 w-5 text-center">
                          {index + 1}
                        </span>
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          <SafeImage 
                            src={member.profile_picture} 
                            alt={member.username} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900">{member.full_name}</span>
                            {member.user_id === user?.id && (
                              <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-md uppercase">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-medium">@{member.username}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900 block">{member.points} pts</span>
                          <span className="text-[9px] text-slate-400 block font-medium">
                            {member.total_workouts} entrenos • {member.current_streak}d racha
                          </span>
                        </div>
                        <Award className={`w-4 h-4 ${
                          index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-200'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end items-center shrink-0">
              <button
                onClick={() => setSelectedGroupDetails(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
