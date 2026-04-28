import React, { useState } from 'react';
import { themes } from '../themeConfig';

const ThemeDemo = () => {
  // Client cuma perlu ganti 'worldCup' jadi 'christmas' di sini
  const [activeTheme, setActiveTheme] = useState(themes.worldCup);

  const toggleTheme = () => {
    setActiveTheme(prev => prev.id === 'world-cup' ? themes.christmas : themes.worldCup);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 transition-all duration-700 min-h-[400px] rounded-3xl" 
         style={{ backgroundColor: activeTheme.primaryColor }}>
      
      {/* 1. Header yang otomatis berubah warnanya */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-lg uppercase tracking-tighter italic">
          {activeTheme.name}
        </h1>
        <div className="h-1 w-24 bg-white/30 mx-auto mt-2 rounded-full" />
      </header>

      {/* 2. AR Canvas yang otomatis ganti karakter 3D (Placeholder Demo) */}
      <div className="relative w-full max-w-sm aspect-square bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-white shadow-2xl">
        <div className="text-6xl mb-6 animate-bounce">
          {activeTheme.rewardIcon}
        </div>
        
        <div className="space-y-4 text-center">
          <p className="text-xs font-bold tracking-widest text-white/50 uppercase">Loading Model</p>
          <code className="block bg-white/5 p-3 rounded-xl text-xs font-mono border border-white/5">
            {activeTheme.characterModel}
          </code>
          <p className="text-xl font-medium leading-tight">
            "{activeTheme.instructionText}"
          </p>
        </div>

        {/* Dynamic Background Preview */}
        <div className="absolute inset-0 -z-10 opacity-20 transition-opacity duration-1000 overflow-hidden rounded-[2.5rem]">
           <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
        </div>
      </div>

      {/* 3. Reward yang icon-nya ganti otomatis */}
      <div className="mt-8 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-full border border-white/10 text-white shadow-lg">
        <span className="text-lg font-bold tracking-tight">Voucher Reward:</span>
        <span className="text-3xl filter drop-shadow-[0_0_8px_white]">{activeTheme.rewardIcon}</span>
      </div>

      {/* Control Panel (Buat lu pas demo ke client) */}
      <div className="mt-12 p-4 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/5">
        <button 
          onClick={toggleTheme}
          className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform active:scale-95"
        >
          Ganti Tema Simpel (One Click)
        </button>
      </div>
    </div>
  );
};

export default ThemeDemo;
