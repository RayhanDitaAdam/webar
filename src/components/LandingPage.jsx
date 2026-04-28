import React, { useState } from 'react';
import { useGameState } from '../game/GameStateContext';
import { DataCollectionModal } from './DataCollectionModal';
import { 
  FiPlay, 
  FiBriefcase, 
  FiRefreshCw, 
  FiCrosshair,
  FiActivity,
  FiSmile,
  FiLoader
} from 'react-icons/fi';

const levelsInfo = [
  { id: 1, title: "The Sky Gazer", desc: "Look up to catch the falling suitcase.", icon: <FiBriefcase className="w-6 h-6" /> },
  { id: 2, title: "Left-Right Looker", desc: "Turn your head left and right repeatedly.", icon: <FiRefreshCw className="w-6 h-6" /> },
  { id: 3, title: "Ear-to-Shoulder", desc: "Tilt your head to your left and right shoulders.", icon: <FiSmile className="w-6 h-6" /> },
  { id: 4, title: "Circular Voyage", desc: "Follow the circular path with your nose.", icon: <FiLoader className="w-6 h-6" /> },
  { id: 5, title: "Suitcase Dodge", desc: "Dodge the falling suitcases from above.", icon: <FiActivity className="w-6 h-6" /> },
  { id: 6, title: "The Ultimate Zen", desc: "Balance the suitcases on top of your head.", icon: <FiCrosshair className="w-6 h-6" /> },
];

export const LandingPage = () => {
  const { startLevel, unlockedLevels, resetProgress, userData, saveUserData } = useGameState();
  const [showModal, setShowModal] = useState(false);

  const handlePlayNow = () => {
    if (!userData) {
      setShowModal(true);
    } else {
      startLevel(1);
    }
  };

  return (
    <div className="h-full bg-[#f8f9fa] text-slate-900 p-6 py-12 flex flex-col items-center overflow-y-auto relative z-10 font-sans">
      
      {/* Top Right Actions */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all progress?")) {
              resetProgress();
            }
          }}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-900 rounded-full text-xs font-bold tracking-wider uppercase transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Reset Data
        </button>
      </div>
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full border-4 border-emerald-400 opacity-20" />
        <div className="absolute bottom-[20%] right-[10%] w-24 h-24 rounded-lg border-4 border-amber-400 rotate-12 opacity-20" />
        <div className="absolute top-[40%] right-[20%] w-16 h-16 rounded-full bg-rose-400 opacity-10" />
      </div>

      <div className="max-w-4xl w-full z-10 flex flex-col items-center mt-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 text-slate-900 text-sm font-bold tracking-widest uppercase mb-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            Web AR Experience
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-slate-900 drop-shadow-md">
            Be Relax <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600">AR</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed">
            Train your neck flexibility with an interactive Augmented Reality experience. Complete 6 challenges for a better posture.
          </p>
        </div>

        {/* Start Button */}
        <button 
          onClick={handlePlayNow}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-slate-900 transition-all duration-300 ease-in-out bg-emerald-400 border-4 border-slate-900 rounded-full hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:translate-x-0 active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)] focus:outline-none mb-16 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
        >
          <FiPlay className="w-6 h-6 mr-3 fill-slate-900" />
          <span className="text-xl tracking-widest uppercase">Play Now</span>
        </button>

        {/* Levels Grid */}
        <div className="w-full">
          <h2 className="text-2xl font-black mb-8 text-center tracking-tight text-slate-900">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-12">
            {levelsInfo.map((level) => {
              const isUnlocked = unlockedLevels.includes(level.id);
              return (
                <div 
                  key={level.id} 
                  className={`relative p-6 rounded-3xl border-4 transition-all duration-300 ${
                    isUnlocked 
                      ? 'bg-white border-slate-900 hover:-translate-y-2 hover:-translate-x-1 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] cursor-pointer' 
                      : 'bg-slate-200 border-slate-300 opacity-60 grayscale cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl border-2 ${isUnlocked ? 'bg-emerald-100 border-slate-900 text-emerald-600 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' : 'bg-slate-300 border-slate-400 text-slate-500'}`}>
                      {level.icon}
                    </div>
                    <span className={`font-mono text-sm font-bold border-2 px-3 py-1 rounded-full ${isUnlocked ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-300 text-slate-500 border-slate-400'}`}>LVL {level.id}</span>
                  </div>
                  <h3 className={`text-xl font-black mb-2 ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                    {level.title}
                  </h3>
                  <p className={`text-sm leading-relaxed font-medium ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                    {level.desc}
                  </p>
                  
                  {isUnlocked && (
                    <button 
                      onClick={() => {
                        if (!userData && level.id === 1) {
                          handlePlayNow();
                        } else {
                          startLevel(level.id);
                        }
                      }}
                      className="mt-6 w-full py-2.5 rounded-xl bg-emerald-400 border-2 border-slate-900 text-sm font-black transition-transform hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:translate-x-0 active:shadow-none flex items-center justify-center gap-2 text-slate-900"
                    >
                      <FiPlay className="w-4 h-4 fill-slate-900" /> Play Level
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <DataCollectionModal 
          onSubmit={(data) => {
            saveUserData(data);
            setShowModal(false);
            startLevel(1);
          }}
          onSkip={() => {
            setShowModal(false);
            startLevel(1);
          }}
        />
      )}
    </div>
  );
};
