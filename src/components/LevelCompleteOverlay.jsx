import React, { useState } from 'react';
import { useGameState } from '../game/GameStateContext';
import { FiCheckCircle, FiArrowRight, FiHome, FiGift, FiCopy, FiCheck, FiShare2, FiX } from 'react-icons/fi';
import { DataCollectionModal } from './DataCollectionModal';

export const LevelCompleteOverlay = ({ levelNum, nextLevelUnlocked }) => {
  const { startLevel, goToMenu, userData, saveUserData, album } = useGameState();
  const [showVoucher, setShowVoucher] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMock, setShowShareMock] = useState(false);
  const [stripDownloading, setStripDownloading] = useState(false);

  const voucherCode = "BERELAX-GIFT-2026";
  const shareLink = "https://berelax.ar/album/" + (userData?.username?.toLowerCase().replace(/\s+/g, '-') || 'player');

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

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Album link copied to clipboard!");
  };

  const downloadPhotobooth = () => {
    const photos = album.filter(item => item.type === 'photo').slice(0, 4);
    if (photos.length === 0) return;

    setStripDownloading(true);
    
    // Create high-res canvas for photobooth strip
    const canvas = document.createElement('canvas');
    const padding = 40;
    const imgWidth = 600;
    const imgHeight = 450;
    const stripWidth = imgWidth + (padding * 2);
    const stripHeight = (imgHeight * photos.length) + (padding * (photos.length + 2)) + 100; // Extra space for header/footer

    canvas.width = stripWidth;
    canvas.height = stripHeight;
    const ctx = canvas.getContext('2d');

    // Draw background (white strip)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, stripWidth, stripHeight);
    
    // Draw header
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = 'black 40px Fredoka';
    ctx.textAlign = 'center';
    ctx.fillText("BE RELAX AR", stripWidth / 2, padding + 40);

    let currentY = padding + 100;

    const drawPhotos = async () => {
      for (const photo of photos) {
        const img = new Image();
        img.src = photo.url;
        await new Promise(resolve => {
          img.onload = () => {
            // Draw photo
            ctx.drawImage(img, padding, currentY, imgWidth, imgHeight);
            // Draw border
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 8;
            ctx.strokeRect(padding, currentY, imgWidth, imgHeight);
            
            currentY += imgHeight + padding;
            resolve();
          };
        });
      }

      // Footer
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = 'bold 24px Fredoka';
      ctx.fillText(userData?.username || 'Player', stripWidth / 2, currentY);

      // Download
      const link = document.createElement('a');
      link.download = `BeRelax-Photobooth-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStripDownloading(false);
    };

    drawPhotos();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-500 overflow-hidden">
      
      {/* Gift Animation Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
          <FiGift className="text-emerald-400/20 w-64 h-64 animate-[gift-bounce_2s_ease-out_infinite]" />
        </div>
      </div>

      <div className="bg-[#f8f9fa] border-4 border-slate-900 p-8 sm:p-12 rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] max-w-sm w-full text-center transform animate-in zoom-in-95 duration-500 delay-150 relative z-10">
        
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
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
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
          {nextLevelUnlocked && levelNum < 6 && (
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

          {levelNum === 6 && album.length > 0 && (
            <button 
              onClick={() => setShowShareMock(true)}
              className="w-full py-4 rounded-full bg-amber-400 border-4 border-slate-900 text-slate-900 font-black text-lg transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none flex items-center justify-center gap-2"
            >
              Share Album <FiShare2 />
            </button>
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

      {showShareMock && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/90 p-4 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
          <div className="bg-white border-4 border-slate-900 p-6 sm:p-10 rounded-[3rem] shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] max-w-md w-full relative my-8">
            <button onClick={() => setShowShareMock(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full border-2 border-slate-900 hover:bg-rose-100 transition-colors"><FiX /></button>
            
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black mb-2">Photobooth Strip 📸</h3>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Share your progress!</p>
            </div>

            {/* Photobooth Preview */}
            <div className="bg-slate-100 border-4 border-slate-900 p-4 rounded-[2rem] mb-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-h-[50vh] overflow-y-auto">
              <div className="bg-white p-4 flex flex-col gap-4">
                <div className="text-center font-black text-slate-900 border-b-2 border-slate-100 pb-2">BE RELAX AR</div>
                {album.filter(i => i.type === 'photo').slice(0, 4).map((item, idx) => (
                  <div key={idx} className="border-4 border-slate-900 rounded-lg overflow-hidden aspect-[4/3] bg-slate-200">
                    <img src={item.url} alt="Strip" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="text-center font-bold text-slate-400 text-xs py-2">{userData?.username || 'Player'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={copyShareLink}
                className="py-4 rounded-2xl bg-white border-4 border-slate-900 text-slate-900 font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
              >
                <FiShare2 /> Copy Link
              </button>
              <button 
                onClick={downloadPhotobooth}
                disabled={stripDownloading}
                className="py-4 rounded-2xl bg-emerald-400 border-4 border-slate-900 text-slate-900 font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none disabled:opacity-50"
              >
                {stripDownloading ? "..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gift-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};
