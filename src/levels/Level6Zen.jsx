import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiBriefcase } from 'react-icons/fi';

const Level6Content = ({ metrics }) => {
  const { completeLevel } = useGameState();
  const [progress, setProgress] = useState(0);
  const [isFailing, setIsFailing] = useState(false);
  const [failPos, setFailPos] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  const holdStartRef = useRef(null);
  const lastPosRef = useRef(null);
  const REQUIRED_HOLD_MS = 15000; // 15 seconds

  // Suitcases stack representation
  const stack = [1, 2, 3];

  useEffect(() => {
    if (isComplete || !metrics || !metrics.headTop) return;

    // Strict conditions for balance
    // 1. Pitch must be center
    // 2. Yaw must be center
    // 3. Roll must be small
    // 4. Movement velocity must be small

    const headTop = metrics.headTop;
    const isPostureGood = metrics.pitch === 'center' && metrics.yaw === 'center' && Math.abs(metrics.roll) < 8;
    
    let isMovingTooFast = false;
    if (lastPosRef.current) {
      const dx = headTop.x - lastPosRef.current.x;
      const dy = headTop.y - lastPosRef.current.y;
      const velocity = Math.sqrt(dx*dx + dy*dy);
      if (velocity > 0.05) { // Threshold for sudden movement
        isMovingTooFast = true;
      }
    }
    lastPosRef.current = headTop;

    const isBalanced = isPostureGood && !isMovingTooFast;

    if (isBalanced) {
      if (isFailing) setIsFailing(false);
      
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
      }
      const elapsed = Date.now() - holdStartRef.current;
      const currentProgress = Math.min((elapsed / REQUIRED_HOLD_MS) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        setIsComplete(true);
        completeLevel(6);
      }
    } else {
      // Failed balance
      if (progress > 0) {
        setIsFailing(true);
        setFailPos(metrics.headTop);
        holdStartRef.current = null;
        setProgress(0); // Instantly reset
        
        // Remove failing state after animation
        setTimeout(() => setIsFailing(false), 1000);
      }
    }

  }, [metrics, isComplete, progress, isFailing, completeLevel]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Render Suitcases on Head */}
        {metrics?.headTop && !isFailing && (
          <div 
            className="absolute -translate-x-1/2 bottom-0 flex flex-col-reverse items-center transition-all duration-75"
            style={{
              left: `${(1 - metrics.headTop.x) * 100}%`,
              bottom: `${(1 - metrics.headTop.y) * 100 + 5}%` // Place slightly above the head mark
            }}
          >
            {stack.map((item, i) => (
              <div 
                key={item} 
                className={`mb-1 p-3 rounded-xl border-4 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${progress > 0 ? 'bg-emerald-400 border-slate-900 text-slate-900' : 'bg-white border-slate-400 text-slate-400'}`}
                style={{
                  transform: `rotate(${metrics.roll * (i * 0.5 + 1)}deg) translateX(${metrics.roll * i}px)`,
                  width: `${80 - i * 10}px`,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <FiBriefcase className="w-6 h-6" />
              </div>
            ))}
          </div>
        )}

        {/* Falling Animation */}
        {isFailing && failPos && (
          <div 
            className="absolute -translate-x-1/2 bottom-0 flex flex-col items-center"
            style={{
              left: `${(1 - failPos.x) * 100}%`,
              bottom: `${(1 - failPos.y) * 100}%`
            }}
          >
            {stack.map((item, i) => (
              <div 
                key={`fail-${item}`} 
                className="absolute p-3 rounded-xl bg-rose-400 border-4 border-slate-900 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[fall_1s_ease-in_forwards]"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  left: `${(Math.random() - 0.5) * 100}px`
                }}
              >
                <FiBriefcase className="w-6 h-6" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress HUD */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-64 max-w-full">
        <div className="flex justify-between text-xs font-black tracking-widest uppercase mb-2">
          <span className={isFailing ? 'text-rose-500 animate-pulse' : 'text-slate-900'}>
            {isFailing ? 'Oops! Ulangi' : 'Balance'}
          </span>
          <span className="text-emerald-600">{Math.round((progress / 100) * 15)}s / 15s</span>
        </div>
        <div className="w-full bg-white rounded-full h-4 border-2 border-slate-900 overflow-hidden shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <div 
            className={`h-full transition-all duration-100 ease-out border-r-2 border-slate-900 ${isFailing ? 'bg-rose-400' : 'bg-emerald-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isComplete && <LevelCompleteOverlay levelNum={6} nextLevelUnlocked={false} />}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export const Level6Zen = () => {
  return (
    <LevelWrapper 
      levelNum={6} 
      title="The Ultimate Zen" 
      instruction="Balance the stack of suitcases on your head. Keep your posture upright and still for 15 seconds!"
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

const LevelContentWrapper = (props) => <Level6Content {...props} />;
