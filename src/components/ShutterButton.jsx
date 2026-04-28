import React, { useState, useRef, useEffect } from 'react';
import { useTracking } from '../game/TrackingContext';
import { useGameState } from '../game/GameStateContext';
import { FiCamera, FiVideo, FiSquare } from 'react-icons/fi';

export const ShutterButton = () => {
  const { videoRef, canvasRef } = useTracking();
  const { addToAlbum } = useGameState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const timerRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  // Capture Photo Logic
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const overlayCanvas = canvasRef.current;
    
    // Create a temporary composite canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');

    // 1. Draw mirrored video
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

    // 2. Draw overlay canvas
    // The overlay canvas might be a different size than video (CSS object-cover)
    // For simplicity, we assume they align.
    ctx.drawImage(overlayCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
    addToAlbum({ type: 'photo', url: dataUrl });
    
    // Visual feedback
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-white z-[100] pointer-events-none animate-out fade-out duration-300';
    document.body.appendChild(flash);
    setTimeout(() => document.body.removeChild(flash), 300);
  };

  // Recording Logic
  const startRecording = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const overlayCanvas = canvasRef.current;
    
    // We need a composite stream.
    // Let's create a hidden canvas that merges both every frame.
    const recordCanvas = document.createElement('canvas');
    recordCanvas.width = 720; // Standard resolution for recording
    recordCanvas.height = (video.videoHeight / video.videoWidth) * 720;
    const ctx = recordCanvas.getContext('2d');

    const drawFrame = () => {
      if (!isRecording && !mediaRecorderRef.current) return;
      
      // Clear
      ctx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);
      
      // Draw Video (Mirrored)
      ctx.save();
      ctx.translate(recordCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, recordCanvas.width, recordCanvas.height);
      ctx.restore();
      
      // Draw Overlay
      ctx.drawImage(overlayCanvas, 0, 0, recordCanvas.width, recordCanvas.height);
      
      requestAnimationFrame(drawFrame);
    };

    const stream = recordCanvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordingChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordingChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      addToAlbum({ type: 'video', url });
      recordingChunksRef.current = [];
      setRecordingTime(0);
    };

    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    recorder.start();
    requestAnimationFrame(drawFrame);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleMouseDown = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      startRecording();
    }, 500); // 500ms for long press
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimerRef.current);
    if (isRecording) {
      stopRecording();
    } else if (!isLongPressRef.current) {
      capturePhoto();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 pointer-events-auto">
      {isRecording && (
        <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
        </div>
      )}
      
      <button 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={`w-16 h-16 rounded-full border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center active:scale-95 active:shadow-none
          ${isRecording ? 'bg-rose-400 scale-110' : 'bg-white hover:bg-slate-50'}
        `}
      >
        {isRecording ? (
          <FiSquare className="w-6 h-6 text-slate-900 fill-slate-900" />
        ) : (
          <div className="flex flex-col items-center">
            <FiCamera className="w-7 h-7 text-slate-900" />
            <span className="text-[8px] font-black uppercase tracking-tighter -mt-1">Hold for Video</span>
          </div>
        )}
      </button>
    </div>
  );
};
