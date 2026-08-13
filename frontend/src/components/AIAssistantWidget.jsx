import React, { useState, useEffect } from 'react';
import { fitnessService } from '../services/api';
import { Zap, Loader2 } from 'lucide-react';

const AIAssistantWidget = () => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await fitnessService.getInsights();
        if (data && data.message) setInsight(data.message);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center h-24">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    </div>
  );

  if (!insight) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-3xl border border-blue-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
        <Zap className="w-24 h-24 text-blue-600" />
      </div>
      <div className="flex items-start space-x-4 relative z-10">
        <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-sm mt-1">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 mb-1">Coach IA</h4>
          <p className="text-sm text-slate-800 font-bold leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantWidget;
