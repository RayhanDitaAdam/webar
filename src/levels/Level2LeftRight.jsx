import React, { useEffect, useState } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { playSuccessSound, playPhaseCompleteSound } from '../utils/audio';
import { FiBriefcase } from 'react-icons/fi';


const Level2Content = ({ metrics, levelStarted, setIsLevelComplete }) => {
  const { completeLevel } = useGameState();
  const [lookCount, setLookCount] = useState(0);
  const [currentTarget, setCurrentTarget] = useState('left');
  const [holdTime, setHoldTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const TARGET_LOOKS = 6;
  const HOLD_DURATION = 2000; // 2 seconds

  useEffect(() => {
    if (isComplete || !metrics) return;

    const currentYaw = metrics.yaw;
    let timer;

    if (currentYaw === currentTarget) {
      // Start/Continue holding
      timer = setInterval(() => {
        setHoldTime(prev => {
          const next = prev + 100;
          if (next >= HOLD_DURATION) {
            // Success for this side!
            const nextCount = lookCount + 1;
            setLookCount(nextCount);
            setHoldTime(0);
            
            if (nextCount >= TARGET_LOOKS) {
              playSuccessSound();
              setIsComplete(true);
              if (setIsLevelComplete) setIsLevelComplete(true);
              completeLevel(2);
            } else {
              playPhaseCompleteSound();
              setCurrentTarget(currentTarget === 'left' ? 'right' : 'left');
            }
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      // Reset if they look away
      setHoldTime(0);
    }

    return () => clearInterval(timer);
  }, [metrics?.yaw, currentTarget, isComplete, lookCount, completeLevel]);

  const progressPercent = (holdTime / HOLD_DURATION) * 100;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-8 sm:px-24">
        
        {/* Left Target */}
        <div className={`relative transition-all duration-300 ${currentTarget === 'left' ? 'scale-110 opacity-100' : 'scale-90 opacity-30'}`}>
          {/* Progress Circle (SVG) */}
          {currentTarget === 'left' && (
            <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="300"
                strokeDashoffset={300 - (300 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-100"
              />
            </svg>
          )}
          <div className={`p-6 sm:p-8 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${metrics?.yaw === 'left' ? 'border-slate-900 bg-emerald-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
            <FiBriefcase className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">
            {currentTarget === 'left' ? 'LOOK HERE' : 'WAIT'}
          </div>
        </div>

        {/* Right Target */}
        <div className={`relative transition-all duration-300 ${currentTarget === 'right' ? 'scale-110 opacity-100' : 'scale-90 opacity-30'}`}>
          {/* Progress Circle (SVG) */}
          {currentTarget === 'right' && (
            <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="4"
                strokeDasharray="300"
                strokeDashoffset={300 - (300 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-100"
              />
            </svg>
          )}
          <div className={`p-6 sm:p-8 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${metrics?.yaw === 'right' ? 'border-slate-900 bg-rose-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
            <FiBriefcase className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">
            {currentTarget === 'right' ? 'LOOK HERE' : 'WAIT'}
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
            <div className={`w-2 h-2 rounded-full ${holdTime > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Turns:</span>
            <span className="text-sm font-black text-slate-900">{lookCount} / {TARGET_LOOKS}</span>
          </div>
        </div>
      )}


      {isComplete && <LevelCompleteOverlay levelNum={2} nextLevelUnlocked={true} />}
    </>
  );
};


export const Level2LeftRight = () => {
  return (
    <LevelWrapper 
      levelNum={2} 
      title="Left-Right Looker" 
      instruction="Turn your head fully to the left, then to the right. Repeat 3 times (Total 6 turns)."
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

const LevelContentWrapper = (props) => <Level2Content {...props} />;
