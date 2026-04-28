import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiSmile } from 'react-icons/fi';

const Level3Content = ({ metrics }) => {
  const { completeLevel } = useGameState();
  const [targetSide, setTargetSide] = useState('left'); // 'left', 'right', 'done'
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const holdStartRef = useRef(null);
  const REQUIRED_HOLD_MS = 5000; // 5 seconds

  useEffect(() => {
    if (isComplete || !metrics || !metrics.landmarks) return;

    // Recalculate tilt specifically for this level to be safe
    const leftEye = metrics.landmarks[33];
    const rightEye = metrics.landmarks[263];
    const dy = rightEye.y - leftEye.y; 
    
    // In selfie camera:
    // User tilts LEFT shoulder -> User's left eye (33) goes DOWN (y increases). Right eye (263) goes UP (y decreases).
    // So dy = rightEye.y - leftEye.y will be NEGATIVE.
    // User tilts RIGHT shoulder -> dy will be POSITIVE.
    
    const tiltThreshold = 0.05; // Adjust this threshold based on testing
    let currentTilt = 'center';
    if (dy < -tiltThreshold) currentTilt = 'left';
    if (dy > tiltThreshold) currentTilt = 'right';

    if (currentTilt === targetSide) {
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
      }
      const elapsed = Date.now() - holdStartRef.current;
      const currentProgress = Math.min((elapsed / REQUIRED_HOLD_MS) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        if (targetSide === 'left') {
          setTargetSide('right');
          setProgress(0);
          holdStartRef.current = null;
        } else if (targetSide === 'right') {
          setTargetSide('done');
          setIsComplete(true);
          completeLevel(3);
        }
      }
    } else {
      holdStartRef.current = null;
      setProgress(Math.max(0, progress - 2)); // Decay progress slowly
    }

  }, [metrics, isComplete, targetSide, progress, completeLevel]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex items-end justify-between px-16 sm:px-32 pb-32">
        
        {/* Left Shoulder Target */}
        <div className="flex flex-col items-center">
          <div className={`transition-all duration-300 ${targetSide === 'left' ? 'scale-125 opacity-100' : 'scale-100 opacity-40'} ${targetSide === 'right' || targetSide === 'done' ? 'grayscale' : ''}`}>
            <div className={`p-6 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${targetSide === 'left' && progress > 0 ? 'border-slate-900 bg-blue-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
              <FiSmile className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
          </div>
          {/* Progress Bar for Left */}
          {targetSide === 'left' && (
            <div className="mt-6 w-24 bg-white rounded-full h-4 border-2 border-slate-900 overflow-hidden shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <div className="bg-blue-400 h-full transition-all duration-100 ease-out border-r-2 border-slate-900" style={{ width: `${progress}%` }} />
            </div>
          )}
          {targetSide !== 'left' && <div className="mt-6 h-4" />}
        </div>

        {/* Right Shoulder Target */}
        <div className="flex flex-col items-center">
          <div className={`transition-all duration-300 ${targetSide === 'right' ? 'scale-125 opacity-100' : 'scale-100 opacity-40'} ${targetSide === 'done' ? 'grayscale' : ''}`}>
            <div className={`p-6 rounded-full border-4 transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${targetSide === 'right' && progress > 0 ? 'border-slate-900 bg-purple-300 text-slate-900' : 'border-slate-400 bg-white text-slate-400'}`}>
              <FiSmile className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
          </div>
          {/* Progress Bar for Right */}
          {targetSide === 'right' && (
            <div className="mt-6 w-24 bg-white rounded-full h-4 border-2 border-slate-900 overflow-hidden shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <div className="bg-purple-400 h-full transition-all duration-100 ease-out border-r-2 border-slate-900" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>

      {isComplete && <LevelCompleteOverlay levelNum={3} nextLevelUnlocked={true} />}
    </>
  );
};

export const Level3EarToShoulder = () => {
  return (
    <LevelWrapper 
      levelNum={3} 
      title="Ear-to-Shoulder" 
      instruction="Tilt your head until your ear touches your left shoulder (Hold 5s), then right shoulder (Hold 5s)."
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

const LevelContentWrapper = (props) => <Level3Content {...props} />;
