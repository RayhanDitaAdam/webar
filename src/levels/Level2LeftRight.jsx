import React, { useEffect, useState } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiBriefcase } from 'react-icons/fi';

const Level2Content = ({ metrics }) => {
  const { completeLevel } = useGameState();
  const [lookCount, setLookCount] = useState(0);
  const [lastDirection, setLastDirection] = useState('center');
  const [isComplete, setIsComplete] = useState(false);
  const TARGET_LOOKS = 6; // 3 left, 3 right

  useEffect(() => {
    if (isComplete || !metrics) return;

    const currentYaw = metrics.yaw;

    if (currentYaw !== 'center' && currentYaw !== lastDirection) {
      setLookCount(prev => {
        const newCount = prev + 1;
        if (newCount >= TARGET_LOOKS) {
          setIsComplete(true);
          completeLevel(2);
        }
        return newCount;
      });
      setLastDirection(currentYaw);
    } else if (currentYaw === 'center') {
      setLastDirection('center');
    }

  }, [metrics, isComplete, lastDirection, completeLevel]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-12 sm:px-24">
        
        {/* Left Target */}
        <div className={`transition-all duration-300 ${metrics?.yaw === 'left' ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`}>
          <div className={`p-6 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${metrics?.yaw === 'left' ? 'border-slate-900 bg-emerald-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
            <FiBriefcase className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        </div>

        {/* Right Target */}
        <div className={`transition-all duration-300 ${metrics?.yaw === 'right' ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`}>
          <div className={`p-6 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${metrics?.yaw === 'right' ? 'border-slate-900 bg-rose-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
            <FiBriefcase className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        </div>
      </div>

      {/* Progress HUD */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center bg-white border-2 border-slate-900 px-8 py-4 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <p className="text-slate-900 mb-2 font-black tracking-widest uppercase text-sm">Progress</p>
        <div className="flex gap-2">
          {Array.from({ length: TARGET_LOOKS }).map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 border-slate-900 transition-colors duration-300 ${i < lookCount ? 'bg-emerald-400' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

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
