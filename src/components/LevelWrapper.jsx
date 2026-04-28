import React, { useState } from 'react';
import { useGameState } from '../game/GameStateContext';
import { useTracking } from '../game/TrackingContext';
import { FiHome, FiInfo, FiImage } from 'react-icons/fi';
import { ShutterButton } from './ShutterButton';
import { GalleryModal } from './GalleryModal';
import { LevelGuide } from './LevelGuide';

export const LevelWrapper = ({ levelNum, title, instruction, children }) => {
  const { goToMenu, album } = useGameState();
  const { status, isReady, metrics } = useTracking(); 
  const [showGallery, setShowGallery] = useState(false);

  const latestCapture = album.length > 0 ? album[album.length - 1] : null;
  return (
    <div className="absolute inset-0 text-slate-900 font-sans overflow-hidden bg-transparent">


      {/* Level Specific Content (passed as children, receives tracking data) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {isReady && React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { metrics });
          }
          return child;
        })}
      </div>

      {/* HUD Layer */}
      <div className="absolute inset-0 pointer-events-none flex flex-col p-4 sm:p-6 z-10">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          {/* Back Button & Level Info */}
          <div className="flex gap-4 items-center">
            <button 
              onClick={goToMenu}
              className="p-3 bg-white hover:bg-slate-100 border-2 border-slate-900 rounded-full transition-transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            >
              <FiHome className="w-6 h-6 text-slate-900" />
            </button>
            <div className="bg-white border-2 border-slate-900 px-5 py-2.5 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <p className="text-emerald-600 text-[10px] sm:text-xs tracking-widest uppercase font-black opacity-80 mb-0.5">Level {levelNum}</p>
              <h2 className="text-lg sm:text-xl font-black leading-none text-slate-900">{title}</h2>
            </div>

            {/* Gallery Thumbnail */}
            <button 
              onClick={() => setShowGallery(true)}
              className="relative w-14 h-14 bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-1 active:translate-y-0"
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
                  <FiImage className="w-6 h-6" />
                </div>
              )}
              {album.length > 0 && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-bl-lg border-b border-l border-slate-900">
                  {album.length}
                </div>
              )}
            </button>
          </div>

          {/* AI Status */}
          <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-full border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'} `} />
            <span className="text-xs sm:text-sm tracking-wider uppercase font-black text-slate-900">{status}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 max-w-sm pointer-events-auto">
          <div className="bg-white border-2 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-start gap-3">
            <FiInfo className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base text-slate-700 font-medium">{instruction}</p>
          </div>
        </div>

        {/* Shutter Button (Bottom Center) */}
        <div className="mt-auto mb-4 flex justify-center w-full">
          <ShutterButton />
        </div>

        {/* Level Animation Guide */}
        <LevelGuide levelNum={levelNum} />
      </div>

      {showGallery && <GalleryModal onClose={() => setShowGallery(false)} />}
    </div>
  );
};
