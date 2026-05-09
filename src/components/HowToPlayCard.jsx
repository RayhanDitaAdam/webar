import React, { useState, useEffect } from 'react';
import { 
  FiArrowUp, FiArrowLeft, FiArrowRight, FiRotateCcw, FiRotateCw, 
  FiPlay, FiTarget, FiClock, FiZap, FiShield, FiStar, FiBriefcase
} from 'react-icons/fi';

const levelData = {
  1: {
    title: "The Sky Gazer",
    subtitle: "LEVEL 1",
    color: "emerald",
    bgGradient: "from-emerald-400 to-teal-500",
    borderColor: "border-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: <FiArrowUp className="w-10 h-10" />,
    instruction: "Look up to catch the floating suitcase, then look down to place it safely.",
    tips: [
      { icon: <FiTarget className="w-4 h-4" />, text: "Look UP and hold for 3s" },
      { icon: <FiClock className="w-4 h-4" />, text: "Look DOWN and hold for 3s" },
      { icon: <FiZap className="w-4 h-4" />, text: "Listen for the 'ding' sounds!" },
    ],
    animation: (
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping" />
        <div className="relative w-16 h-16 bg-white border-4 border-slate-900 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-bounce">
          <FiBriefcase className="w-8 h-8 text-emerald-500" />
        </div>
      </div>
    ),
  },
  2: {
    title: "Left-Right Looker",
    subtitle: "LEVEL 2",
    color: "blue",
    bgGradient: "from-blue-400 to-indigo-500",
    borderColor: "border-blue-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: <div className="flex"><FiArrowLeft className="w-8 h-8" /><FiArrowRight className="w-8 h-8" /></div>,
    instruction: "Turn your head left and right alternately.",
    tips: [
      { icon: <FiTarget className="w-4 h-4" />, text: "Look fully left, then right" },
      { icon: <FiClock className="w-4 h-4" />, text: "Repeat 3 times (6 turns)" },
      { icon: <FiZap className="w-4 h-4" />, text: "Move slowly & controlled" },
    ],
    animation: (
      <div className="relative w-20 h-20 mx-auto">
        <div className="relative w-20 h-20 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[htp-wiggle_1.5s_ease-in-out_infinite]">
          <div className="flex text-blue-500">
            <FiArrowLeft className="w-7 h-7" />
            <FiArrowRight className="w-7 h-7" />
          </div>
        </div>
      </div>
    ),
  },
  3: {
    title: "Ear-to-Shoulder",
    subtitle: "LEVEL 3",
    color: "purple",
    bgGradient: "from-purple-400 to-violet-500",
    borderColor: "border-purple-500",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: <FiRotateCcw className="w-10 h-10" />,
    instruction: "Tilt your head towards your left and right shoulders.",
    tips: [
      { icon: <FiTarget className="w-4 h-4" />, text: "Bring ear close to shoulder" },
      { icon: <FiClock className="w-4 h-4" />, text: "Alternate sides smoothly" },
      { icon: <FiZap className="w-4 h-4" />, text: "Don't raise your shoulder!" },
    ],
    animation: (
      <div className="relative w-20 h-20 mx-auto">
        <div className="relative w-20 h-20 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[htp-tilt_2s_ease-in-out_infinite]">
          <FiRotateCcw className="w-10 h-10 text-purple-500" />
        </div>
      </div>
    ),
  },
  4: {
    title: "Circular Voyage",
    subtitle: "LEVEL 4",
    color: "amber",
    bgGradient: "from-amber-400 to-orange-500",
    borderColor: "border-amber-500",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: <FiRotateCw className="w-10 h-10" />,
    instruction: "Rotate your head in a circular motion following the path.",
    tips: [
      { icon: <FiTarget className="w-4 h-4" />, text: "Follow the circular guide" },
      { icon: <FiClock className="w-4 h-4" />, text: "Slow, steady circles" },
      { icon: <FiZap className="w-4 h-4" />, text: "Both directions count!" },
    ],
    animation: (
      <div className="relative w-20 h-20 mx-auto">
        <div className="relative w-20 h-20 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[spin_3s_linear_infinite]">
          <FiRotateCw className="w-10 h-10 text-amber-500" />
        </div>
      </div>
    ),
  },
  5: {
    title: "Suitcase Dodge",
    subtitle: "LEVEL 5",
    color: "rose",
    bgGradient: "from-rose-400 to-pink-500",
    borderColor: "border-rose-500",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    icon: <div className="flex"><FiArrowLeft className="w-8 h-8" /><FiArrowRight className="w-8 h-8" /></div>,
    instruction: "Dodge the falling suitcases by moving your head left or right!",
    tips: [
      { icon: <FiTarget className="w-4 h-4" />, text: "Watch the falling objects" },
      { icon: <FiClock className="w-4 h-4" />, text: "React quickly!" },
      { icon: <FiZap className="w-4 h-4" />, text: "Dodge 10 suitcases to win" },
    ],
    animation: (
      <div className="relative w-20 h-20 mx-auto">
        <div className="relative w-20 h-20 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[htp-dodge_1s_ease-in-out_infinite]">
          <div className="flex text-rose-500">
            <FiArrowLeft className="w-7 h-7" />
            <FiArrowRight className="w-7 h-7" />
          </div>
        </div>
      </div>
    ),
  },
  6: {
    title: "Stick Balance",
    subtitle: "LEVEL 6",
    color: "emerald",
    bgGradient: "from-emerald-400 to-cyan-500",
    borderColor: "border-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: <div className="flex"><FiArrowLeft className="w-8 h-8" /><FiArrowRight className="w-8 h-8" /></div>,
    instruction: "Tap the left or right side of the screen to balance the rolling ball!",
    tips: [
      { icon: <FiTarget className="w-4 h-4" />, text: "Tap left/right to counter" },
      { icon: <FiShield className="w-4 h-4" />, text: "Don't hit the glasses" },
      { icon: <FiClock className="w-4 h-4" />, text: "Survive for 15 seconds!" },
    ],
    animation: (
      <div className="relative w-20 h-20 mx-auto">
        <div className="relative w-20 h-20 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-[htp-wiggle_1s_ease-in-out_infinite]">
          <div className="flex text-emerald-500">
            <FiArrowLeft className="w-7 h-7" />
            <FiArrowRight className="w-7 h-7" />
          </div>
        </div>
      </div>
    ),
  },
};

export const HowToPlayCard = ({ levelNum, onStart }) => {
  const [show, setShow] = useState(false);
  const data = levelData[levelNum];

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (!data) return null;

  const handleStart = () => {
    setShow(false);
    setTimeout(onStart, 400); // Wait for exit animation
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-400 ${show ? 'bg-slate-900/70 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
      <div 
        className={`relative max-w-sm w-[90%] transition-all duration-500 ease-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        style={{ 
          animationName: show ? 'htpBounceIn' : 'none',
          animationDuration: '0.6s',
          animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          animationFillMode: 'both',
        }}
      >
        {/* Card */}
        <div className="bg-[#f8f9fa] border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
          
          {/* Header Gradient Band */}
          <div className={`bg-gradient-to-r ${data.bgGradient} px-6 py-5 border-b-4 border-slate-900`}>
            <p className="text-white/80 text-[10px] font-black tracking-[0.3em] uppercase mb-1">{data.subtitle}</p>
            <h2 className="text-white text-2xl font-black tracking-tight">{data.title}</h2>
          </div>

          {/* Body */}
          <div className="p-6 pt-5">
            
            {/* Animated Icon */}
            <div className="mb-5">
              {data.animation}
            </div>

            {/* Instruction */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 mb-5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <p className="text-slate-800 text-sm font-bold text-center leading-relaxed">{data.instruction}</p>
            </div>

            {/* Tips */}
            <div className="space-y-2.5 mb-6">
              {data.tips.map((tip, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 bg-white/80 border-2 border-slate-200 rounded-xl px-4 py-2.5"
                  style={{ 
                    animationName: show ? 'htpSlideUp' : 'none',
                    animationDuration: '0.4s',
                    animationDelay: `${0.3 + i * 0.1}s`,
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'both',
                  }}
                >
                  <div className={`${data.iconBg} ${data.iconColor} p-1.5 rounded-lg border border-slate-200`}>
                    {tip.icon}
                  </div>
                  <span className="text-slate-700 text-xs font-semibold">{tip.text}</span>
                </div>
              ))}
            </div>

            {/* Start Button */}
            <button 
              onClick={handleStart}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r ${data.bgGradient} border-4 border-slate-900 text-white font-black text-lg tracking-wider uppercase transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-3`}
            >
              <FiPlay className="w-5 h-5 fill-white" /> Let's Go!
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes htpBounceIn {
          0% { 
            opacity: 0; 
            transform: scale(0.3) translateY(40px); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.08) translateY(-10px); 
          }
          70% { 
            transform: scale(0.95) translateY(5px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        @keyframes htpSlideUp {
          0% { 
            opacity: 0; 
            transform: translateY(15px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes htp-wiggle {
          0%, 100% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
        }
        @keyframes htp-tilt {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes htp-dodge {
          0%, 100% { transform: translateX(-20px); }
          50% { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
};
