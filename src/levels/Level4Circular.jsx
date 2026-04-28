import React, { useEffect, useState, useMemo } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiLoader } from 'react-icons/fi';

const Level4Content = ({ metrics }) => {
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
      const angle = (i * 2 * Math.PI) / NUM_PARTICLES - Math.PI / 2; // Start from top
      pts.push({
        id: i,
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle)
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    if (isComplete || !metrics || !metrics.nose) return;

    if (progressIdx < NUM_PARTICLES) {
      const target = particles[progressIdx];
      const visualNose = metrics.visualNose;
      
      // visualNose matches HTML coordinates. The target is rendered at `1 - target.x` (mirrored).
      const dx = visualNose.x - (1 - target.x);
      const dy = visualNose.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Hitbox tolerance
      if (dist < 0.08) {
        const nextIdx = progressIdx + 1;
        setProgressIdx(nextIdx);
        if (nextIdx >= NUM_PARTICLES) {
          setIsComplete(true);
          completeLevel(4);
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
                left: `${(1 - p.x) * 100}%`, // Mirror X because video is mirrored scale-x-[-1]
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

      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="bg-white border-4 border-slate-900 px-6 py-3 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-4">
          <FiLoader className="w-6 h-6 text-emerald-500 animate-spin" />
          <span className="text-xl font-black font-mono text-slate-900">{progressIdx} / {NUM_PARTICLES}</span>
        </div>
      </div>

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
