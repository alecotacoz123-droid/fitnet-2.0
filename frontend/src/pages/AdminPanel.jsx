import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Users, 
  FileText, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Database,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Backup states
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsData = await adminService.getStats();
      setStats(statsData.stats);
      setSystemLogs(statsData.systemLogs);

      const usersList = await adminService.getUsers();
      setUsers(usersList);
    } catch (err) {
      console.error(err);
      setError('Error al obtener datos administrativos del sistema. Verifica permisos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert('Error al cambiar rol: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario y todo su contenido?')) return;
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      // Reload stats
      const statsData = await adminService.getStats();
      setStats(statsData.stats);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar usuario: ' + err.message);
    }
  };

  const handleTriggerBackup = async () => {
    setBackupLoading(true);
    setBackupSuccess('');
    try {
      const data = await adminService.triggerBackup();
      setBackupSuccess(`Copia creada con éxito: ${data.backupFile}`);
      // Refresh audit logs
      const statsData = await adminService.getStats();
      setSystemLogs(statsData.systemLogs);
    } catch (err) {
      console.error(err);
      alert('Error al generar copia de seguridad: ' + err.message);
    } finally {
      setBackupLoading(false);
    }
  };

  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-slate-900 font-bold text-lg">Acceso Denegado</h3>
        <p className="text-slate-500 mt-1 font-medium">Solo los Administradores tienen permisos para ver el Panel de Control General.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium text-sm">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-red-50 p-3 rounded-2xl text-red-500 border border-red-100 shadow-sm">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Administración</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Consola de moderación, control de roles e integridad del sistema</p>
          </div>
        </div>
        
        <button
          onClick={fetchAdminData}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500 hover:text-blue-600"
          title="Refrescar datos"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-medium text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 group hover:shadow-md transition-shadow">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Usuarios Registrados</span>
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{stats.totalUsers}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 group hover:shadow-md transition-shadow">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Publicaciones</span>
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{stats.totalPosts}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 group hover:shadow-md transition-shadow">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Grupos</span>
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{stats.totalGroups}</span>
            </div>
          </div>
        </div>
      )}

      {/* Backups Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Database className="w-4 h-4 text-blue-500" />
          <span>Respaldo y Copias de Seguridad del Sistema (RNF-22)</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
            Genera una copia física del archivo de base de datos SQLite en el servidor local. 
            El respaldo se guardará en <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs">database/backups/</code> registrando el timestamp exacto para prevenir pérdidas.
          </p>
          
          <button
            onClick={handleTriggerBackup}
            disabled={backupLoading}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all shrink-0 w-full sm:w-auto"
          >
            {backupLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Creando Copia...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Ejecutar Backup Ahora</span>
              </>
            )}
          </button>
        </div>

        {backupSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span>{backupSuccess}</span>
          </div>
        )}
      </div>

      {/* Users Management list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
            Gestión de Usuarios y Roles (HU-05)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white">
              <tr className="text-slate-400 font-black tracking-wider uppercase text-[10px] border-b border-slate-100">
                <th className="py-4 px-6">Usuario</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Fecha de Registro</th>
                <th className="py-4 px-6">Rol</th>
                <th className="py-4 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6 font-semibold">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {u.username.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">{u.full_name}</p>
                        <p className="text-slate-400 text-xs font-medium">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium">{u.email}</td>
                  <td className="py-4 px-6 text-xs font-medium text-slate-500">{new Date(u.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="py-4 px-6">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={u.id === user.id} // prevent self role-change
                    >
                      <option value="user">Atleta</option>
                      <option value="trainer">Entrenador</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user.id}
                      className="p-2 rounded-xl border border-transparent hover:border-red-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 cursor-pointer"
                      title="Eliminar usuario permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit System Logs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
            Registro General de Auditoría del Sistema (Logs Globales)
          </h3>
        </div>

        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
          {systemLogs.map((log) => (
            <div 
              key={log.id}
              className="p-4 bg-white hover:bg-slate-50/50 transition-colors text-xs flex justify-between items-start gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md border ${
                    log.action.includes('FAIL') 
                      ? 'bg-red-50 text-red-600 border-red-100' 
                      : log.action.includes('SYSTEM') 
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-slate-500 font-medium">
                    por <span className="text-slate-700 font-bold">{log.User ? `@${log.User.username}` : 'Anónimo'}</span> <span className="opacity-60">({log.User?.role || 'Visitante'})</span>
                  </span>
                </div>
                <p className="text-slate-600 font-medium">{log.details}</p>
              </div>

              <div className="text-[10px] font-semibold text-slate-400 shrink-0 text-right">
                <p>{new Date(log.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</p>
                <p>{new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
