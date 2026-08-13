import React, { useState, useEffect } from 'react';
import { fitnessService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Activity, Zap, Flame, Scale, Clock, Edit3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyFitnessProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fitnessService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return <div className="flex flex-col justify-center items-center py-20 space-y-3"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /><span className="text-slate-500 font-medium">Cargando datos físicos...</span></div>;

  if (!profile) return (
    <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 m-8 p-10 shadow-sm">
      <Scale className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p className="mb-2">No tienes un perfil físico configurado.</p>
      <a href="/onboarding" className="text-blue-600 font-bold hover:underline">Configurar mi perfil ahora</a>
    </div>
  );

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: 'Bajo Peso', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { text: 'Obesidad', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
  };

  const bmiCat = getBMICategory(profile.calculated_bmi);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <span>Datos Físicos</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium ml-8">Métricas base para la Inteligencia Artificial</p>
          </div>
        </div>
        
        <a href="/onboarding" className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 text-sm font-bold rounded-xl border border-blue-100 transition-colors ml-8 sm:ml-0">
          <Edit3 className="w-4 h-4" />
          <span>Actualizar Medidas</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* IMC Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]">
            <Scale className="w-32 h-32 text-slate-900" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center">
              <Scale className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Índice de Masa Corporal
            </p>
            <div className="flex items-end space-x-3 mt-1">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">{profile.calculated_bmi}</span>
              <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-lg mb-2 border ${bmiCat.color} ${bmiCat.bg} ${bmiCat.border}`}>{bmiCat.text}</span>
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-slate-50">
            <p className="text-xs font-semibold text-slate-500 flex justify-between">
              <span>Peso: <strong className="text-slate-700">{profile.weight_kg} kg</strong></span>
              <span>Altura: <strong className="text-slate-700">{profile.height_cm} cm</strong></span>
            </p>
          </div>
        </div>

        {/* Calorías Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]">
            <Flame className="w-32 h-32 text-orange-900" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center">
              <Flame className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
              Calorías Diarias (TDEE)
            </p>
            <div className="flex items-end space-x-2 mt-1">
              <span className="text-5xl font-black text-orange-500 tracking-tighter">{profile.calculated_tdee}</span>
              <span className="text-sm font-bold text-slate-400 mb-1">kcal</span>
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-slate-50">
            <p className="text-xs font-semibold text-slate-500">Objetivo: <strong className="text-slate-700 capitalize">{profile.goal.replace('_', ' ')}</strong></p>
          </div>
        </div>

        {/* Actividad Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="absolute -top-4 -right-4 p-4 opacity-[0.03]">
            <Zap className="w-32 h-32 text-blue-900" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Disponibilidad
            </p>
            <div className="flex flex-col mt-1">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{profile.available_days} <span className="text-lg text-slate-400">días/sem</span></span>
              <span className="text-sm font-bold text-blue-600 capitalize mt-1 bg-blue-50 self-start px-2 py-0.5 rounded-lg border border-blue-100">{profile.training_location}</span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-50">
            <p className="text-xs font-semibold text-slate-500">Actividad: <strong className="text-slate-700 capitalize">{profile.activity_level.replace('_', ' ')}</strong></p>
          </div>
        </div>
      </div>

      {/* Recommendaciones Generadas */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Recomendaciones Automáticas de la IA</span>
        </h3>
        <ul className="space-y-4">
          {profile.goal === 'lose_weight' && (
            <>
              <li className="flex items-start space-x-3 text-slate-600 text-sm font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="bg-red-50 text-red-600 p-2 rounded-xl border border-red-100 shrink-0"><Flame className="w-4 h-4"/></span>
                <span className="pt-1.5">Mantén un <strong className="text-slate-900">déficit calórico</strong> constante (ya ajustado en tus {profile.calculated_tdee} kcal).</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-600 text-sm font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shrink-0"><Activity className="w-4 h-4"/></span>
                <span className="pt-1.5">Combina entrenamiento de fuerza con sesiones de cardio o HIIT para maximizar la oxidación de grasa.</span>
              </li>
            </>
          )}
          {profile.goal === 'build_muscle' && (
            <>
              <li className="flex items-start space-x-3 text-slate-600 text-sm font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shrink-0"><Activity className="w-4 h-4"/></span>
                <span className="pt-1.5">Enfócate en la sobrecarga progresiva en tus rutinas de hipertrofia para forzar la adaptación celular.</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-600 text-sm font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="bg-green-50 text-green-600 p-2 rounded-xl border border-green-100 shrink-0"><Zap className="w-4 h-4"/></span>
                <span className="pt-1.5">Asegúrate de consumir al menos 1.6g a 2.2g de proteína por kg de tu peso corporal ({profile.weight_kg}kg).</span>
              </li>
            </>
          )}
          <li className="flex items-start space-x-3 text-slate-600 text-sm font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="bg-purple-50 text-purple-600 p-2 rounded-xl border border-purple-100 shrink-0"><Clock className="w-4 h-4"/></span>
            <span className="pt-1.5">Descansa adecuadamente entre 7 y 8 horas diarias para recuperación óptima y secreción hormonal.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MyFitnessProfile;
