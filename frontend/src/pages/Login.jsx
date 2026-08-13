import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Completa todos los campos obligatorios.');
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Error durante el login:', err);
      // Fallback message if err.message is empty or generic
      const errorText = err.message === 'Failed to fetch' 
        ? 'No se pudo conectar al servidor.' 
        : (err.message || 'Contraseña o correo incorrectos.');
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-blue-400/10 blur-[80px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-indigo-400/10 blur-[80px]" />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="FitNet Logo" className="w-20 h-20 object-contain drop-shadow-sm" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Fit<span className="text-blue-600">Net</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Conéctate, entrena y supera tus límites</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start space-x-2.5 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="ejemplo@fitnet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Contraseña
              </label>
              <Link 
                to="/recover-password" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                ¿La olvidaste?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center shadow-md shadow-blue-600/20 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
