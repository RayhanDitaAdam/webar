import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGameState } from '../game/GameStateContext';
import { LevelWrapper } from '../components/LevelWrapper';
import { LevelCompleteOverlay } from '../components/LevelCompleteOverlay';
import { playSuccessSound, playFailSound } from '../utils/audio';
import { IoFootball } from 'react-icons/io5';
import { GiWineGlass } from 'react-icons/gi';

const REQUIRED_MS = 15000;
const BALL_ACCEL = 0.15;
const BALL_FRICTION = 0.92;
const DRIFT_FORCE = 0.08;
const FAIL_POS = 0.88;
const DRIFT_CHANGE_MS = 600;

const Level6Content = ({ metrics, levelStarted, setIsLevelComplete }) => {
  const { completeLevel } = useGameState();
  const [progress, setProgress] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [ballPos, setBallPos] = useState(0);
  const [breakSide, setBreakSide] = useState(null);

  const ballRef = useRef(0);
  const driftRef = useRef(1);
  const driftTimerRef = useRef(0);
  const holdStartRef = useRef(null);
  const reqRef = useRef(null);
  const doneRef = useRef(false);
  const breakTimerRef = useRef(null);
  const completeRef = useRef(completeLevel);
  completeRef.current = completeLevel;

  const driftDurationRef = useRef(1000);

  const metricsRef = useRef(metrics);
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  const gameLoop = useCallback(() => {
    if (doneRef.current) return;

    const now = Date.now();

    // 1. Sistem memberikan dorongan random
    if (now - driftTimerRef.current > driftDurationRef.current) {
      driftTimerRef.current = now;
      
      // Peluang 25% sistem mode "Agresif" (kenceng banget ngincar gelas)
      const isAggressive = Math.random() < 0.25;

      if (isAggressive) {
        driftDurationRef.current = 800 + Math.random() * 1000; // Berlangsung 0.8s - 1.8s
        const targetDir = ballRef.current >= 0 ? 1 : -1; // Incar gelas terdekat
        driftRef.current = targetDir * (0.15 + Math.random() * 0.10); // Dorongan agresif diturunin biar imbang (0.15 - 0.25)
      } else {
        driftDurationRef.current = 500 + Math.random() * 2000;
        // Kekuatan dorongan normal/nyantai (-0.15 sampai +0.15)
        driftRef.current = (Math.random() - 0.5) * 0.15; 
      }
    }

    let ball = ballRef.current;

    // -- MEKANIK GOCEKAN --
    // Jika bola hampir jatuh (melewati 0.6) dan sistem sedang mendorongnya jatuh,
    // ada kemungkinan 3% tiap frame sistem tiba-tiba berubah pikiran dan menarik bola ke arah sebaliknya (gocekan).
    if ((ball > 0.6 && driftRef.current > 0) || (ball < -0.6 && driftRef.current < 0)) {
      if (Math.random() < 0.03) {
        driftRef.current = -driftRef.current * 1.5; // Gocekan tiba-tiba narik kenceng ke arah sebaliknya
        driftTimerRef.current = now;
        driftDurationRef.current = 800; // Gocekan berlangsung bentar aja
      }
    }
    
    // Tambahkan dorongan sistem
    ball += driftRef.current;

    // 2. Pemain melawan dengan kepala
    const nose = metricsRef.current?.visualNose;
    if (nose) {
      const headOffset = nose.x - 0.5;
      
      // Kekuatan pemain dikurangi dari 0.8 ke 0.4
      const playerForce = headOffset * 0.4; 
      
      ball += playerForce;
    }

    // Gesekan agar pergerakan tidak terlalu loncat-loncat
    ball *= BALL_FRICTION;
    ball = Math.max(-1, Math.min(1, ball));
    ballRef.current = ball;
    setBallPos(ball);

    if (ball > FAIL_POS || ball < -FAIL_POS) {
      const side = ball > 0 ? 'right' : 'left';
      if (holdStartRef.current) {
        playFailSound();
        holdStartRef.current = null;
        setProgress(0);
        setElapsedSec(0);
        setBreakSide(side);
        if (breakTimerRef.current) clearTimeout(breakTimerRef.current);
        breakTimerRef.current = setTimeout(() => {
          setBreakSide(null);
          ballRef.current = 0; // Reset ball ke tengah setelah gagal
        }, 600);
      }
    } else {
      if (!holdStartRef.current) holdStartRef.current = now;
      const elapsed = now - holdStartRef.current;
      const pct = Math.min((elapsed / REQUIRED_MS) * 100, 100);
      setProgress(pct);
      setElapsedSec(Math.floor(elapsed / 1000));
      if (pct >= 100) {
        playSuccessSound();
        doneRef.current = true;
        setIsComplete(true);
        if (setIsLevelComplete) setIsLevelComplete(true);
        completeRef.current(6);
        return;
      }
    }

    reqRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const startLoop = useCallback(() => {
    ballRef.current = 0;
    driftRef.current = (Math.random() - 0.5) * 0.15;
    driftTimerRef.current = 0;
    holdStartRef.current = null;
    doneRef.current = false;
    setProgress(0);
    setElapsedSec(0);
    setBallPos(0);
    setBreakSide(null);
    reqRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    if (levelStarted) startLoop();
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      if (breakTimerRef.current) clearTimeout(breakTimerRef.current);
    };
  }, [levelStarted, startLoop]);

  const ball = ballPos;

  const leftGlassX = 50 - 35;
  const rightGlassX = 50 + 35;
  const stickY = 38;
  const ballX = 50 + ball * 35;
  const ballY = stickY - 3;

  return (
    <>
      {!isComplete && metrics && (
        <div
          className="absolute inset-0 pointer-events-none"
        >
          <>
            {/* Stick */}
            <div
              className="absolute z-10 bg-slate-600 rounded-full"
              style={{
                left: `${leftGlassX}%`,
                top: `${stickY}%`,
                width: '70%',
                height: '5px',
              }}
            />

            {/* Gelas kiri */}
            <div
              className="absolute z-20 transition-all duration-200"
              style={{
                left: `${leftGlassX}%`,
                top: `${stickY - 5}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <GiWineGlass className={`w-10 h-10 sm:w-12 sm:h-12 transition-all ${
                breakSide === 'left'
                  ? 'text-rose-500 scale-150 animate-spin'
                  : ball < -FAIL_POS + 0.15
                    ? 'text-rose-400 scale-110'
                    : 'text-slate-500'
              }`} />
            </div>

            {/* Gelas kanan */}
            <div
              className="absolute z-20 transition-all duration-200"
              style={{
                left: `${rightGlassX}%`,
                top: `${stickY - 5}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <GiWineGlass className={`w-10 h-10 sm:w-12 sm:h-12 transition-all ${
                breakSide === 'right'
                  ? 'text-rose-500 scale-150 animate-spin'
                  : ball > FAIL_POS - 0.15
                    ? 'text-rose-400 scale-110'
                    : 'text-slate-500'
              }`} />
            </div>

            {/* Bola */}
            <div
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${ballX}%`,
                top: `${ballY}%`,
              }}
            >
              <div className={`p-2 sm:p-3 rounded-full border-4 transition-all duration-75 ${
                breakSide
                  ? 'bg-white border-rose-500 text-rose-500'
                  : 'bg-white border-emerald-500 text-emerald-500'
              }`}>
                <IoFootball className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            </div>

            {/* Progress */}
            <div className="absolute left-1/2 -translate-x-1/2 z-50" style={{ bottom: '8%' }}>
              <div className="bg-white border-2 border-slate-900 px-5 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-3">
                <GiWineGlass className="w-4 h-4 text-slate-400" />
                <div className="w-20 h-2.5 bg-slate-200 rounded-full border border-slate-300 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-black text-slate-900 tabular-nums w-6 text-right">
                  {elapsedSec}s
                </span>
              </div>
            </div>
          </>
        </div>
      )}

      {isComplete && <LevelCompleteOverlay levelNum={6} />}
    </>
  );
};

export const Level6Zen = () => (
  <LevelWrapper
    levelNum={6}
    title="Stick Balance"
    instruction="Tap sides to counter the ball! Don't let it hit the glasses!"
  >
    <Level6Content />
  </LevelWrapper>
);
