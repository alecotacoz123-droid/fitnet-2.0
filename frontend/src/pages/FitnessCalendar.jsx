import React, { useState, useEffect, useMemo } from 'react';
import { fitnessService } from '../services/api';
import { 
  Loader2, 
  Calendar as CalendarIcon, 
  Flame, 
  Trophy, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Info, 
  TrendingUp, 
  ChevronRight, 
  CalendarDays, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const FitnessCalendar = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'

  const fetchCalendarData = async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        fitnessService.getCalendarEvents(),
        fitnessService.getStats()
      ]);
      setEvents(eventsRes);
      setStats(statsRes);
      
      // Select today by default if there is an event
      const todayStr = new Date().toISOString().split('T')[0];
      const todayEvent = eventsRes.find(e => e.date === todayStr);
      if (todayEvent) {
        setSelectedDay(todayEvent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const markStatus = async (eventId, status) => {
    try {
      await fitnessService.markCalendarEvent(eventId, status);
      await fetchCalendarData();
    } catch (err) {
      console.error('Failed to update event', err);
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Generate 53 weeks (371 days) ending at the end of the current week (Sunday)
  const gridData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToSunday);
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (53 * 7 - 1)); // exactly 371 days

    const days = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }

    return { days, startDate, endDate };
  }, []);

  // Map events to date strings for O(1) lookup
  const eventsMap = useMemo(() => {
    const map = {};
    events.forEach(e => {
      map[e.date] = e;
    });
    return map;
  }, [events]);

  // Calculate intensity level for a day
  const getDayIntensity = (dateStr) => {
    const event = eventsMap[dateStr];
    if (!event || event.status !== 'completed') return 0;
    
    const mins = event.duration_minutes || 45;
    if (mins <= 30) return 1; // Actividad baja
    if (mins <= 45) return 2; // Actividad media
    return 3; // Actividad alta
  };

  // Month labels positioning
  const monthLabels = useMemo(() => {
    const labels = [];
    const { days } = gridData;
    for (let col = 0; col < 53; col++) {
      const day = days[col * 7];
      if (!day) continue;
      const monthName = day.toLocaleDateString('es-ES', { month: 'short' });
      const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('.', '');
      
      if (col === 0 || days[(col - 1) * 7].getMonth() !== day.getMonth()) {
        labels.push({ col, label: formattedMonth });
      }
    }
    return labels;
  }, [gridData]);

  // Calculate Monthly Summary Stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    const monthEvents = events.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getMonth() === currMonth && d.getFullYear() === currYear;
    });

    const completed = monthEvents.filter(e => e.status === 'completed').length;
    const pending = monthEvents.filter(e => e.status === 'pending').length;
    const missed = monthEvents.filter(e => e.status === 'missed').length;
    const total = completed + pending + missed;
    const compliance = total > 0 ? Math.round((completed / total) * 100) : 0;
    const minutes = monthEvents.reduce((acc, e) => acc + (e.status === 'completed' ? (e.duration_minutes || 45) : 0), 0);

    return {
      completed,
      compliance,
      minutes,
      name: now.toLocaleDateString('es-ES', { month: 'long' })
    };
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => e.status === 'pending')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  const pastEvents = useMemo(() => {
    return events
      .filter(e => e.date < todayStr || e.status === 'completed' || e.status === 'missed')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [events, todayStr]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-slate-500 font-semibold text-lg animate-pulse">Optimizando tu calendario de actividad...</span>
      </div>
    );
  }

  // Weekday initials
  const weekdays = ['Lun', '', 'Mié', '', 'Vie', '', 'Dom'];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-3.5 rounded-2xl text-white shadow-md shadow-blue-500/10">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Calendario de Actividad
            </h2>
            <p className="text-sm text-slate-500 font-medium">Visualiza tu constancia y desbloquea rachas imparables</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 self-start md:self-auto text-xs text-slate-500 font-bold">
          <span>Menos</span>
          <div className="w-3 h-3 rounded-[3px] bg-slate-100 border border-slate-200"></div>
          <div className="w-3 h-3 rounded-[3px] bg-emerald-100 border border-emerald-200"></div>
          <div className="w-3 h-3 rounded-[3px] bg-emerald-300 border border-emerald-400"></div>
          <div className="w-3 h-3 rounded-[3px] bg-emerald-500 border border-emerald-600"></div>
          <span>Más</span>
        </div>
      </div>

      {/* Gamified Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Racha Actual */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <Flame className="absolute -right-4 -bottom-4 w-20 h-20 text-orange-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10 flex items-center">
            <Flame className="w-4 h-4 mr-1 text-orange-500 animate-pulse" /> Racha Actual
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight relative z-10">
            {stats?.current_streak || 0}{' '}
            <span className="text-xs font-bold text-slate-400">días 🔥</span>
          </p>
        </div>

        {/* Mejor Racha */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <Trophy className="absolute -right-4 -bottom-4 w-20 h-20 text-amber-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10 flex items-center">
            <Trophy className="w-4 h-4 mr-1 text-amber-500" /> Mejor Racha
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight relative z-10">
            {stats?.max_streak || 0}{' '}
            <span className="text-xs font-bold text-slate-400">récord</span>
          </p>
        </div>

        {/* Porcentaje Cumplimiento */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <TrendingUp className="absolute -right-4 -bottom-4 w-20 h-20 text-green-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" /> Cumplimiento
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-2 tracking-tight relative z-10">
            {stats?.complianceRate || 0}%
          </p>
        </div>

        {/* Total Entrenamientos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <Activity className="absolute -right-4 -bottom-4 w-20 h-20 text-blue-50 group-hover:scale-110 transition-transform duration-300" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10 flex items-center">
            <Activity className="w-4 h-4 mr-1 text-blue-500" /> Completados
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight relative z-10">
            {stats?.total_workouts || 0}{' '}
            <span className="text-xs font-bold text-slate-400">total</span>
          </p>
        </div>

        {/* Este Mes (Summary) */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-tr from-slate-900 to-slate-800 p-5 rounded-3xl text-white shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
            <CalendarDays className="w-24 h-24 text-white" />
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider relative z-10">
            En {monthlyStats.name}
          </p>
          <p className="text-3xl font-black mt-2 tracking-tight relative z-10">
            {monthlyStats.completed}{' '}
            <span className="text-xs font-bold text-slate-300">sesiones</span>
          </p>
          <div className="mt-2 flex items-center gap-2 relative z-10">
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
              {monthlyStats.compliance}% Check
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {Math.round(monthlyStats.minutes / 60)}h total
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid Calendar (GitHub Contribution Chart style) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center">
            <CalendarDays className="w-4 h-4 mr-2 text-indigo-500" />
            Mapa de Calor Anual
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            Mostrando últimos 365 días
          </span>
        </div>

        {/* Heatmap Grid container for desktop & mobile scroll */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="min-w-[840px] flex flex-col space-y-2 select-none pr-2">
            
            {/* Months Row */}
            <div className="flex text-[10px] font-bold text-slate-400 h-4 relative">
              {/* Padding offset for weekday labels */}
              <div className="w-8 shrink-0"></div>
              <div className="flex-1 grid grid-cols-53 gap-[3px] relative">
                {monthLabels.map(({ col, label }) => (
                  <span
                    key={col}
                    style={{ gridColumnStart: col + 1 }}
                    className="absolute top-0 transform translate-x-1"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid Container */}
            <div className="flex">
              {/* Weekday Row Header Labels */}
              <div className="w-8 shrink-0 flex flex-col justify-between text-[10px] font-bold text-slate-400 pr-2 pt-0.5 pb-1 h-[116px]">
                {weekdays.map((day, idx) => (
                  <div key={idx} className="h-3.5 flex items-center justify-end">
                    {day}
                  </div>
                ))}
              </div>

              {/* 7 rows x 53 cols Grid */}
              <div className="flex-1 grid grid-flow-col grid-rows-7 gap-[3.5px] h-[116px]">
                {gridData.days.map((day) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const intensity = getDayIntensity(dateStr);
                  const isFuture = dateStr > todayStr;
                  const isToday = dateStr === todayStr;
                  const event = eventsMap[dateStr];

                  let colorClass = "bg-slate-100 border border-slate-200/40 hover:border-slate-400";
                  if (event && event.status === 'rest') {
                    colorClass = "bg-blue-50 border border-blue-100 hover:border-blue-300";
                  } else if (intensity === 1) {
                    colorClass = "bg-emerald-100 border border-emerald-200 hover:border-emerald-400";
                  } else if (intensity === 2) {
                    colorClass = "bg-emerald-300 border border-emerald-400 hover:border-emerald-500";
                  } else if (intensity === 3) {
                    colorClass = "bg-emerald-500 border border-emerald-600 hover:border-emerald-700";
                  } else if (isFuture) {
                    colorClass = "bg-slate-50/50 border border-dashed border-slate-200";
                  }

                  const isSelected = selectedDay && selectedDay.date === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        if (event) {
                          setSelectedDay(event);
                        } else {
                          setSelectedDay({
                            date: dateStr,
                            title: 'Sin entrenamiento programado',
                            status: isFuture ? 'upcoming' : 'rest',
                            duration_minutes: 0,
                            isNoEvent: true
                          });
                        }
                      }}
                      className={`w-3.5 h-3.5 rounded-[3px] transition-all relative outline-none cursor-pointer ${colorClass} ${
                        isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 z-10' : ''
                      } ${isToday ? 'ring-1 ring-blue-500 ring-offset-[1px]' : ''}`}
                      title={`${day.toLocaleDateString('es-ES', { dateStyle: 'medium' })}: ${
                        event ? `${event.title} (${event.status})` : 'Sin actividad'
                      }`}
                    />
                  );
                })}
              </div>

            </div>

          </div>
        </div>

        {/* Selected Day Info Board */}
        {selectedDay && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 animate-in slide-in-from-top-2 duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-bold text-xs uppercase ${
                selectedDay.status === 'completed' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : selectedDay.status === 'missed'
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : selectedDay.status === 'rest'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <span>{new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span className="text-base leading-none font-black">{new Date(selectedDay.date + 'T00:00:00').getDate()}</span>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  {selectedDay.status === 'rest' ? 'Descanso Activo' : selectedDay.title}
                  {selectedDay.date === todayStr && (
                    <span className="bg-blue-600 text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded">HOY</span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 font-medium flex items-center mt-0.5">
                  {selectedDay.status === 'completed' && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" /> Completado</>}
                  {selectedDay.status === 'missed' && <><XCircle className="w-3.5 h-3.5 text-red-500 mr-1" /> No completado</>}
                  {selectedDay.status === 'pending' && <><Info className="w-3.5 h-3.5 text-amber-500 mr-1" /> Pendiente • {selectedDay.duration_minutes} min</>}
                  {selectedDay.status === 'rest' && <>Recuperación y descanso muscular</>}
                  {selectedDay.isNoEvent && <>Sin sesiones registradas</>}
                </p>
              </div>
            </div>

            {/* Quick Actions inside Selected Day Board */}
            {selectedDay.status === 'pending' && (
              <div className="flex space-x-2 w-full md:w-auto">
                <button 
                  onClick={() => markStatus(selectedDay.id, 'missed')}
                  className="flex-1 md:flex-none px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors"
                >
                  Saltar
                </button>
                <button 
                  onClick={() => markStatus(selectedDay.id, 'completed')}
                  className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar Listo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs Layout: Upcoming vs History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'upcoming' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pendientes y Futuros
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'history' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Historial de Actividad
            </button>
          </div>

          <div className="flex items-center text-[10px] font-bold text-slate-400 gap-3">
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1"></div> Listo</span>
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1"></div> Pendiente</span>
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1"></div> Descanso</span>
          </div>
        </div>

        {/* Tab Panel Content */}
        <div className="divide-y divide-slate-100">
          {activeTab === 'upcoming' ? (
            upcomingEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-sm">No tienes entrenamientos pendientes</p>
                <p className="text-xs text-slate-400 mt-1">Genera o programa más rutinas desde la sección de planes.</p>
              </div>
            ) : (
              upcomingEvents.map(event => {
                const isToday = event.date === todayStr;
                return (
                  <div key={event.id} className="p-5 hover:bg-slate-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-bold text-xs ${
                        isToday 
                          ? 'border-amber-300 bg-amber-50 text-amber-600 ring-2 ring-amber-400/20' 
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}>
                        <span className="uppercase text-[9px] opacity-75">{new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                        <span className="text-lg font-black leading-none">{new Date(event.date + 'T00:00:00').getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                          {event.title}
                          {isToday && <span className="bg-blue-600 text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm shadow-blue-500/20 animate-pulse">Hoy</span>}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          Duración estimada: {event.duration_minutes} min • Pendiente de inicio
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 shrink-0">
                      <button 
                        onClick={() => markStatus(event.id, 'missed')}
                        className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors"
                      >
                        Saltar
                      </button>
                      <button 
                        onClick={() => markStatus(event.id, 'completed')}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm shadow-emerald-500/10 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Completar
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            pastEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-sm">Aún no hay historial registrado</p>
                <p className="text-xs mt-1">Tus entrenamientos completados u omitidos aparecerán aquí.</p>
              </div>
            ) : (
              pastEvents.map(event => {
                let badgeStyle = "border-slate-200 bg-white text-slate-500";
                if (event.status === 'completed') badgeStyle = "border-emerald-200 bg-emerald-50 text-emerald-600";
                if (event.status === 'missed') badgeStyle = "border-red-200 bg-red-50 text-red-600";
                if (event.status === 'rest') badgeStyle = "border-blue-200 bg-blue-50 text-blue-600";

                return (
                  <div key={event.id} className="p-5 hover:bg-slate-50/40 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-bold text-xs ${badgeStyle}`}>
                        <span className="uppercase text-[9px] opacity-75">{new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                        <span className="text-lg font-black leading-none">{new Date(event.date + 'T00:00:00').getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">
                          {event.status === 'rest' ? 'Descanso Activo' : event.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                          {event.status === 'completed' && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completado</>}
                          {event.status === 'missed' && <><XCircle className="w-3.5 h-3.5 text-red-400" /> Omitido</>}
                          {event.status === 'rest' && <>Recuperación Muscular</>}
                          {event.status === 'pending' && <>No completado</>}
                          {event.status !== 'rest' && ` • ${event.duration_minutes} min`}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-400">
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

      </div>

    </div>
  );
};

export default FitnessCalendar;
