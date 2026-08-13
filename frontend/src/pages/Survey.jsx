import React, { useState, useEffect } from 'react';
import { fitnessService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Loader2, ClipboardList, CheckCircle2, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';

const Survey = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Survey Questions (1 to 5 values)
  const [q1, setQ1] = useState(0); // Accompaniment
  const [q2, setQ2] = useState(0); // Adherence
  const [q3, setQ3] = useState(0); // Usability
  const [q4, setQ4] = useState(0); // Timbio connection
  const [q5, setQ5] = useState(0); // General satisfaction
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const questions = [
    { 
      id: 'q1', 
      val: q1, 
      set: setQ1, 
      label: 'Acompañamiento Digital (Asistentes IA)', 
      desc: '¿Cómo calificarías el nivel de acompañamiento digital y guía deportiva brindada por el Coach IA y el Chatbot virtual?' 
    },
    { 
      id: 'q2', 
      val: q2, 
      set: setQ2, 
      label: 'Adherencia al Entrenamiento Físico', 
      desc: '¿Consideras que el sistema de constancia (calendario de mapa de calor y contador de rachas) incrementa tu regularidad en el ejercicio físico?' 
    },
    { 
      id: 'q3', 
      val: q3, 
      set: setQ3, 
      label: 'Usabilidad del Prototipo', 
      desc: '¿Qué tan intuitiva, fluida y fácil de usar te ha parecido la interfaz y navegación de la plataforma FitNet?' 
    },
    { 
      id: 'q4', 
      val: q4, 
      set: setQ4, 
      label: 'Interacción Comunitaria (Timbío)', 
      desc: '¿Sientes que el directorio de grupos y la comunidad local facilitan la interacción social de entrenamiento en el municipio de Timbío?' 
    },
    { 
      id: 'q5', 
      val: q5, 
      set: setQ5, 
      label: 'Satisfacción General', 
      desc: 'En general, ¿cuál es tu nivel de satisfacción con el uso de este prototipo web de red social fitness apoyada en IA?' 
    }
  ];

  const checkSubmission = async () => {
    try {
      setLoading(true);
      // We check if this user already filled the survey.
      // In getSurveyResults, only admins can request, but we can catch error if we are not admin.
      // To bypass admin lock, let's fetch getSurveyResults or catch it.
      // Wait! We can also handle it by calling the submit endpoint. If they already submitted, the backend rejects with 400.
      // We can also check if we can query it or save a localStorage flag as user-experience helper,
      // but let's query the database if possible or just try to see if there's any clean way.
      // Wait, we can add a simple GET /fitness/survey/my-status to see if this user already filled it!
      // But let's check: the user will know when they submit it. We can show a state, and if they submit and get a success, we store a flag.
      // Let's implement a simple check in backend or just use a localStorage key paired with user.id.
      const userId = JSON.parse(localStorage.getItem('fitnet_user'))?.id;
      if (userId && localStorage.getItem(`survey_completed_${userId}`)) {
        setHasSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubmission();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!q1 || !q2 || !q3 || !q4 || !q5) {
      setError('Por favor, responde a todas las preguntas con una valoración del 1 al 5.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await fitnessService.submitSurvey({ q1, q2, q3, q4, q5, comments });
      const userId = JSON.parse(localStorage.getItem('fitnet_user'))?.id;
      if (userId) {
        localStorage.setItem(`survey_completed_${userId}`, 'true');
      }
      setHasSubmitted(true);
      showToast('¡Encuesta enviada con éxito! Gracias por tu apoyo.', 'success');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al enviar la encuesta. Tal vez ya has participado.');
      showToast(err.message || 'Error al enviar la encuesta.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-slate-500 font-medium">Cargando encuesta piloto...</span>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-500 text-center space-y-6">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Muchas Gracias!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tus respuestas han sido registradas exitosamente en la base de datos de investigación.
            </p>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-xs text-blue-800 text-left space-y-1.5">
            <div className="flex items-center space-x-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Proyecto de Investigación de Tesis</span>
            </div>
            <p className="leading-relaxed">
              Tus valoraciones de acompañamiento y adherencia serán utilizadas en el análisis estadístico del estudio piloto en el municipio de Timbío, Cauca.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 pb-24 md:pb-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <span>Encuesta de Acompañamiento y Adherencia</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Proyecto Piloto FitNet • Estudio de investigación en Timbío, Cauca.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-5 shadow-sm">
        <p className="text-xs text-blue-900 leading-relaxed font-medium">
          <strong>Instrucciones:</strong> Valora del 1 al 5 las siguientes afirmaciones de acuerdo a tu experiencia interactuando con la aplicación. Donde <strong>1 es Totalmente en desacuerdo / Muy Deficiente</strong> y <strong>5 es Totalmente de acuerdo / Excelente</strong>.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-8 divide-y divide-slate-100">
          {questions.map((q, index) => (
            <div key={q.id} className={`${index > 0 ? 'pt-6' : ''} space-y-3`}>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{index + 1}. {q.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{q.desc}</p>
              </div>
              
              <div className="flex justify-between max-w-sm pt-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => q.set(num)}
                    className={`w-11 h-11 rounded-xl font-bold text-sm border transition-all flex items-center justify-center cursor-pointer ${
                      q.val === num
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-105'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6 space-y-2">
            <label className="block text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Comentarios Adicionales (Opcional)</span>
            </label>
            <textarea
              placeholder="¿Qué mejoras sugieres para potenciar la adherencia deportiva o el acompañamiento inteligente en Timbío?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows="4"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Enviar Encuesta</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Survey;
