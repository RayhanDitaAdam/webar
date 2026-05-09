import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { playSuccessSound, playPhaseCompleteSound } from '../utils/audio';
import { IoFootball } from 'react-icons/io5';
import { FiArchive } from 'react-icons/fi';

const Level5Content = ({ metrics, levelStarted, setIsLevelComplete }) => {
  const { completeLevel } = useGameState();
  const [headers, setHeaders] = useState(0);
  const [isScored, setIsScored] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [objects, setObjects] = useState([]);

  const TARGET_CATCHES = 10;
  const reqRef = useRef(null);
  const lastSpawnRef = useRef(Date.now());
  const objectsRef = useRef([]);
  const headersRef = useRef(0);

  const CATCH_THRESHOLD_X = 0.08;
  const CATCH_THRESHOLD_Y = 0.08;

  const metricsRef = useRef(metrics);
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  const gameLoop = useCallback(() => {
    if (isComplete || !metricsRef.current?.visualNose) return;

    const now = Date.now();
    let currentObjects = [...objectsRef.current];

    // Spawn a new ball every 2.2 seconds, max 4 on screen
    if (now - lastSpawnRef.current > 2200 && currentObjects.length < 4) {
      currentObjects.push({
        id: now,
        x: 0.15 + Math.random() * 0.7,
        y: -0.15,
        speed: 0.010 + Math.random() * 0.005, // made them fall faster
      });
      lastSpawnRef.current = now;
    }

    const nose = metricsRef.current.visualNose;
    let hitDetected = false;

    currentObjects = currentObjects.filter(obj => {
      obj.y += obj.speed;

      const realDx = Math.abs((1 - obj.x) - nose.x);
      const realDy = Math.abs(obj.y - nose.y);

      if (realDx < CATCH_THRESHOLD_X && realDy < CATCH_THRESHOLD_Y) {
        hitDetected = true;
        headersRef.current += 1;
        setHeaders(headersRef.current);

        if (headersRef.current >= TARGET_CATCHES) {
          playSuccessSound();
          setIsComplete(true);
          if (setIsLevelComplete) setIsLevelComplete(true);
          completeLevel(5);
        } else {
          playPhaseCompleteSound();
        }
        return false;
      }

      if (obj.y > 1.2) return false;

      return true;
    });

    objectsRef.current = currentObjects;
    setObjects(currentObjects);

    if (hitDetected) {
      setIsScored(true);
      setTimeout(() => setIsScored(false), 400);
    }

    if (!isComplete) {
      reqRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isComplete, completeLevel]);

  useEffect(() => {
    if (!isComplete) {
      reqRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameLoop, isComplete]);

  const nosePos = metrics?.visualNose;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {/* Basket on Nose */}
        {nosePos && !isComplete && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
            style={{
              left: `${nosePos.x * 100}%`,
              top: `${nosePos.y * 100}%`,
            }}
          >
            <FiArchive
              className={`w-7 h-7 sm:w-9 sm:h-9 transition-all duration-150 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] ${
                isScored ? 'scale-125 text-emerald-300' : 'text-white'
              }`}
            />
          </div>
        )}

        {/* Falling Balls */}
        {objects.map(obj => (
          <div
            key={obj.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(1 - obj.x) * 100}%`,
              top: `${obj.y * 100}%`,
            }}
          >
            <div className="p-2.5 sm:p-3 rounded-full bg-white border-4 border-slate-900 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
              <IoFootball className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Floating Progress (follows nose) */}
      {nosePos && !isComplete && (
        <div
          className="absolute pointer-events-none transition-all duration-150 ease-out z-40 flex flex-col items-center"
          style={{
            left: `${nosePos.x * 100}%`,
            top: `${(nosePos.y + 0.1) * 100}%`,
            transform: `translate(-50%, 0)`,
          }}
        >
          <div
            className={`bg-white border-2 border-slate-900 px-4 py-1.5 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2 transition-all ${
              isScored ? 'scale-125 border-emerald-500 bg-emerald-50' : 'scale-100'
            }`}
          >
            <span className="text-sm font-black text-slate-900 leading-none">{headers}</span>
            <span className="text-xs font-black text-slate-300 leading-none">/</span>
            <span className="text-sm font-black text-slate-400 leading-none">{TARGET_CATCHES}</span>
          </div>
          <div className="mt-1 bg-slate-900 text-white text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
            Catches
          </div>
        </div>
      )}

      {isComplete && <LevelCompleteOverlay levelNum={5} nextLevelUnlocked={true} />}
    </>
  );
};

export const Level5Dodge = () => {
  return (
    <LevelWrapper
      levelNum={5}
      title="Basket Catch"
      instruction="Catch the falling soccer balls with the basket on your nose! Move your head to position the basket."
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

const LevelContentWrapper = (props) => <Level5Content {...props} />;
