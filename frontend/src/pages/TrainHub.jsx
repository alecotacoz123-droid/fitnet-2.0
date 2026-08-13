import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Camera, History, Dumbbell, ArrowRight, Zap } from 'lucide-react';
import { apiRequest } from '../services/api';

const TrainHub = () => {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState('Analizando tu progreso para sugerirte la mejor rutina de hoy...');

  useEffect(() => {
    const loadSuggestion = async () => {
      try {
        const response = await apiRequest('/ai-coach/dashboard');
        if (response && response.coachMainCard) {
          setSuggestion(response.coachMainCard.dailyRecommendation);
        }
      } catch (e) {
        setSuggestion('Listo para entrenar. Elige tu modalidad.');
      }
    };
    loadSuggestion();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Entrenamiento</h1>
        <p className="text-slate-500 text-sm mt-1">Impulsado por Inteligencia Artificial</p>
      </div>

      {/* Sugerencia del Coach IA */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start space-x-3 shadow-sm">
        <div className="bg-white p-2 rounded-xl shadow-sm shrink-0">
          <Bot className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Coach IA Sugiere</h4>
          <p className="text-sm font-bold text-slate-800 leading-tight">{suggestion}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Generador IA */}
        <div 
          onClick={() => navigate('/training-plan')}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Generador de Rutinas IA</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">Crea un plan de entrenamiento 100% personalizado según tus objetivos y tiempo.</p>
          </div>
          <div className="flex items-center text-blue-600 text-sm font-bold">
            Configurar ahora <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Cámara Biomecánica */}
        <div 
          onClick={() => navigate('/ai-training')}
          className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-900/20 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-md">
            <Camera className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-bold">Cámara de Postura IA</h3>
              <span className="bg-red-500 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">En Vivo</span>
            </div>
            <p className="text-slate-400 text-sm mt-1 mb-4">Corrección de postura en tiempo real y conteo automático de repeticiones.</p>
          </div>
          <div className="flex items-center text-blue-400 text-sm font-bold relative z-10">
            Abrir cámara <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Historial y Biblioteca</h3>
        <div className="space-y-3">
          <div 
            onClick={() => navigate('/training-history')}
            className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Historial de Entrenamientos</p>
                <p className="text-xs text-slate-500">Revisa tus sesiones pasadas</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>

          <div 
            onClick={() => navigate('/calendar')}
            className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Calendario Fitness</p>
                <p className="text-xs text-slate-500">Planificación semanal</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default TrainHub;

function ChevronRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
