import React, { useState, useEffect } from 'react';
import { fitnessService } from '../services/api';
import { Loader2, Calendar, Dumbbell, MapPin, Target, Clock, Activity, AlertCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const TrainingPlan = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPlan = async (regenerate = false) => {
    if (regenerate) setRegenerating(true);
    else setLoading(true);
    try {
      const result = await fitnessService.getTrainingPlan(regenerate);
      setData(result);
      setSelectedWeek(0);
    } catch (err) {
      setError('No se pudo generar tu plan. Asegúrate de haber completado el Onboarding.');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleRegenerate = () => {
    if (window.confirm('¿Deseas generar nuevas rutinas personalizadas basadas en tu perfil actual para las próximas 4 semanas?')) {
      fetchPlan(true);
    }
  };

  if (loading) return <div className="flex flex-col justify-center items-center py-20 space-y-3"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /><span className="text-slate-500 font-medium">Cargando tu rutina inteligente...</span></div>;
  if (error) return (
    <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 m-8 p-10 shadow-sm flex flex-col items-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <p>{error}</p>
    </div>
  );
  if (!data || !data.plan) return null;

  const totalWeeks = Math.ceil(data.plan.length / 7);
  const weekPlan = data.plan.slice(selectedWeek * 7, (selectedWeek + 1) * 7);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 border border-blue-100 shadow-sm">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rutina Inteligente</h2>
            <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500 mt-1.5 font-bold">
              <span className="flex items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-200"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400"/> <span className="capitalize">{data.location}</span></span>
              <span className="flex items-center bg-blue-50 px-2 py-1 rounded-md border border-blue-100 text-blue-700"><Target className="w-3.5 h-3.5 mr-1"/> <span className="capitalize">{data.goal.replace('_', ' ')}</span></span>
            </div>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/10 cursor-pointer self-start sm:self-auto shrink-0"
        >
          {regenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Generar Nuevo Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Week Selector Tabs */}
      {totalWeeks > 1 && (
        <div className="flex space-x-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-hide">
          {Array.from({ length: totalWeeks }).map((_, wIndex) => (
            <button
              key={wIndex}
              onClick={() => {
                setSelectedWeek(wIndex);
                setExpandedDay(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                selectedWeek === wIndex
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Semana {wIndex + 1}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {weekPlan.map((dayPlan, index) => {
          const isRest = dayPlan.status === 'rest';
          const isExpanded = expandedDay === index;
          const exercises = dayPlan.exercises ? JSON.parse(dayPlan.exercises) : [];
          
          return (
            <div key={dayPlan.id || index} className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-sm ${isRest ? 'border-slate-100 bg-slate-50/50 opacity-75' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}`}>
              <div 
                className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${!isRest ? 'cursor-pointer' : ''}`}
                onClick={() => !isRest && setExpandedDay(isExpanded ? null : index)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${isRest ? 'bg-slate-200 text-slate-500 border border-slate-300' : 'bg-blue-600 text-white border border-blue-700 shadow-blue-600/20'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className={`font-black text-lg leading-tight ${isRest ? 'text-slate-500' : 'text-slate-900'}`}>{isRest ? 'Día de Descanso' : dayPlan.title}</h3>
                    <p className={`text-sm font-bold mt-0.5 flex items-center space-x-1.5 ${isRest ? 'text-slate-400' : 'text-green-600'}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(dayPlan.date).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </p>
                  </div>
                </div>
                {!isRest && (
                  <button 
                    className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isExpanded ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'}`}
                  >
                    <span>{isExpanded ? 'Ocultar' : 'Ver Ejercicios'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
              
              {/* Expanded Exercises Section */}
              {isExpanded && !isRest && exercises.length > 0 && (
                <div className="bg-slate-50 p-5 sm:p-6 border-t border-slate-100">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center">
                    <Activity className="w-4 h-4 mr-1.5 text-blue-600" />
                    Ejercicios del día
                  </h4>
                  <div className="space-y-3">
                    {exercises.map((ex, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-blue-200 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-bold text-slate-900 text-base">{ex.n}</h5>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${ex.d === 'Alto' ? 'bg-red-50 text-red-600 border-red-100' : ex.d === 'Medio' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{ex.d}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-md inline-flex border border-slate-100"><Activity className="w-3 h-3 text-blue-500"/> <span>{ex.m}</span></p>
                        </div>
                        
                        <div className="flex items-center space-x-3 sm:space-x-6 text-sm shrink-0 bg-slate-50 p-2 sm:px-4 rounded-xl border border-slate-100">
                          <div className="text-center px-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-0.5">Series</p>
                            <p className="text-slate-900 font-black text-lg">{ex.s}</p>
                          </div>
                          <div className="w-px h-8 bg-slate-200"></div>
                          <div className="text-center px-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-0.5">Reps</p>
                            <p className="text-blue-600 font-black text-lg">{ex.r}</p>
                          </div>
                          <div className="w-px h-8 bg-slate-200"></div>
                          <div className="text-center px-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-0.5 flex items-center justify-center"><Clock className="w-3 h-3 mr-0.5"/>Descanso</p>
                            <p className="text-slate-700 font-black text-sm pt-0.5">{ex.rest}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingPlan;
