import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const useFaceTracking = (drawMesh = false) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading AI...");
  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState({
    pitch: 'center', // 'up', 'down', 'center'
    yaw: 'center',   // 'left', 'right', 'center'
    roll: 0,         // degrees
    nose: { x: 0.5, y: 0.5, z: 0 },
    headTop: { x: 0.5, y: 0.5 },
    landmarks: null
  });

  const requestRef = useRef();

  useEffect(() => {
    let faceLandmarker;
    let videoStream;
    let isMounted = true;

    const setupAI = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
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
            if (isMounted) {
              setIsReady(true);
              setStatus("Ready!");
              predict();
            }
          };
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setStatus("Camera Denied");
      }
    };

    const predict = () => {
      if (!videoRef.current || !faceLandmarker || !isMounted) return;

      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // Key points
        const nose = landmarks[1];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];
        const topOfHead = landmarks[10];
        const chin = landmarks[152];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        // --- YAW (Left/Right) ---
        const distToLeft = Math.abs(nose.x - leftEar.x);
        const distToRight = Math.abs(nose.x - rightEar.x);
        const yawRatio = distToLeft / distToRight;
        
        let yaw = 'center';
        if (yawRatio < 0.25) yaw = 'left';
        else if (yawRatio > 4.0) yaw = 'right';

        // --- PITCH (Up/Down) ---
        // Using relative Y distances: nose-to-chin vs top-to-nose
        const topToNoseDist = nose.y - topOfHead.y;
        const noseToChinDist = chin.y - nose.y;
        const pitchRatio = topToNoseDist / noseToChinDist;
        
        let pitch = 'center';
        // When looking up, topToNoseDist decreases, noseToChinDist increases. Ratio decreases.
        if (pitchRatio < 0.6) pitch = 'up';
        // When looking down, topToNoseDist increases, noseToChinDist decreases. Ratio increases.
        else if (pitchRatio > 1.3) pitch = 'down';

        // --- ROLL (Tilt) ---
        const dy = rightEye.y - leftEye.y;
        const dx = rightEye.x - leftEye.x;
        let roll = Math.atan2(dy, dx) * (180 / Math.PI);
        // Normal horizontal eyes -> roll around 0. 
        // Tilt right shoulder (user's right) -> image right eye goes up, left eye goes down.
        // Wait, image is mirrored in canvas usually, but data isn't.
        // Let's just pass the raw degree.

        // --- VISUAL MAPPING (object-cover) ---
        let visualNose = { x: nose.x, y: nose.y };
        let visualHeadTop = { x: topOfHead.x, y: topOfHead.y };
        
        if (videoRef.current) {
          const vw = videoRef.current.videoWidth;
          const vh = videoRef.current.videoHeight;
          const cw = videoRef.current.clientWidth;
          const ch = videoRef.current.clientHeight;
          
          if (vw && vh && cw && ch) {
            const scale = Math.max(cw / vw, ch / vh);
            const sw = vw * scale;
            const sh = vh * scale;
            const ox = (sw - cw) / 2;
            const oy = (sh - ch) / 2;
            
            visualNose = {
              x: 1 - ((nose.x * sw - ox) / cw), // Mirrored
              y: (nose.y * sh - oy) / ch
            };
            visualHeadTop = {
              x: 1 - ((topOfHead.x * sw - ox) / cw),
              y: (topOfHead.y * sh - oy) / ch
            };
          }
        }

        setMetrics({
          pitch,
          yaw,
          roll,
          nose: { x: nose.x, y: nose.y, z: nose.z },
          headTop: { x: topOfHead.x, y: topOfHead.y },
          visualNose,
          visualHeadTop,
          landmarks
        });

        if (drawMesh && canvasRef.current) {
          drawFaceMesh(landmarks, canvasRef.current);
        }
      } else {
        if (drawMesh && canvasRef.current) {
           const ctx = canvasRef.current.getContext("2d");
           ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      requestRef.current = requestAnimationFrame(predict);
    };

    setupAI();

    return () => {
      isMounted = false;
      if (videoStream) videoStream.getTracks().forEach(t => t.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [drawMesh]);

  return { videoRef, canvasRef, status, isReady, metrics };
};

const drawFaceMesh = (landmarks, canvas) => {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.lineWidth = 1;
  
  // Draw Oval
  const ovalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.beginPath();
  ovalIndices.forEach((idx, i) => {
    const p = landmarks[idx];
    if (i === 0) ctx.moveTo(p.x * width, p.y * height);
    else ctx.lineTo(p.x * width, p.y * height);
  });
  ctx.closePath();
  ctx.stroke();

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
