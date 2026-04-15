import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const StretchingDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [counts, setCounts] = useState({ left: 0, right: 0, total: 0 });
  const [status, setStatus] = useState("Loading AI...");
  const [currentPos, setCurrentPos] = useState('center');
  const [holdProgress, setHoldProgress] = useState(0);
  
  const lastPos = useRef('center');
  const holdStartRef = useRef(null);
  const REQUIRED_HOLD_MS = 5000; // 5 Detik (Latihan murni)

  useEffect(() => {
    let faceLandmarker;
    let animationId;
    let videoStream;
    let isMounted = true;

    const setupAI = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        if (isMounted) startVideo();
      } catch (err) {
        console.error("AI Setup Error:", err);
        setStatus("AI Load Failed");
      }
    };

    const startVideo = async () => {
      try {
        const constraints = {
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        };
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current && canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          };
          videoRef.current.onloadeddata = () => {
            if (isMounted) predict();
          };
        }
        setStatus("Ready!");
      } catch (err) {
        console.error("Camera Error:", err);
        setStatus("Camera Denied");
      }
    };

    const predict = async () => {
      if (!videoRef.current || !faceLandmarker || !isMounted) return;

      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // Titik Hidung (1), Telinga Kiri (234), Telinga Kanan (454)
        const nose = landmarks[1];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];

        const distToLeft = Math.abs(nose.x - leftEar.x);
        const distToRight = Math.abs(nose.x - rightEar.x);
        const ratio = distToLeft / distToRight;

        let detectedPos = 'center';
        if (ratio < 0.22) detectedPos = 'left';
        else if (ratio > 4.5) detectedPos = 'right';

        if (detectedPos !== 'center') {
          if (detectedPos !== lastPos.current) {
            if (!holdStartRef.current) {
              holdStartRef.current = Date.now();
            }

            const elapsed = Date.now() - holdStartRef.current;
            const progress = Math.min((elapsed / REQUIRED_HOLD_MS) * 100, 100);
            setHoldProgress(progress);

            if (elapsed > REQUIRED_HOLD_MS) {
              setCounts(prev => ({ 
                ...prev, 
                [detectedPos]: prev[detectedPos] + 1,
                total: prev.total + 1
              }));
              lastPos.current = detectedPos;
              holdStartRef.current = null;
              setHoldProgress(0);
              setCurrentPos(detectedPos);
            }
          }
        } else {
          holdStartRef.current = null;
          setHoldProgress(0);
          if (lastPos.current !== 'center') {
            lastPos.current = 'center';
            setCurrentPos('center');
          }
        }

        drawMesh(landmarks);
      }
      animationId = requestAnimationFrame(predict);
    };

    const drawMesh = (landmarks) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      const { width, height } = canvasRef.current;
      ctx.clearRect(0, 0, width, height);

      // Feature Indices for Custom Colors
      const eyeIndices = new Set([33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]);
      const mouthIndices = new Set([61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415]);

      // Stylized Face Mesh
      ctx.lineWidth = 1;
      
      // Draw Connections (Face Oval)
      const ovalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
      ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
      ctx.beginPath();
      ovalIndices.forEach((idx, i) => {
        const p = landmarks[idx];
        if (i === 0) ctx.moveTo(p.x * width, p.y * height);
        else ctx.lineTo(p.x * width, p.y * height);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw Dots
      landmarks.forEach((point, i) => {
        // Draw every 2nd point + all eye/mouth points
        if (i % 2 === 0 || eyeIndices.has(i) || mouthIndices.has(i)) { 
          ctx.beginPath();
          if (eyeIndices.has(i)) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // Red
          } else if (mouthIndices.has(i)) {
            ctx.fillStyle = "rgba(59, 130, 246, 0.9)"; // Blue
          } else {
            ctx.fillStyle = "rgba(16, 185, 129, 0.7)"; // Green
          }
          ctx.arc(point.x * width, point.y * height, 1.2, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Special highlight for NOSE
      const nose = landmarks[1];
      ctx.fillStyle = "#fbbf24"; 
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#fbbf24";
      ctx.beginPath();
      ctx.arc(nose.x * width, nose.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    setupAI();
    return () => {
      isMounted = false;
      if (videoStream) videoStream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white font-mono overflow-hidden">
      <div className="relative w-full h-full">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover scale-x-[-1]" 
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1] pointer-events-none" 
        />
        
        {/* Futuristic Overlay - Adjusted for Fullscreen */}
        <div className="absolute inset-0 flex flex-col pointer-events-none p-4 sm:p-8">
          <div className="flex justify-between items-start w-full gap-2 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex-1 max-w-[160px] sm:max-w-[240px]">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <p className="text-emerald-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold opacity-70">Detection</p>
                {holdProgress > 0 && (
                  <p className="text-emerald-400 text-xs sm:text-sm font-black">{Math.round(holdProgress)}%</p>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${currentPos === 'center' ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : (holdProgress > 0 ? 'bg-amber-500 animate-pulse' : 'bg-white/20')}`} />
                <p className="text-xl sm:text-4xl font-black tracking-tighter">{currentPos.toUpperCase()}</p>
              </div>
              
              {holdProgress > 0 && (
                <div className="w-full bg-white/10 h-1.5 sm:h-3 mt-3 sm:mt-4 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-150 ease-out shadow-[0_0_15px_#10b981]" 
                    style={{ width: `${holdProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] flex items-center gap-4 sm:gap-10 shadow-2xl">
              <div className="text-center group">
                <p className="text-emerald-400 text-[10px] sm:text-xs tracking-widest uppercase mb-1 font-bold opacity-70">Left</p>
                <p className="text-2xl sm:text-5xl font-black group-hover:scale-110 transition-transform tabular-nums">{counts.left}</p>
              </div>
              <div className="w-[1px] h-10 sm:h-16 bg-white/20" />
              <div className="text-center group">
                <p className="text-rose-400 text-[10px] sm:text-xs tracking-widest uppercase mb-1 font-bold opacity-70">Right</p>
                <p className="text-2xl sm:text-5xl font-black group-hover:scale-110 transition-transform tabular-nums">{counts.right}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto self-center flex flex-col items-center gap-4 pointer-events-auto w-full max-w-xs">
            <div className="bg-emerald-500/10 backdrop-blur-2xl border border-emerald-500/30 px-6 sm:px-12 py-3 sm:py-6 rounded-[2rem] sm:rounded-[3rem] flex justify-between items-center shadow-2xl w-full">
              <p className="text-emerald-400 text-xs sm:text-sm tracking-[0.3em] uppercase font-black">Total</p>
              <p className="text-3xl sm:text-6xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] tabular-nums">{counts.total}</p>
            </div>
            
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-lg">
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'Ready!' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse shadow-[0_0_10px_currentColor]`} />
              <p className="text-white/60 text-xs sm:text-sm tracking-[0.2em] uppercase font-bold italic">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StretchingDetector;