import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Camera, 
  Users, 
  TrendingUp, 
  Flame, 
  Activity, 
  Dumbbell, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Lock,
  Play,
  Heart
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-600/10 selection:text-blue-600">
      
      {/* 🧭 Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Fit<span className="text-blue-600">Net</span>
            </span>
            <span className="bg-blue-600/10 text-blue-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded">
              IA Coach
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-500">
            <a href="#beneficios" className="hover:text-blue-600 transition-colors">Beneficios</a>
            <a href="#coach-ia" className="hover:text-blue-600 transition-colors">Coach IA</a>
            <a href="#estadisticas" className="hover:text-blue-600 transition-colors">Estadísticas</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/15 transition-all cursor-pointer hover:scale-105"
            >
              Comenzar Gratis
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 text-[10px] font-bold text-blue-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entrenamiento Inteligente 3.0</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Entrena más inteligente con <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Inteligencia Artificial</span>
            </h1>
            
            <p className="text-slate-500 text-sm md:text-base font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Rutinas personalizadas, análisis de postura en tiempo real, seguimiento de progreso y comunidad fitness en una sola plataforma.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.03]"
              >
                <span>Comenzar Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#coach-ia"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-black text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>Ver Demo</span>
              </a>
            </div>
          </div>

          {/* Right Hero Column: Premium Interactive Mockup UI */}
          <div className="lg:col-span-7 relative flex justify-center">
            
            {/* Glowing background shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
            
            {/* Main Mockup container */}
            <div className="w-full max-w-[520px] bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-6 relative hover:-translate-y-1 transition-transform duration-500">
              
              {/* Mockup Header bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Coach IA FitNet</h4>
                    <p className="text-[9px] text-emerald-500 font-bold flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span> Activo
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 font-bold">13 Jun 2026</span>
              </div>

              {/* Mockup Message from Coach IA */}
              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-2.5">
                <p className="text-xs text-slate-700 font-bold leading-normal">
                  "¡Hola Carlos! Tu postura en las sentadillas ha mejorado un <span className="text-emerald-600 font-black">15%</span> esta semana. Para hoy te recomiendo entrenar **Piernas e Hombros**."
                </p>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Iniciar Rutina</span>
                  </button>
                  <button className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold">Ver Detalles</button>
                </div>
              </div>

              {/* Floating Cards (Rendimiento and Streak) inside Mockup */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <Flame className="absolute right-2 bottom-2 w-10 h-10 text-orange-50" />
                  <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider">Racha Actual</p>
                  <p className="text-xl font-black text-slate-800 mt-1 flex items-center">
                    7 <span className="text-xs font-bold text-slate-400 ml-1">días 🔥</span>
                  </p>
                </div>
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <TrendingUp className="absolute right-2 bottom-2 w-10 h-10 text-green-50" />
                  <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider">Evolución</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    +15% <span className="text-xs font-bold text-slate-400 ml-1">rendimiento</span>
                  </p>
                </div>
              </div>

              {/* Progress Chart Mockup */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                  <Activity className="w-3 h-3 mr-1 text-blue-600" /> Rendimiento en Tiempo Real
                </p>
                <div className="h-24 flex items-end justify-between px-2">
                  {[25, 45, 30, 60, 50, 75, 90, 65, 80].map((val, idx) => (
                    <div key={idx} className="w-6 bg-slate-100 rounded-t-md relative group flex flex-col justify-end" style={{ height: '100%' }}>
                      <div 
                        className="w-full bg-blue-600/90 rounded-t-md hover:bg-blue-600 transition-colors" 
                        style={{ height: `${val}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 📦 Beneficios Section */}
      <section id="beneficios" className="py-24 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Beneficios Clave</h2>
            <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Diseñado para optimizar tu rendimiento físico
            </p>
            <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium">
              Aprovechamos la tecnología avanzada de inteligencia artificial para entregarte la mejor experiencia de entrenamiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Beneficio 1 */}
            <div className="bg-slate-50 p-6.5 rounded-3xl border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Bot className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-black text-slate-800">IA Personalizada</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Rutinas adaptadas a los objetivos de cada usuario, evolucionando con tu progreso diario.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-slate-50 p-6.5 rounded-3xl border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <Camera className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-black text-slate-800">Cámara Inteligente</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Corrección de postura guiada y conteo automático de repeticiones utilizando visión computacional.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-slate-50 p-6.5 rounded-3xl border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-black text-slate-800">Comunidad Fitness</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Conéctate con atletas de tu nivel, entrenadores profesionales y únete a desafíos competitivos.
              </p>
            </div>

            {/* Beneficio 4 */}
            <div className="bg-slate-50 p-6.5 rounded-3xl border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-black text-slate-800">Seguimiento Avanzado</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Visualiza tu progreso físico, mantén rachas diarias motivadoras y monitorea tu evolución general.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 🤖 Sección Coach IA */}
      <section id="coach-ia" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Chat Simulation */}
          <div className="lg:col-span-6 space-y-4 order-last lg:order-first">
            
            {/* Example Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-start space-x-3.5 hover:translate-x-2 transition-transform duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recomendación Diaria</p>
                <p className="text-sm font-bold text-slate-800 mt-1">"Hoy te recomiendo entrenar piernas."</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Enfoque: Sentadillas y zancadas para potenciar hipertrofia muscular.</p>
              </div>
            </div>

            {/* Example Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-start space-x-3.5 hover:translate-x-2 transition-transform duration-300">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Gamificación de Racha</p>
                <p className="text-sm font-bold text-slate-800 mt-1">"Tu racha es de 7 días."</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">¡Estás en la cima! Mantén tu racha para subir de nivel.</p>
              </div>
            </div>

            {/* Example Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-start space-x-3.5 hover:translate-x-2 transition-transform duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Análisis Inteligente</p>
                <p className="text-sm font-bold text-emerald-600 mt-1">"Has mejorado tu rendimiento un 15%."</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Incremento de peso cargado en press de pecho y mejor ritmo cardíaco.</p>
              </div>
            </div>

          </div>

          {/* Right Column: AI Coach Text copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 text-[10px] font-bold text-blue-600">
              <Bot className="w-3.5 h-3.5" />
              <span>Coach IA FitNet</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Un Coach IA disponible 24/7 en tu bolsillo
            </h2>
            
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              No necesitas pagar entrenadores costosos para tener rutinas científicamente optimizadas. FitNet procesa tu rendimiento anterior y planifica tus rutinas en tiempo real para optimizar tu desarrollo físico.
            </p>

            <ul className="space-y-3 pt-2 text-xs font-bold text-slate-600 inline-block text-left">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                <span>Recomendaciones personalizadas todas las mañanas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                <span>Adaptación dinámica si te saltas un día</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                <span>Análisis predictivo de lesiones por sobreentrenamiento</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 📊 Sección Estadísticas */}
      <section id="estadisticas" className="py-24 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Panel de Control</h2>
            <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Tus resultados visibles desde el primer día
            </p>
            <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium">
              Visualiza tus entrenamientos y mantén motivado tu día a día con el registro interactivo de FitNet.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Entrenamientos */}
            <div className="bg-[#F8FAFC] p-6.5 rounded-3xl border border-slate-100 space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Dumbbell className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Entrenamientos</p>
              <p className="text-3xl font-black text-slate-800">48 completados</p>
            </div>

            {/* Card 2: Calorías */}
            <div className="bg-[#F8FAFC] p-6.5 rounded-3xl border border-slate-100 space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Calorías Quemadas</p>
              <p className="text-3xl font-black text-slate-800">15.4K kcal</p>
            </div>

            {/* Card 3: Días activos */}
            <div className="bg-[#F8FAFC] p-6.5 rounded-3xl border border-slate-100 space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Días Activos</p>
              <p className="text-3xl font-black text-slate-800">32 días</p>
            </div>

            {/* Card 4: Racha */}
            <div className="bg-[#F8FAFC] p-6.5 rounded-3xl border border-slate-100 space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Flame className="w-5 h-5" />
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Racha Actual</p>
              <p className="text-3xl font-black text-orange-600">12 días 🔥</p>
            </div>

          </div>
        </div>
      </section>

      {/* 🏁 Call To Action Final */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1.5 text-[10px] font-bold text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Únete a FitNet Hoy</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Comienza tu transformación hoy
          </h2>

          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Obtén acceso inmediato a tu plan de entrenamiento inteligente por IA y conéctate con la comunidad de fitness que te mantendrá motivado.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.03]"
            >
              <span>Crear Cuenta Gratis</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl font-black text-sm transition-all cursor-pointer"
            >
              <span>Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </section>

      {/* 🏁 Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl font-black tracking-tight text-white">
              Fit<span className="text-blue-500">Net</span>
            </span>
          </div>
          
          <p className="text-[11px] text-slate-600 font-medium">
            © 2026 FitNet. Diseñado para entrenar con el poder de la Inteligencia Artificial. Todos los derechos reservados.
          </p>

          <div className="flex items-center space-x-2 text-[10px] text-slate-600 font-bold">
            <Heart className="w-3.5 h-3.5 text-red-500 mr-1" />
            <span>FitNet Team</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
