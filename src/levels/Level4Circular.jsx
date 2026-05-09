import React, { useEffect, useState, useMemo } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiLoader } from 'react-icons/fi';
import { playSuccessSound, playPhaseCompleteSound } from '../utils/audio';

const Level4Content = ({ metrics, levelStarted, setIsLevelComplete }) => {

  const { completeLevel } = useGameState();
  const [progressIdx, setProgressIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const NUM_PARTICLES = 12;

  // Generate circle coordinates (0 to 1 space)
  const particles = useMemo(() => {
    const pts = [];
    const radiusX = 0.15; // Ellipse depending on screen ratio, but using relative coordinates
    const radiusY = 0.2; 
    const centerX = 0.5;
    const centerY = 0.5;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const angle = (i * 2 * Math.PI) / NUM_PARTICLES - Math.PI / 2; // Math clockwise is actually counter-clockwise, but let's just reverse the sign if needed.
      // Wait, if I want it clockwise on screen (where Y increases downwards), 
      // angle increasing means clockwise if we use (cos, sin).
      // But mirrored X means we need to be careful.
      // Let's just use -i to reverse it.
      const reverseAngle = (-i * 2 * Math.PI) / NUM_PARTICLES - Math.PI / 2;
      pts.push({
        id: i,
        x: centerX + radiusX * Math.cos(reverseAngle),
        y: centerY + radiusY * Math.sin(reverseAngle)
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    if (isComplete || !metrics || !metrics.nose) return;

    if (progressIdx < NUM_PARTICLES) {
      const target = particles[progressIdx];
      const visualNose = metrics.visualNose;
      
      const dx = visualNose.x - (1 - target.x);
      const dy = visualNose.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.08) {
        const nextIdx = progressIdx + 1;
        setProgressIdx(nextIdx);
        if (nextIdx >= NUM_PARTICLES) {
          playSuccessSound();
          setIsComplete(true);
          if (setIsLevelComplete) setIsLevelComplete(true);
          completeLevel(4);
        } else {
          playPhaseCompleteSound();
        }
      }
    }
  }, [metrics, isComplete, progressIdx, particles, completeLevel]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {/* Draw Particles */}
        {particles.map((p, idx) => {
          const isPassed = idx < progressIdx;
          const isCurrentTarget = idx === progressIdx;

          return (
            <div 
              key={p.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isCurrentTarget ? 'scale-150 animate-pulse' : 'scale-100'}`}
              style={{
                left: `${(1 - p.x) * 100}%`,
                top: `${p.y * 100}%`,
              }}
            >
              <div className={`w-4 h-4 rounded-full border-2 border-slate-900 transition-colors duration-300 ${
                isPassed ? 'bg-emerald-400 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' : 
                isCurrentTarget ? 'bg-amber-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] w-6 h-6 border-4' : 
                'bg-white border-slate-300'
              }`} />
            </div>
          );
        })}
        
      </div>

      {/* Floating Progress (Follows Head) */}
      {metrics?.visualHeadTop && !isComplete && (
        <div 
          className="absolute pointer-events-none transition-all duration-150 ease-out z-40 flex flex-col items-center"
          style={{
            left: `${metrics.visualHeadTop.x * 100}%`,
            top: `${metrics.visualHeadTop.y * 100}%`,
            transform: `translate(-50%, 120%)`, 
          }}
        >
          <div className="bg-white border-2 border-slate-900 px-4 py-1.5 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-3">
            <FiLoader className="w-4 h-4 text-emerald-600 animate-spin" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900 leading-none">{progressIdx}</span>
              <span className="text-xs font-black text-slate-200 leading-none">/</span>
              <span className="text-sm font-black text-slate-400 leading-none">{NUM_PARTICLES}</span>
            </div>
          </div>
          <div className="mt-1 bg-slate-900 text-white text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
            Voyage Progress
          </div>
        </div>
      )}



      {isComplete && <LevelCompleteOverlay levelNum={4} nextLevelUnlocked={true} />}
    </>
  );
};

export const Level4Circular = () => {
  return (
    <LevelWrapper 
      levelNum={4} 
      title="Circular Voyage" 
      instruction="Use your nose to follow the circular particle path on the screen. Complete one full circle!"
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

const LevelContentWrapper = (props) => <Level4Content {...props} />;
