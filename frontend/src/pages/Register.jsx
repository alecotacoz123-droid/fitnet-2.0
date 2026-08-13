import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, User as UserIcon, Keyboard, Loader2, AlertCircle, FileText } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { full_name, username, email, password } = formData;
    if (!full_name || !username || !email || !password) {
      return setError('Completa todos los campos obligatorios.');
    }

    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al registrar la cuenta. Prueba otro nombre o correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 relative">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-400/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-400/10 blur-[80px]" />
      </div>

      <div className="w-full max-w-lg bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="FitNet Logo" className="w-16 h-16 object-contain drop-shadow-sm" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Crear cuenta en Fit<span className="text-blue-600">Net</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs mt-1">Únete a la mayor comunidad de entrenamiento inteligente</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start space-x-2.5 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Nombre Completo *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Juan Perez"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Username input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Nombre de Usuario *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Keyboard className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="username"
                  placeholder="juan_fitness"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Correo Electrónico *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="juan@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Contraseña *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              ¿Cuál es tu rol principal? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'user', label: 'Atleta / Usuario', desc: 'Sube rutinas, sigue y entrena' },
                { value: 'trainer', label: 'Entrenador / Coach', desc: 'Gestiona grupos de alumnos' }
              ].map((roleOpt) => (
                <label
                  key={roleOpt.value}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    formData.role === roleOpt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/50'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={roleOpt.value}
                    checked={formData.role === roleOpt.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`text-xs font-bold ${formData.role === roleOpt.value ? 'text-blue-700' : 'text-slate-700'}`}>{roleOpt.label}</span>
                  <span className={`text-[9px] mt-1 ${formData.role === roleOpt.value ? 'text-blue-500' : 'text-slate-400'}`}>{roleOpt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bio input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Biografía / Presentación (Opcional)
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-slate-400">
                <FileText className="w-4 h-4" />
              </span>
              <textarea
                name="bio"
                placeholder="Cuéntanos un poco sobre tus objetivos de fitness..."
                value={formData.bio}
                onChange={handleChange}
                rows="2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center shadow-md shadow-blue-600/20 cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creando cuenta...
              </>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
