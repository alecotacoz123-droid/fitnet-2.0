import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fitnessService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowRight, Loader2, Target, Heart } from 'lucide-react';

const Onboarding = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight_kg: '',
    height_cm: '',
    activity_level: 'sedentary',
    goal: 'lose_weight',
    training_location: 'home',
    available_days: 3,
    physical_restrictions: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await fitnessService.upsertProfile({
        ...formData,
        age: parseInt(formData.age),
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
        available_days: parseInt(formData.available_days)
      });
      await refreshUser();
      navigate('/my-profile');
    } catch (err) {
      setError(err.message || 'Error guardando tu perfil fitness.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-50 p-4 rounded-full text-blue-600 border border-blue-100 shadow-sm mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 text-center tracking-tight">
            Configura tu <span className="text-blue-600">Perfil Inteligente</span>
          </h1>
          <p className="text-slate-500 font-medium text-center mt-2 text-sm max-w-sm">
            Necesitamos estos datos para que la IA genere tus rutinas y recomendaciones precisas.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-medium text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Básicos */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Edad</label>
              <input type="number" name="age" required min="12" max="100" value={formData.age} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sexo</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer">
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Peso actual (kg)</label>
              <input type="number" step="0.1" name="weight_kg" required min="30" max="300" value={formData.weight_kg} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estatura (cm)</label>
              <input type="number" name="height_cm" required min="100" max="250" value={formData.height_cm} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center space-x-1.5"><Target className="w-3.5 h-3.5 text-blue-500" /> <span>Objetivo Principal</span></label>
              <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer">
                <option value="lose_weight">Perder Peso</option>
                <option value="build_muscle">Ganar Masa Muscular</option>
                <option value="maintain_weight">Mantener Peso</option>
                <option value="improve_fitness">Mejorar Condición Física</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nivel de Actividad</label>
              <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer">
                <option value="sedentary">Sedentario (Poco o ningún ejercicio)</option>
                <option value="lightly_active">Poco Activo (1-3 días/sem)</option>
                <option value="moderately_active">Activo (3-5 días/sem)</option>
                <option value="very_active">Muy Activo (6-7 días/sem)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lugar de Entrenamiento</label>
              <select name="training_location" value={formData.training_location} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer">
                <option value="home">Casa (Sin equipo)</option>
                <option value="gym">Gimnasio</option>
                <option value="park">Parque / Calistenia</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Días a la semana (1-7)</label>
              <input type="number" name="available_days" required min="1" max="7" value={formData.available_days} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center space-x-1.5"><Heart className="w-3.5 h-3.5 text-red-400" /> <span>Restricciones físicas (Opcional)</span></label>
            <textarea name="physical_restrictions" placeholder="Ej. Dolor de rodilla izquierda, asma..." value={formData.physical_restrictions} onChange={handleChange} rows="2" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm resize-none"></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-6 py-4 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <span>Generar Perfil con IA</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
