import React, { useState, useEffect } from 'react';
import { useGameState } from '../game/GameStateContext';
import { playLevelCompleteSound } from '../utils/audio';
import { FiCheckCircle, FiArrowRight, FiHome, FiGift, FiCopy, FiCheck, FiShare2, FiX } from 'react-icons/fi';
import { DataCollectionModal } from './DataCollectionModal';

export const LevelCompleteOverlay = ({ levelNum }) => {
  const { startLevel, goToMenu, userData, saveUserData, album } = useGameState();
  const [showVoucher, setShowVoucher] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const voucherCode = "BERELAX-GIFT-2026";
  const shareLink = "https://webar-alpha.vercel.app/";

  useEffect(() => {
    playLevelCompleteSound();
  }, []);

  const handleLevel6Complete = () => {
    if (userData) {
      setShowVoucher(true);
    } else {
      setShowDataModal(true);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(voucherCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = voucherCode;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
        alert("Failed to copy automatically. Voucher code: " + voucherCode);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white overflow-hidden pointer-events-auto">
      
      {/* Gift Animation Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
          <FiGift className="text-emerald-400/20 w-64 h-64 animate-[gift-bounce_2s_ease-out_infinite]" />
        </div>
      </div>

      <div className="bg-[#f8f9fa] border-4 border-slate-900 p-8 sm:p-12 rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] max-w-sm w-full text-center transform relative z-10">
        
        {/* Animated Icon */}
        <div className="w-24 h-24 bg-emerald-100 rounded-full border-4 border-slate-900 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-bounce">
          <FiCheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          {levelNum === 6 ? "Course Completed!" : "Level Cleared!"}
        </h2>
        <p className="text-slate-600 font-medium mb-8">
          Great job! Your neck muscles are feeling more relaxed.
        </p>

        {showVoucher ? (
          <div className="mb-8">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Reward Voucher</p>
            <div className="bg-white border-4 border-dashed border-slate-900 p-4 rounded-2xl flex items-center justify-between gap-4">
              <code className="text-lg font-black text-emerald-600">{voucherCode}</code>
              <button 
                onClick={copyToClipboard}
                className="p-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-lg transition-colors"
              >
                {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Copy and use this code at checkout!</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 pointer-events-auto">
          {levelNum < 6 && (
            <button 
              onClick={() => startLevel(levelNum + 1)}
              className="w-full py-4 rounded-full bg-emerald-400 border-4 border-slate-900 text-slate-900 font-black text-lg transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none flex items-center justify-center gap-2"
            >
              Next Level {levelNum + 1} <FiArrowRight />
            </button>
          )}
          
          {levelNum === 6 && !showVoucher && (
            <button 
              onClick={handleLevel6Complete}
              className="w-full py-4 rounded-full bg-emerald-400 border-4 border-slate-900 text-slate-900 font-black text-lg transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none flex items-center justify-center gap-2"
            >
              Claim Voucher <FiGift />
            </button>
          )}

          {levelNum === 6 && (
            <>
              <button 
                onClick={() => setShowQR(prev => !prev)}
                className="w-full py-4 rounded-full bg-amber-400 border-4 border-slate-900 text-slate-900 font-black text-lg transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none flex items-center justify-center gap-2"
              >
                <FiShare2 /> Share
              </button>

              {showQR && (
                <div 
                  className="flex flex-col items-center gap-3 bg-white border-4 border-dashed border-slate-900 p-5 rounded-3xl"
                  style={{
                    animationName: 'qrBounceIn',
                    animationDuration: '0.5s',
                    animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animationFillMode: 'both',
                  }}
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan to Play</p>
                  <div className="bg-white p-2 border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareLink)}`} 
                      alt="QR Code" 
                      className="w-36 h-36 rounded-lg" 
                    />
                  </div>
                  <code className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border-2 border-emerald-200">{shareLink}</code>
                </div>
              )}
            </>
          )}

          <button 
            onClick={goToMenu}
            className="w-full py-4 rounded-full bg-white border-4 border-slate-900 text-slate-900 font-black transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none flex items-center justify-center gap-2"
          >
            <FiHome /> Back to Menu
          </button>
        </div>
      </div>

      {showDataModal && (
        <DataCollectionModal 
          onSubmit={(data) => {
            saveUserData(data);
            setShowDataModal(false);
            setShowVoucher(true);
          }}
          onSkip={() => {
            setShowDataModal(false);
          }}
        />
      )}

      <style>{`
        @keyframes gift-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes qrBounceIn {
          0% { opacity: 0; transform: scale(0.3) translateY(-10px); }
          50% { opacity: 1; transform: scale(1.08) translateY(2px); }
          75% { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
