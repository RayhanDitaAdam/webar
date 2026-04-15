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
        videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
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
        // Menggunakan ratio sesuai saran untuk deteksi nengok mentok
        if (ratio < 0.22) detectedPos = 'left';
        else if (ratio > 4.5) detectedPos = 'right';

        // Logika Hold Duration
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

      // Draw Sparse Face Dots
      ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
      for (let i = 0; i < landmarks.length; i += 10) {
        const point = landmarks[i];
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 1, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Special highlight for NOSE
      const nose = landmarks[1];
      ctx.fillStyle = "#fbbf24"; 
      ctx.beginPath();
      ctx.arc(nose.x * width, nose.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    };

    setupAI();
    return () => {
      isMounted = false;
      if (videoStream) videoStream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 text-white font-mono">
      <div className="relative rounded-3xl overflow-hidden border-8 border-slate-900 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full max-w-[640px] h-auto object-cover scale-x-[-1]" 
        />
        <canvas 
          ref={canvasRef} 
          width="640" 
          height="480" 
          className="absolute top-0 left-0 w-full h-full scale-x-[-1] pointer-events-none" 
        />
        
        {/* Futuristic Overlay */}
        <div className="absolute top-6 left-6 right-6 flex flex-col gap-4">
          <div className="flex justify-between items-start w-full">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl min-w-[200px]">
              <div className="flex justify-between items-center mb-2">
                <p className="text-emerald-400 text-[10px] tracking-[0.2em] uppercase font-bold opacity-70">Detection</p>
                {holdProgress > 0 && (
                  <p className="text-emerald-400 text-[12px] font-black">{Math.round(holdProgress)}%</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${currentPos === 'center' ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : (holdProgress > 0 ? 'bg-amber-500 animate-pulse' : 'bg-white/20')}`} />
                <p className="text-2xl font-black tracking-tighter">{currentPos.toUpperCase()}</p>
              </div>
              
              {/* Progress Bar with Smoother Transition */}
              {holdProgress > 0 && (
                <div className="w-full bg-white/10 h-2 mt-3 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-150 ease-out" 
                    style={{ width: `${holdProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex gap-8 shadow-2xl">
              <div className="text-center group">
                <p className="text-emerald-400 text-[10px] tracking-widest uppercase mb-1 font-bold opacity-70">Left</p>
                <p className="text-3xl font-black group-hover:scale-110 transition-transform">{counts.left}</p>
              </div>
              <div className="w-[1px] h-12 bg-white/10 self-center" />
              <div className="text-center group">
                <p className="text-rose-400 text-[10px] tracking-widest uppercase mb-1 font-bold opacity-70">Right</p>
                <p className="text-3xl font-black group-hover:scale-110 transition-transform">{counts.right}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 px-8 py-4 rounded-3xl flex justify-between items-center shadow-2xl self-center w-full max-w-[200px]">
            <p className="text-emerald-400 text-[10px] tracking-widest uppercase font-bold">Total</p>
            <p className="text-3xl font-black text-emerald-400">{counts.total}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-3 bg-slate-900/50 px-6 py-3 rounded-full border border-slate-800">
        <div className={`w-2 h-2 rounded-full ${status === 'Ready!' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
        <p className="text-slate-400 text-sm tracking-widest uppercase italic">{status}</p>
      </div>
    </div>
  );
};

export default StretchingDetector;