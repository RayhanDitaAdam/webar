import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { FiBriefcase, FiAlertTriangle } from 'react-icons/fi';

const Level5Content = ({ metrics }) => {
  const { completeLevel } = useGameState();
  const [dodged, setDodged] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [objects, setObjects] = useState([]);
  
  const TARGET_DODGES = 10;
  const reqRef = useRef(null);
  const lastSpawnRef = useRef(Date.now());
  const objectsRef = useRef([]); // Use ref for game loop to avoid stale closure
  const dodgedRef = useRef(0);

  const HIT_THRESHOLD_X = 0.06;
  const HIT_THRESHOLD_Y = 0.08;

  const metricsRef = useRef(metrics);
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  const gameLoop = useCallback(() => {
    if (isComplete || !metricsRef.current?.nose) return;

    const now = Date.now();
    let currentObjects = [...objectsRef.current];

    // Spawn new object every 1.5 seconds
    if (now - lastSpawnRef.current > 1500 && currentObjects.length < 3) {
      currentObjects.push({
        id: now,
        x: 0.2 + Math.random() * 0.6, // between 0.2 and 0.8
        y: -0.1,
        speed: 0.005 + Math.random() * 0.003
      });
      lastSpawnRef.current = now;
    }

    // Update positions & check collisions
    const visualNose = metricsRef.current.visualNose;
    let hitDetected = false;

    currentObjects = currentObjects.filter(obj => {
      obj.y += obj.speed;

      // Collision check
      // obj.x is visually rendered at `1 - obj.x`, but visualNose.x is already mapped to HTML space
      const realDx = Math.abs((1 - obj.x) - visualNose.x);
      const realDy = Math.abs(obj.y - visualNose.y);

      if (realDx < HIT_THRESHOLD_X && realDy < HIT_THRESHOLD_Y) {
        hitDetected = true;
        return false; // Remove object on hit
      }

      // Passed the bottom (dodged)
      if (obj.y > 1.1) {
        dodgedRef.current += 1;
        setDodged(dodgedRef.current);
        if (dodgedRef.current >= TARGET_DODGES) {
          setIsComplete(true);
          completeLevel(5);
        }
        return false; // Remove
      }

      return true; // Keep
    });

    objectsRef.current = currentObjects;
    setObjects(currentObjects);

    if (hitDetected) {
      setIsHit(true);
      // Optional: deduct dodge count or just shake screen
      setTimeout(() => setIsHit(false), 500); // Reset hit state after animation
    }

    if (!isComplete) {
      reqRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isComplete, completeLevel]); // Removed metrics from dependencies

  useEffect(() => {
    if (!isComplete) {
      reqRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameLoop, isComplete]);

  return (
    <>
      <div className={`absolute inset-0 pointer-events-none transition-transform ${isHit ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* Hit Overlay */}
        <div className={`absolute inset-0 bg-rose-500/30 transition-opacity duration-200 ${isHit ? 'opacity-100' : 'opacity-0'}`} />

        {/* Falling Objects */}
        {objects.map(obj => (
          <div 
            key={obj.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(1 - obj.x) * 100}%`, // Mirror X
              top: `${obj.y * 100}%`
            }}
          >
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-400 border-4 border-slate-900 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <FiBriefcase className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        ))}
      </div>

      {/* HUD */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white border-4 border-slate-900 px-8 py-4 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="text-center">
          <p className="text-slate-900 text-xs tracking-widest uppercase font-black mb-1">Dodged</p>
          <p className="text-3xl font-black text-slate-900">{dodged} <span className="text-lg text-slate-500">/ {TARGET_DODGES}</span></p>
        </div>
        {isHit && <FiAlertTriangle className="w-10 h-10 text-rose-500 animate-pulse absolute -right-16" />}
      </div>

      {isComplete && <LevelCompleteOverlay levelNum={5} nextLevelUnlocked={true} />}

      {/* Adding custom shake animation via inline style block */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) rotate(-1deg); }
          50% { transform: translateX(10px) rotate(1deg); }
          75% { transform: translateX(-10px) rotate(-1deg); }
        }
      `}</style>
    </>
  );
};

export const Level5Dodge = () => {
  return (
    <LevelWrapper 
      levelNum={5} 
      title="Suitcase Dodge" 
      instruction="Move your head left and right to dodge the falling suitcases. Dodge 10 suitcases!"
    >
      <LevelContentWrapper />
    </LevelWrapper>
  );
};

const LevelContentWrapper = (props) => <Level5Content {...props} />;
