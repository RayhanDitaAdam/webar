import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiBriefcase, FiPackage } from 'react-icons/fi';
import { playSuccessSound, playPhaseCompleteSound } from '../utils/audio';

const Level1Content = ({ metrics, levelStarted, setIsLevelComplete }) => {

  const { completeLevel } = useGameState();
  const [phase, setPhase] = useState('up'); // 'up' then 'down'
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const holdStartRef = useRef(null);
  const REQUIRED_HOLD_MS = 3000; // 3 seconds per phase

  useEffect(() => {
    if (isComplete || !metrics) return;

    // Check if user is in the correct pose for the current phase
    const isCorrectPose = phase === 'up' ? metrics.pitch === 'up' : metrics.pitch === 'down';

    if (isCorrectPose) {
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
      }
      const elapsed = Date.now() - holdStartRef.current;
      const currentProgress = Math.min((elapsed / REQUIRED_HOLD_MS) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (phase === 'up') {
          playPhaseCompleteSound();
          setPhase('down');
          setProgress(0);
          holdStartRef.current = null;
        } else {
          playSuccessSound();
          setIsComplete(true);
          if (setIsLevelComplete) setIsLevelComplete(true);
          completeLevel(1);
        }
      }
    } else {
      holdStartRef.current = null;
      // Gradually decrease progress if they lose the pose
      if (progress > 0) {
        setProgress(Math.max(0, progress - 1));
      }
    }
  }, [metrics, isComplete, progress, completeLevel, phase]);

  return (
    <>
      <div className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none w-full transition-all duration-700 ${

        phase === 'up' ? 'top-[25%]' : 'top-[75%]'
      }`}>
        
        {/* Target Visual with Circular Progress */}
        <div className={`relative transition-all duration-500 transform ${
          (phase === 'up' && metrics?.pitch === 'up') || (phase === 'down' && metrics?.pitch === 'down') 
          ? 'scale-110' : 'scale-100'
        }`}>
          {/* Progress Ring */}
          <svg className="absolute inset-[-15px] w-[calc(100%+30px)] h-[calc(100%+30px)] -rotate-90">
            <circle
              cx="50%" cy="50%" r="46%"
              fill="none" 
              stroke={phase === 'up' ? '#10b981' : '#f59e0b'} 
              strokeWidth="6"
              strokeDasharray="300"
              strokeDashoffset={300 - (300 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-150"
            />
          </svg>

          <div className={`p-8 rounded-[2rem] border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${
            (phase === 'up' && metrics?.pitch === 'up') || (phase === 'down' && metrics?.pitch === 'down')
            ? 'border-slate-900 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-300'
          }`}>
            {phase === 'up' ? <FiBriefcase className="w-16 h-16" /> : <FiPackage className="w-16 h-16" />}
          </div>

          {/* Phase Label */}
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full border-2 border-slate-900 font-black text-[12px] uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] whitespace-nowrap ${
            phase === 'up' ? 'bg-emerald-300' : 'bg-amber-300'
          }`}>
            {phase === 'up' ? "Phase 1: Look Up" : "Phase 2: Look Down"}
          </div>
        </div>
      </div>


      {isComplete && <LevelCompleteOverlay levelNum={1} nextLevelUnlocked={true} />}

      {/* Floating Progress (Follows Head) */}
      {metrics?.visualHeadTop && levelStarted && !isComplete && (


        <div 
          className="absolute pointer-events-none transition-all duration-150 ease-out z-50 flex flex-col items-center"
          style={{
            left: `${metrics.visualHeadTop.x * 100}%`,
            top: `${metrics.visualHeadTop.y * 100}%`,
            transform: `translate(-50%, 120%)`,

          }}
        >
          <div className="bg-white border-2 border-slate-900 px-3 py-1 rounded-full shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Progress:</span>
            <span className="text-sm font-black text-slate-900">{phase === 'up' ? '1' : '2'} / 2</span>
          </div>
        </div>
      )}
    </>
  );
};


export const Level1SkyGazer = () => {
  return (
    <LevelWrapper 
      levelNum={1} 
      title="The Sky Gazer" 
      instruction="Look up to find the floating suitcase, then look down to place it. Hold each for 3 seconds!"
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

const LevelContentWrapper = (props) => <Level1Content {...props} />;
