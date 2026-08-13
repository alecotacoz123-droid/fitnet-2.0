import React from 'react';
import { calculateXP, getLevelFromXP, getNextLevel, getLevelProgress, getXPToNextLevel, LEVELS } from '../utils/levelSystem';

// ─── Compact badge: shown next to username in posts & ranking ───
export const LevelBadge = ({ fitnessProfile, size = 'sm' }) => {
  const xp = calculateXP(fitnessProfile);
  const level = getLevelFromXP(xp);

  if (size === 'xs') {
    return (
      <span
        title={`Nivel ${level.level}: ${level.name}`}
        className={`inline-flex items-center space-x-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md border ${level.bgLight} ${level.textColor} ${level.border}`}
      >
        <span>{level.emoji}</span>
        <span>Nv.{level.level}</span>
      </span>
    );
  }

  if (size === 'sm') {
    return (
      <span
        title={`Nivel ${level.level}: ${level.name} · ${xp} XP`}
        className={`inline-flex items-center space-x-1 text-[10px] font-black px-2 py-0.5 rounded-lg border ${level.bgLight} ${level.textColor} ${level.border}`}
      >
        <span>{level.emoji}</span>
        <span>{level.name}</span>
      </span>
    );
  }

  return null;
};

// ─── XP Bar: the full progress block shown in Profile ───────────
export const XPBar = ({ fitnessProfile }) => {
  const xp = calculateXP(fitnessProfile);
  const level = getLevelFromXP(xp);
  const nextLevel = getNextLevel(level);
  const progress = getLevelProgress(xp, level, nextLevel);
  const xpToNext = getXPToNextLevel(xp, nextLevel);
  const isMaxLevel = !nextLevel;

  return (
    <div className={`rounded-3xl p-5 border ${level.border} ${level.bgLight} relative overflow-hidden`}>
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${level.color}40, transparent 70%)` }}
      />

      <div className="relative z-10">
        {/* Level header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Level icon */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.gradient} flex items-center justify-center text-2xl shadow-lg`}>
              {level.emoji}
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${level.textColor} opacity-70`}>
                Nivel {level.level}
              </p>
              <p className={`text-xl font-black ${level.textColor}`}>{level.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{level.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${level.textColor}`}>{xp.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">XP Total</p>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {isMaxLevel ? 'Nivel Máximo Alcanzado' : `Progreso hacia ${nextLevel.name}`}
            </span>
            <span className={`text-xs font-black ${level.textColor}`}>{progress}%</span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-white shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${level.gradient} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          {!isMaxLevel && (
            <p className="text-[10px] text-slate-400 mt-1.5 text-right">
              Faltan <span className="font-black text-slate-600">{xpToNext.toLocaleString()} XP</span> para {nextLevel.emoji} {nextLevel.name}
            </p>
          )}
        </div>

        {/* Reward teaser */}
        {!isMaxLevel && (
          <div className="mt-3 pt-3 border-t border-current/10 flex items-start space-x-2">
            <span className="text-base">{nextLevel.emoji}</span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              <span className="font-black text-slate-700">Al subir de nivel:</span> {nextLevel.reward}
            </p>
          </div>
        )}
        {isMaxLevel && (
          <div className="mt-3 pt-3 border-t border-current/10 flex items-center space-x-2">
            <span className="text-base">👑</span>
            <p className="text-[10px] font-black text-amber-700">¡Eres de la élite de FitNet! Perfil verificado activo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Level Roadmap: shows all 5 levels with locked/unlocked ─────
export const LevelRoadmap = ({ fitnessProfile }) => {
  const xp = calculateXP(fitnessProfile);
  const currentLevel = getLevelFromXP(xp);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">Camino de Progresión</h3>
      <div className="space-y-3">
        {LEVELS.map((lvl, idx) => {
          const isUnlocked = xp >= lvl.minXP;
          const isCurrent = lvl.level === currentLevel.level;
          const isNext = !isCurrent && lvl.level === currentLevel.level + 1;

          return (
            <div
              key={lvl.level}
              className={`flex items-center space-x-4 p-3.5 rounded-2xl border transition-all ${
                isCurrent
                  ? `${lvl.bgLight} ${lvl.border} shadow-sm`
                  : isUnlocked
                  ? 'bg-slate-50 border-slate-100'
                  : 'bg-white border-slate-50 opacity-50'
              }`}
            >
              {/* Level emoji circle */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                isUnlocked ? `bg-gradient-to-br ${lvl.gradient} shadow-md` : 'bg-slate-100'
              }`}>
                {isUnlocked ? lvl.emoji : '🔒'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-black ${isCurrent ? lvl.textColor : 'text-slate-700'}`}>
                    Nivel {lvl.level}: {lvl.name}
                  </p>
                  {isCurrent && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${lvl.bgLight} ${lvl.textColor} ${lvl.border} border`}>
                      ACTUAL
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                      SIGUIENTE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Desde {lvl.minXP.toLocaleString()} XP
                  {lvl.maxXP !== Infinity ? ` · Hasta ${lvl.maxXP.toLocaleString()} XP` : ' en adelante'}
                </p>
              </div>

              {/* XP status */}
              <div className="text-right shrink-0">
                {isUnlocked ? (
                  <span className="text-[10px] font-black text-emerald-600">✓ Desbloqueado</span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {(lvl.minXP - xp).toLocaleString()} XP
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* XP guide */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Cómo ganar XP</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { action: 'Sesión completada', xp: '+10 XP' },
            { action: 'Día de racha', xp: '+5 XP' },
            { action: 'Racha de 7 días', xp: '+50 XP' },
            { action: 'Racha de 30 días', xp: '+250 XP' },
            { action: '10 entrenamientos', xp: '+50 XP' },
            { action: '100 entrenamientos', xp: '+500 XP' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              <span className="text-[10px] text-slate-600 font-medium">{item.action}</span>
              <span className="text-[10px] font-black text-blue-600">{item.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelBadge;
