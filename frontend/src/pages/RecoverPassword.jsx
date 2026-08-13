import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const RecoverPassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return setError('El correo electrónico es obligatorio.');
    
    setError('');
    setLoading(true);
    try {
      const data = await authService.recoverPassword(email);
      setSuccess(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) return setError('Ingresa un código válido de 6 dígitos.');
    
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.verifyResetCode(email, code);
      setSuccess('Código verificado correctamente.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.resetPassword(email, code, newPassword);
      // Auto login
      await login(email, newPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[25%] w-[300px] h-[300px] rounded-full bg-indigo-400/10 blur-[80px]" />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="FitNet Logo" className="w-16 h-16 object-contain drop-shadow-sm" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {step === 1 ? 'Recuperar Contraseña' : step === 2 ? 'Verificar Código' : step === 3 ? 'Nueva Contraseña' : '¡Todo Listo!'}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {step === 1 && 'Ingresa tu correo y te enviaremos un código'}
            {step === 2 && 'Ingresa el código de 6 dígitos enviado a tu correo'}
            {step === 3 && 'Crea una contraseña segura para tu cuenta'}
            {step === 4 && 'Tu contraseña ha sido actualizada exitosamente'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start space-x-2.5 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && step !== 4 && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-start space-x-2.5 text-sm font-medium">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: REQUEST CODE */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Mail className="w-5 h-5" /></span>
                <input type="email" placeholder="ejemplo@fitnet.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-md shadow-indigo-600/20 cursor-pointer">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Código'}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY CODE */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Código de Recuperación</label>
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl py-4 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" 
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-md shadow-indigo-600/20 cursor-pointer">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verificar Código'}
            </button>
            <div className="text-center mt-2">
              <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Usar otro correo</button>
            </div>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Nueva Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock className="w-5 h-5" /></span>
                <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" required minLength="6"/>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Confirmar Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><Lock className="w-5 h-5" /></span>
                <input type="password" id="confirmPassword" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" required minLength="6"/>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              onClick={() => {
                const confirmInput = document.getElementById('confirmPassword').value;
                if(newPassword !== confirmInput) {
                  setError('Las contraseñas no coinciden. Intenta de nuevo.');
                } else {
                  setError('');
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-md shadow-blue-600/20 cursor-pointer">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar y Entrar'}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-start space-x-2.5 text-sm font-medium">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold">¡Contraseña Actualizada!</p>
                <p className="mt-1 text-emerald-600">Tu contraseña ha sido cambiada con éxito.</p>
              </div>
            </div>
            <Link to="/login" className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-200 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </div>
        )}

        {step !== 4 && (
          <div className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al inicio de sesión</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoverPassword;
