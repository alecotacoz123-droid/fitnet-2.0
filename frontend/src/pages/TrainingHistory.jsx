import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Camera, Calendar, Flame, Clock, Target, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrainingHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiRequest('/fitness/sessions');
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="flex flex-col justify-center items-center py-20 space-y-3"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /><span className="text-slate-500 font-medium">Cargando historial...</span></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 border border-blue-100 shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Historial IA</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Registro de tus sesiones de Visión por Computadora</p>
          </div>
        </div>
        <Link to="/ai-training" className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/20">
          <Camera className="w-5 h-5" />
          <span>Nueva Sesión</span>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
          <div className="bg-slate-50 p-6 rounded-full mb-6 border border-slate-100">
            <Camera className="w-16 h-16 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Sin Entrenamientos Aún</h3>
          <p className="text-slate-500 font-medium max-w-md mb-8">Enciende tu cámara y deja que la Inteligencia Artificial cuente tus repeticiones de sentadillas o flexiones automáticamente.</p>
          <Link to="/ai-training" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors">
            <span>Iniciar ahora</span> <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Target className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg capitalize">{session.exercise_type}</h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{new Date(session.date).toLocaleString('es-ES', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 md:gap-6 bg-slate-50 p-3 sm:px-6 rounded-2xl border border-slate-100">
                <div className="text-center md:text-left px-2">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5 flex items-center justify-center md:justify-start space-x-1"><Target className="w-3 h-3"/> <span>Reps</span></p>
                  <p className="text-xl font-black text-slate-900">{session.repetitions}</p>
                </div>
                <div className="text-center md:text-left px-2 border-l border-r border-slate-200 md:border-transparent">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5 flex items-center justify-center md:justify-start space-x-1"><Clock className="w-3 h-3"/> <span>Tiempo</span></p>
                  <p className="text-xl font-black text-slate-900">{Math.floor(session.duration_seconds / 60)}:{(session.duration_seconds % 60).toString().padStart(2, '0')}</p>
                </div>
                <div className="text-center md:text-left px-2">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5 flex items-center justify-center md:justify-start space-x-1"><Flame className="w-3 h-3 text-orange-400"/> <span>Kcal</span></p>
                  <p className="text-xl font-black text-orange-500">{session.calories_burned}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingHistory;
