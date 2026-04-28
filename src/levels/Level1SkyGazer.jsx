import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiBriefcase } from 'react-icons/fi';

const Level1Content = ({ metrics }) => {
  const { completeLevel } = useGameState();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const holdStartRef = useRef(null);
  const REQUIRED_HOLD_MS = 3000; // 3 seconds

  useEffect(() => {
    if (isComplete || !metrics) return;

    if (metrics.pitch === 'up') {
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
      }
      const elapsed = Date.now() - holdStartRef.current;
      const currentProgress = Math.min((elapsed / REQUIRED_HOLD_MS) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        setIsComplete(true);
        completeLevel(1);
      }
    } else {
      holdStartRef.current = null;
      setProgress(Math.max(0, progress - 5)); // Gradually decrease if not holding
    }
  }, [metrics, isComplete, progress, completeLevel]);

  return (
    <>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
        {/* Suitcase Target */}
        <div className={`relative transition-transform duration-500 ${metrics?.pitch === 'up' ? 'scale-110' : 'scale-100'}`}>
          <div className={`absolute inset-0 bg-emerald-400 blur-xl rounded-full transition-opacity duration-300 ${progress > 0 ? 'opacity-50' : 'opacity-0'}`} />
          <div className={`p-6 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${metrics?.pitch === 'up' ? 'border-slate-900 bg-emerald-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
            <FiBriefcase className="w-16 h-16" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 bg-white rounded-full h-6 border-4 border-slate-900 overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div 
            className="bg-emerald-400 h-full transition-all duration-100 ease-out border-r-4 border-slate-900"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isComplete && <LevelCompleteOverlay levelNum={1} nextLevelUnlocked={true} />}
    </>
  );
};

export const Level1SkyGazer = () => {
  return (
    <LevelWrapper 
      levelNum={1} 
      title="The Sky Gazer" 
      instruction="Look up at the ceiling to catch the floating suitcase. Hold the position for 3 seconds!"
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

// We need a wrapper to receive the cloned metrics from LevelWrapper
const LevelContentWrapper = (props) => <Level1Content {...props} />;
