import React, { useState } from 'react';
import { FiX, FiPlay, FiShare2, FiTrash2, FiDownload } from 'react-icons/fi';
import { useGameState } from '../game/GameStateContext';

export const GalleryModal = ({ onClose }) => {
  const { album, clearAlbum, userData } = useGameState();
  const [selectedItem, setSelectedItem] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPhotobooth = () => {
    const photos = album.filter(item => item.type === 'photo').slice(0, 4);
    if (photos.length === 0) {
      alert("Take some photos first!");
      return;
    }

    setDownloading(true);
    
    const canvas = document.createElement('canvas');
    const padding = 40;
    const imgWidth = 600;
    const imgHeight = 450;
    const stripWidth = imgWidth + (padding * 2);
    const stripHeight = (imgHeight * photos.length) + (padding * (photos.length + 2)) + 100;

    canvas.width = stripWidth;
    canvas.height = stripHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, stripWidth, stripHeight);
    
    ctx.fillStyle = '#0f172a';
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
            ctx.drawImage(img, padding, currentY, imgWidth, imgHeight);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 8;
            ctx.strokeRect(padding, currentY, imgWidth, imgHeight);
            currentY += imgHeight + padding;
            resolve();
          };
        });
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px Fredoka';
      ctx.fillText(userData?.username || 'Player', stripWidth / 2, currentY);

      const link = document.createElement('a');
      link.download = `BeRelax-Gallery-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    };

    drawPhotos();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white border-4 border-slate-900 w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] flex flex-col overflow-hidden relative transform animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b-4 border-slate-900 flex justify-between items-center bg-emerald-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Your Album</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{album.length} Captures Saved</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if(window.confirm("Clear all items in album?")) clearAlbum();
              }}
              className="p-3 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border-2 border-slate-900 rounded-2xl transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-y-0.5"
              title="Clear Album"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 rounded-2xl transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-y-0.5"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {album.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300 border-dashed">
                <FiPlay className="w-8 h-8 opacity-30" />
              </div>
              <p className="font-bold">No captures yet. Go take some photos!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {album.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="aspect-square bg-white border-2 border-slate-900 rounded-2xl overflow-hidden cursor-pointer shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all relative group"
                >
                  {item.type === 'photo' ? (
                    <img src={item.url} alt="Capture" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <FiPlay className="w-10 h-10 text-white fill-white" />
                      <div className="absolute bottom-2 right-2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-slate-900">VIDEO</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share & Download Section */}
        {album.length > 0 && (
          <div className="p-6 border-t-4 border-slate-900 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="w-full py-4 rounded-2xl bg-amber-400 border-4 border-slate-900 text-slate-900 font-black flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all">
              <FiShare2 /> SHARE ALBUM
            </button>
            <button 
              onClick={downloadPhotobooth}
              disabled={downloading}
              className="w-full py-4 rounded-2xl bg-emerald-400 border-4 border-slate-900 text-slate-900 font-black flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50"
            >
              <FiDownload /> {downloading ? "GENERATING..." : "DOWNLOAD STRIP"}
            </button>
          </div>
        )}

        {/* Lightbox / Preview */}
        {selectedItem && (
          <div className="fixed inset-0 z-[70] bg-slate-950/95 flex flex-col p-4">
            <div className="flex justify-end p-4">
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-3 bg-white rounded-full border-2 border-slate-900"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {selectedItem.type === 'photo' ? (
                <img src={selectedItem.url} alt="Full Preview" className="max-w-full max-h-full object-contain rounded-xl border-4 border-white" />
              ) : (
                <video src={selectedItem.url} controls autoPlay className="max-w-full max-h-full rounded-xl border-4 border-white" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
