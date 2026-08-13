import React, { useState, useEffect } from 'react';
import { logService } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  TrendingUp, 
  Award, 
  Heart, 
  FileText, 
  Users, 
  Activity, 
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Progress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metricsData = await logService.getDashboardMetrics();
        setData(metricsData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('No se pudieron cargar las métricas de tu progreso.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium text-sm">Cargando métricas y estadísticas...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-slate-900 font-bold text-lg">Error</h3>
        <p className="text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  const { metrics, recentLogs, chartData } = data;

  // Prepare line chart data (Weekly Posts)
  // Fill missing days with 0 for nice visualization
  const last7DaysLabels = [];
  const postCounts = [];
  const activityCounts = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    
    // Label as short weekday
    const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    last7DaysLabels.push(dayLabel);

    // Find in posts data
    const postDay = chartData.posts.find(p => p.date === dateString);
    postCounts.push(postDay ? postDay.count : 0);

    // Find in activity data
    const activityDay = chartData.activity.find(l => l.date === dateString);
    activityCounts.push(activityDay ? activityDay.count : 0);
  }

  const lineChartData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Publicaciones Creadas',
        data: postCounts,
        fill: false,
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      }
    ]
  };

  const barChartData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Actividad / Acciones Logueadas',
        data: activityCounts,
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald-500
        borderColor: '#10b981',
        borderWidth: 0,
        borderRadius: 6,
        hoverBackgroundColor: '#059669', // emerald-600
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#64748b', font: { size: 12, family: "'Inter', sans-serif", weight: '600' } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900
        titleFont: { family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11, family: "'Inter', sans-serif", weight: '500' } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { 
          color: '#64748b', 
          font: { size: 11, family: "'Inter', sans-serif", weight: '500' },
          stepSize: 1,
          precision: 0 
        }
      }
    }
  };

  const metricCards = [
    { name: 'Publicaciones', val: metrics.postsCount, icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'Likes Recibidos', val: metrics.likesGivenCount, icon: Heart, color: 'text-red-500 bg-red-50 border-red-100' },
    { name: 'Seguidores', val: metrics.followersCount, icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { name: 'Siguiendo', val: metrics.followingCount, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { name: 'Grupos Unidos', val: metrics.groupsCount, icon: Award, color: 'text-amber-500 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-slate-200 pb-4">
        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 border border-blue-100 shadow-sm">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mi Progreso</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Monitoreo de actividad y estadísticas en FitNet</p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.name}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-3 hover:shadow-md transition-shadow"
            >
              <div className={`p-2.5 rounded-2xl border shadow-sm ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">{card.val}</span>
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{card.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graph 1: Weekly Posts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Publicaciones (7 días)</span>
          </h3>
          <div className="h-64 flex items-center justify-center w-full">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Graph 2: Weekly Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Acciones (7 días)</span>
          </h3>
          <div className="h-64 flex items-center justify-center w-full">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Activity Logs Timeline */}
      <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-4 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <span>Historial de Actividad Reciente</span>
        </h3>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-6 text-center font-medium">No se registra actividad reciente.</p>
        ) : (
          <div className="divide-y divide-slate-100 pt-2">
            {recentLogs.map((log) => (
              <div 
                key={log.id}
                className="py-4 flex items-start justify-between text-sm group"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg border ${
                      log.action.includes('FAIL')
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : log.action.includes('CREATE') || log.action.includes('ADD')
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-xs font-medium text-slate-600 leading-snug">{log.details}</span>
                  </div>
                  {log.ip_address && (
                    <p className="text-[10px] font-medium text-slate-400 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></span> IP: {log.ip_address}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-semibold shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(log.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
