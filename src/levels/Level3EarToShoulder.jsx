import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { playSuccessSound, playPhaseCompleteSound } from '../utils/audio';
import { FiSmile } from 'react-icons/fi';


const Level2Content = ({ metrics, levelStarted, setIsLevelComplete }) => { // Note: Should have been Level3Content, but keeping consistent with level logic
  const { completeLevel } = useGameState();
  const [targetSide, setTargetSide] = useState('left');
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const holdStartRef = useRef(null);
  
  const REQUIRED_HOLD_MS = 3000; // Reduced to 3s for better mobile UX
  const TILT_THRESHOLD = 0.04;

  useEffect(() => {
    if (isComplete || !metrics || !metrics.landmarks) return;

    const leftEye = metrics.landmarks[33];
    const rightEye = metrics.landmarks[263];
    const dy = rightEye.y - leftEye.y; 
    
    let currentTilt = 'center';
    // Swapped left/right to fix inversion
    if (dy < -TILT_THRESHOLD) currentTilt = 'right';
    else if (dy > TILT_THRESHOLD) currentTilt = 'left';

    if (currentTilt === targetSide) {
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
      }
      const elapsed = Date.now() - holdStartRef.current;
      const currentProgress = Math.min((elapsed / REQUIRED_HOLD_MS) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (targetSide === 'left') {
          playPhaseCompleteSound();
          setTargetSide('right');
          setProgress(0);
          holdStartRef.current = null;
        } else if (targetSide === 'right') {
          playSuccessSound();
          setIsComplete(true);
          if (setIsLevelComplete) setIsLevelComplete(true);
          completeLevel(3);
        }
      }
    } else {
      holdStartRef.current = null;
      setProgress(prev => Math.max(0, prev - 1.5)); // Decay progress
    }

  }, [metrics, isComplete, targetSide, completeLevel]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex items-end justify-between px-12 sm:px-32 pb-40">
        
        {/* Left Target (Shoulder Position) */}
        <div className={`relative transition-all duration-300 ${targetSide === 'left' ? 'scale-110 opacity-100' : 'scale-90 opacity-30'}`}>
          {targetSide === 'left' && (
            <svg 
              viewBox="0 0 100 100"
              className="absolute inset-[-15px] w-[calc(100%+30px)] h-[calc(100%+30px)] -rotate-90"
            >
              <circle
                cx="50" cy="50" r="46"
                fill="none" stroke="#e2e8f0" strokeWidth="6"
              />
              <circle
                cx="50" cy="50" r="46"
                fill="none" stroke="#60a5fa" strokeWidth="6"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-150"
                style={{ opacity: progress > 0 ? 1 : 0 }}
              />
            </svg>
          )}
          <div className={`p-8 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${targetSide === 'left' && progress > 0 ? 'border-slate-900 bg-blue-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
            <FiSmile className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            {targetSide === 'left' ? 'LEFT SHOULDER' : 'DONE'}
          </div>
        </div>

        {/* Right Target (Shoulder Position) */}
        <div className={`relative transition-all duration-300 ${targetSide === 'right' ? 'scale-110 opacity-100' : 'scale-90 opacity-30'}`}>
          {targetSide === 'right' && (
            <svg 
              viewBox="0 0 100 100"
              className="absolute inset-[-15px] w-[calc(100%+30px)] h-[calc(100%+30px)] -rotate-90"
            >
              {/* Track Ring */}
              <circle
                cx="50" cy="50" r="46"
                fill="none" stroke="#e2e8f0" strokeWidth="6"
                className="opacity-50"
              />
              {/* Progress Fill */}
              <circle
                cx="50" cy="50" r="46"
                fill="none" stroke="#a855f7" strokeWidth="6"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * progress) / 100}
                strokeLinecap="round"
                style={{ opacity: progress > 0 ? 1 : 0 }}
              />
            </svg>
          )}
          <div className={`p-8 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${targetSide === 'right' && progress > 0 ? 'border-slate-900 bg-purple-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
            <FiSmile className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            {targetSide === 'right' ? 'RIGHT SHOULDER' : 'WAIT'}
          </div>
        </div>
      </div>

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
            <div className={`w-2 h-2 rounded-full ${progress > 0 ? 'bg-blue-500 animate-ping' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Stretch:</span>
            <span className="text-sm font-black text-slate-900">{targetSide === 'left' ? '1' : '2'} / 2</span>
          </div>
        </div>
      )}



      {isComplete && <LevelCompleteOverlay levelNum={3} nextLevelUnlocked={true} />}
    </>
  );
};

const Level3Content = Level2Content; // Renaming for clarity internally

export const Level3EarToShoulder = () => {
  return (
    <LevelWrapper 
      levelNum={3} 
      title="Ear-to-Shoulder" 
      instruction="Gently tilt your head toward your left shoulder, then your right shoulder."
    >
      <Level3Content />
    </LevelWrapper>
  );
};


const LevelContentWrapper = (props) => <Level3Content {...props} />;
