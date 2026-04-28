import React, { useEffect, useState } from 'react';
import { FiArrowUp, FiArrowLeft, FiArrowRight, FiRotateCcw, FiRotateCw, FiMove, FiShield } from 'react-icons/fi';

export const LevelGuide = ({ levelNum }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Hide after 5 seconds
    return () => clearTimeout(timer);
  }, [levelNum]);

  if (!isVisible) return null;

  const renderAnimation = () => {
    switch (levelNum) {
      case 1:
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-bounce">
              <FiArrowUp className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-xs font-black uppercase text-slate-900 bg-white px-2 py-1 border-2 border-slate-900 rounded-lg">Look Up!</p>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[wiggle_1s_ease-in-out_infinite]">
              <div className="flex text-blue-500">
                <FiArrowLeft className="w-6 h-6" />
                <FiArrowRight className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-black uppercase text-slate-900 bg-white px-2 py-1 border-2 border-slate-900 rounded-lg">Look Left & Right</p>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[tilt_1.5s_ease-in-out_infinite]">
              <FiRotateCcw className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs font-black uppercase text-slate-900 bg-white px-2 py-1 border-2 border-slate-900 rounded-lg">Tilt Head</p>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[spin_3s_linear_infinite]">
              <FiRotateCw className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs font-black uppercase text-slate-900 bg-white px-2 py-1 border-2 border-slate-900 rounded-lg">Follow Circle</p>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[dodge_1s_ease-in-out_infinite]">
              <div className="flex text-rose-500">
                <FiArrowLeft className="w-6 h-6" />
                <FiArrowRight className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-black uppercase text-slate-900 bg-white px-2 py-1 border-2 border-slate-900 rounded-lg">Dodge!</p>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-pulse">
              <FiShield className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-xs font-black uppercase text-slate-900 bg-white px-2 py-1 border-2 border-slate-900 rounded-lg">Stay Still</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-1/2 right-6 -translate-y-1/2 z-[40] pointer-events-none animate-in slide-in-from-right-10 duration-500">
      {renderAnimation()}
      
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes dodge {
          0%, 100% { transform: translateX(-30px); }
          50% { transform: translateX(30px); }
        }
      `}</style>
    </div>
  );
};
