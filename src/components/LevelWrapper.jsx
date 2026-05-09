import React, { useState, useEffect } from 'react';
import { useGameState } from '../game/GameStateContext';
import { useTracking } from '../game/TrackingContext';
import { FiHome, FiInfo, FiImage } from 'react-icons/fi';
import { ShutterButton } from './ShutterButton';
import { GalleryModal } from './GalleryModal';
import { LevelGuide } from './LevelGuide';
import { HowToPlayCard } from './HowToPlayCard';

export const LevelWrapper = ({ levelNum, title, instruction, children }) => {
  const { goToMenu, album } = useGameState();
  const { status, isReady, metrics } = useTracking(); 
  const [showGallery, setShowGallery] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [levelStarted, setLevelStarted] = useState(false);
  const [bounceIn, setBounceIn] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);

  const latestCapture = album.length > 0 ? album[album.length - 1] : null;

  const handleStartLevel = () => {
    setShowHowToPlay(false);
    // Trigger bounce-in animation for the level content
    setTimeout(() => {
      setLevelStarted(true);
      setBounceIn(true);
    }, 100);
  };

  useEffect(() => {
    if (isLevelComplete) {
      setShowGallery(false);
    }
  }, [isLevelComplete]);

  return (
    <div className="absolute inset-0 text-slate-900 font-sans overflow-hidden bg-transparent">

      {/* How To Play Card (shown before level starts) */}
      {showHowToPlay && (
        <HowToPlayCard levelNum={levelNum} onStart={handleStartLevel} />
      )}

      {/* Level Specific Content (passed as children, receives tracking data) */}
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ${
          levelStarted ? 'opacity-100' : 'opacity-0'
        }`}
        style={bounceIn ? {
          animationName: 'levelBounceIn',
          animationDuration: '0.8s',
          animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          animationFillMode: 'both',
        } : {}}
      >
        {isReady && React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { metrics, levelStarted, setIsLevelComplete });
          }
          return child;
        })}

      </div>

      {/* Floating Instruction (Follows Head) */}
      {isReady && metrics?.visualHeadTop && levelStarted && !isLevelComplete && (
        <div 
          className="absolute pointer-events-none transition-all duration-150 ease-out z-50 flex flex-col items-center"
          style={{
            left: `${metrics.visualHeadTop.x * 100}%`,
            top: `${metrics.visualHeadTop.y * 100}%`,
            transform: `translate(-50%, -130%)`,
          }}
        >
          <div className="bg-white/95 backdrop-blur-sm border-2 border-slate-900 px-3 py-1 rounded-lg shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] max-w-[140px] sm:max-w-[180px]">
            <p className="text-[9px] sm:text-[11px] text-slate-900 font-black leading-tight text-center uppercase tracking-tighter">
              {instruction}
            </p>
          </div>
          {/* Arrow pointing to head */}
          <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-slate-900 rotate-45 -mt-2 z-[-1] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" />
        </div>
      )}


      {/* HUD Layer - fully hidden when level is complete */}
      {!isLevelComplete && (
      <div 
        className={`absolute inset-0 pointer-events-none flex flex-col p-4 sm:p-6 z-10 transition-all duration-700 ${
          levelStarted ? 'opacity-100' : 'opacity-0'
        }`}
        style={bounceIn ? {
          animationName: 'hudSlideDown',
          animationDuration: '0.6s',
          animationDelay: '0.2s',
          animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          animationFillMode: 'both',
        } : {}}
      >
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          {/* Back Button & Level Info */}
          <div className="flex gap-2 sm:gap-4 items-center">
            <button 
              onClick={goToMenu}
              className="p-2 sm:p-3 bg-white hover:bg-slate-100 border-2 border-slate-900 rounded-full transition-transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
            >
              <FiHome className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
            </button>
            <div 
              className="bg-white border-2 border-slate-900 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
              style={bounceIn ? {
                animationName: 'levelBadgeBounce',
                animationDuration: '0.7s',
                animationDelay: '0.5s',
                animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                animationFillMode: 'both',
              } : {}}
            >
              <p className="text-emerald-600 text-[8px] sm:text-xs tracking-widest uppercase font-black opacity-80 mb-0">Level {levelNum}</p>
              <h2 className="text-sm sm:text-xl font-black leading-none text-slate-900">{title}</h2>
            </div>

            {/* Gallery Thumbnail */}
            <button 
              onClick={() => setShowGallery(true)}
              className="relative w-10 h-10 sm:w-14 sm:h-14 bg-white border-2 border-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-1 active:translate-y-0"
            >
              {latestCapture ? (
                latestCapture.type === 'photo' ? (
                  <img src={latestCapture.url} alt="Gallery" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <FiImage className="text-white" />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <FiImage className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
              {album.length > 0 && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[7px] font-black px-1 rounded-bl-lg border-b border-l border-slate-900">
                  {album.length}
                </div>
              )}
            </button>
          </div>

          {/* AI Status */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-slate-900 ${isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'} `} />
            <span className="text-[9px] sm:text-sm tracking-wider uppercase font-black text-slate-900">{status}</span>
          </div>
        </div>

        {/* Instructions Removed from here to move above face */}


        {/* Shutter Button (Bottom Center) */}
        <div className="mt-auto mb-4 flex justify-center w-full">
          <ShutterButton />
        </div>

        {/* Level Animation Guide */}
        <LevelGuide levelNum={levelNum} />
      </div>
      )}

      {showGallery && <GalleryModal onClose={() => setShowGallery(false)} />}

      <style>{`
        @keyframes levelBounceIn {
          0% { 
            opacity: 0; 
            transform: scale(0.5) translateY(30px); 
          }
          60% { 
            opacity: 1; 
            transform: scale(1.05) translateY(-5px); 
          }
          80% { 
            transform: scale(0.97) translateY(2px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        @keyframes hudSlideDown {
          0% { 
            opacity: 0; 
            transform: translateY(-30px); 
          }
          60% { 
            opacity: 1; 
            transform: translateY(5px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes levelBadgeBounce {
          0% { 
            opacity: 0; 
            transform: scale(0.3); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.15); 
          }
          75% { 
            transform: scale(0.92); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        @keyframes instructionSlideIn {
          0% { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
      `}</style>
    </div>
  );
};
