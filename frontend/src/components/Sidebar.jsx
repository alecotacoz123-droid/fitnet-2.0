import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from './SafeImage';
import { 
  Home, 
  Dumbbell, 
  Users, 
  Search, 
  User as UserIcon,
  Shield,
  LogOut,
  Trophy
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Los 5 Pilares de FitNet 2.0
  const menuItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Entrenar', path: '/train', icon: Dumbbell },
    { name: 'Comunidad', path: '/community', icon: Users },
    { name: 'Explorar', path: '/explore', icon: Search },
    { name: 'Perfil', path: `/profile`, icon: UserIcon },
  ];

  // Rutas para entrenadores y admins
  const trainerItems = [
    { name: 'Mis Grupos', path: '/groups', icon: Trophy, role: ['trainer', 'admin'] },
    { name: 'Admin', path: '/admin', icon: Shield, role: ['admin'] },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 📱 Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {/* Always show the 5 main items */}
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-blue-50' : ''}`}>
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-blue-600' : 'text-slate-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          {/* Extra: Grupos for trainers/admins */}
          {['trainer', 'admin'].includes(user.role) && (
            <Link
              to="/groups"
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive('/groups') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive('/groups') ? 'bg-blue-50' : ''}`}>
                <Trophy className={`w-5 h-5 ${isActive('/groups') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] font-semibold ${isActive('/groups') ? 'text-blue-600' : 'text-slate-500'}`}>
                Grupos
              </span>
            </Link>
          )}
        </div>
      </nav>


      {/* 💻 Desktop Sidebar (Visible solo en md en adelante) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-40">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            Fit<span className="text-blue-600">Net</span>
          </span>
        </div>

        <div className="flex flex-col h-full justify-between p-4 overflow-y-auto">
          <nav className="space-y-1.5">
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 mt-2">Menú Principal</p>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Opciones para Entrenadores y Admins */}
            {trainerItems.some(item => item.role.includes(user.role)) && (
              <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 mt-6">Panel de Coach</p>
            )}
            {trainerItems.map((item) => {
              if (item.role && !item.role.includes(user.role)) return null;
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Footer Profile */}
          <div className="pt-4 border-t border-slate-100 mt-6">
            <div className="flex items-center space-x-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                <SafeImage 
                  src={user.profile_picture} 
                  alt={user.full_name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role === 'trainer' ? 'Coach' : user.role === 'admin' ? 'Admin' : 'Atleta'}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-bold">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
