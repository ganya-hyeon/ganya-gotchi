'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Hand, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';

interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface HandLandmarkerResult {
    landmarks: Landmark[][];
}

interface HandLandmarker {
    detectForVideo: (video: HTMLVideoElement, startTime: number) => HandLandmarkerResult;
}

declare global {
  interface Window {
    HandLandmarker: {
      createFromOptions: (resolver: unknown, options: unknown) => Promise<HandLandmarker>;
    };
    FilesetResolver: {
      forVisionTasks: (url: string) => Promise<unknown>;
    };
  }
}

export default function HandTrackingSystem() {
  const { 
    setTrackingCoords, 
    setPetting, 
    setHovering, 
    setPriorityDialogue, 
    setIsWaving, 
    setPinching,
    activeTab, 
    workViewMode,
    setIsTrackingActive,
    setTutorialActive,
    setTutorialStep,
    tutorialStep,
    setActiveTab
  } = useGameStore(useShallow(state => ({
    setTrackingCoords: state.setTrackingCoords,
    setPetting: state.setPetting,
    setHovering: state.setHovering,
    setPriorityDialogue: state.setPriorityDialogue,
    setIsWaving: state.setIsWaving,
    setPinching: state.setPinching,
    activeTab: state.activeTab,
    workViewMode: state.workViewMode,
    setIsTrackingActive: state.setIsTrackingActive,
    setTutorialActive: state.setTutorialActive,
    setTutorialStep: state.setTutorialStep,
    tutorialStep: state.tutorialStep,
    setActiveTab: state.setActiveTab
  })));

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastCoords = useRef({ x: 0, y: 0 });
  const dragControls = useDragControls();
  
  // Interaction states
  const lastWristX = useRef<number | null>(null);
  const dirChanges = useRef(0);
  const lastWaveTime = useRef(0);
  const lastPetX = useRef<number | null>(null);
  const lastPetTime = useRef<number>(0);
  const lastClickTime = useRef(0);
  const isPinchingRef = useRef(false);

  const drawSkeleton = useCallback((ctx: CanvasRenderingContext2D, landmarks: Landmark[]) => {
    if (!canvasRef.current) return;
    ctx.strokeStyle = '#00FFB2'; ctx.lineWidth = 1;
    const connections = [[0,1,2,3,4], [0,5,6,7,8], [5,9,10,11,12], [9,13,14,15,16], [13,17,18,19,20], [0,17]];
    connections.forEach(path => {
        ctx.beginPath();
        path.forEach((idx, i) => {
            const x = (1 - landmarks[idx].x) * canvasRef.current!.width;
            const y = landmarks[idx].y * canvasRef.current!.height;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
    });
  }, []);

  const frameCountRef = useRef(0);
  const detect = useCallback(function detectFn() {
    if (!videoRef.current || !landmarkerRef.current || !canvasRef.current) return;

    frameCountRef.current++;
    const frameSkip = isMobile ? 3 : 2; 
    if (frameCountRef.current % frameSkip !== 0) {
        requestRef.current = requestAnimationFrame(detectFn);
        return;
    }

    const startTimeMs = performance.now();
    const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (results.landmarks && results.landmarks.length > 0) {
        results.landmarks.forEach((landmarks: Landmark[]) => {
            drawSkeleton(ctx, landmarks);
        });

        const landmarks = results.landmarks[0] as Landmark[];
        const indexTip = landmarks[8];
        const wrist = landmarks[0];

        const sensitivity = isMobile ? 1.8 : 1.4; 
        const centerX = 0.5, centerY = 0.5;
        const mappedX = (1 - indexTip.x - centerX) * sensitivity + centerX;
        const mappedY = (indexTip.y - centerY) * sensitivity + centerY;
        
        const rawX = Math.max(0, Math.min(1, mappedX)) * window.innerWidth;
        const rawY = Math.max(0, Math.min(1, mappedY)) * window.innerHeight;
        
        const lerpFactor = isMobile ? 0.35 : 0.25; 
        const smoothX = lastCoords.current.x + (rawX - lastCoords.current.x) * lerpFactor;
        const smoothY = lastCoords.current.y + (rawY - lastCoords.current.y) * lerpFactor;
        
        if (Math.abs(smoothX - lastCoords.current.x) > 1 || Math.abs(smoothY - lastCoords.current.y) > 1) {
            lastCoords.current = { x: smoothX, y: smoothY };
            setTrackingCoords(smoothX, smoothY);
        }

        let anyHandPinching = false;
        results.landmarks.forEach((handLandmarks: Landmark[]) => {
          const thumbTip = handLandmarks[4];
          const indexTipPos = handLandmarks[8];
          const pinchDist = Math.hypot(indexTipPos.x - thumbTip.x, indexTipPos.y - thumbTip.y, indexTipPos.z - thumbTip.z);
          
          if (pinchDist < 0.05) { 
              anyHandPinching = true;
          }
        });

        if (anyHandPinching && !isPinchingRef.current) {
            setPinching(true);
            isPinchingRef.current = true;
            const now = Date.now();
            if (now - lastClickTime.current > 600) {
                const target = document.elementFromPoint(smoothX, smoothY);
                if (target) {
                    (target as HTMLElement).click();
                    const inner = target.closest('button, a') as HTMLElement;
                    if (inner && inner !== target) inner.click();
                }
                lastClickTime.current = now;
            }
        } else if (!anyHandPinching && isPinchingRef.current) {
            setPinching(false);
            isPinchingRef.current = false;
        }

        const isOpenHand = [8, 12, 16, 20].filter((i: number) => landmarks[i].y < landmarks[i-2].y).length >= 3;
        const isIndexOnly = landmarks[8].y < landmarks[6].y && landmarks[12].y > landmarks[10].y;

        const charX = window.innerWidth / 2, charY = window.innerHeight * 0.48;
        const dist = Math.hypot(smoothX - charX, smoothY - charY);
        
        if (isIndexOnly && dist < (isMobile ? 120 : 180)) {
            setHovering(true);
            const moveDist = lastPetX.current !== null ? Math.abs(indexTip.x - lastPetX.current) : 0;
            
            if (moveDist > 0.015) { // 감도를 살짝 완화
                setPetting(true, 1);
                
                const nowTime = Date.now();
                if (!lastPetTime.current || nowTime - lastPetTime.current > 4000) {
                    const messages = ["더 쓰다듬어줘! 💖", "헤헤, 기분 좋아... ✨", "가냐는 쓰다듬는게 제일 좋아! ◈", "손길이 따뜻해! 💕"];
                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                    setPriorityDialogue(randomMsg);
                    lastPetTime.current = nowTime;
                }
                // 실시간 쓰다듬기 상태 업데이트 시간 기록 (깜빡임 방지용)
                lastClickTime.current = nowTime; 
            } else {
                // 움직임이 멈춰도 300ms 동안은 쓰다듬기 상태 유지
                if (Date.now() - lastClickTime.current > 300) {
                    setPetting(false, 0);
                }
            }
            lastPetX.current = indexTip.x;
        } else {
            setHovering(false); 
            setPetting(false, 0); 
            lastPetX.current = null;
        }

        if (isOpenHand) {
            const curX = 1 - wrist.x;
            if (lastWristX.current !== null && Math.abs(curX - lastWristX.current) > 0.05) {
                dirChanges.current += 1;
                lastWristX.current = curX;
            } else if (lastWristX.current === null) lastWristX.current = curX;

            if (dirChanges.current >= 4 && startTimeMs - lastWaveTime.current > 3000) {
                setIsWaving(true);
                setPriorityDialogue("안녕! 반가워! ◈");
                setTimeout(() => { setIsWaving(false); }, 2500);
                lastWaveTime.current = startTimeMs;
                dirChanges.current = 0;
            }
        } else {
            dirChanges.current = 0; lastWristX.current = null;
        }
      } else if (results.landmarks) {
          // 손은 감지 시도했으나 랜드마크가 없는 경우에만 리셋
          setPetting(false, 0);
      }
    }
    requestRef.current = requestAnimationFrame(detectFn);
  }, [isMobile, setTrackingCoords, setPinching, setHovering, setPetting, setIsWaving, setPriorityDialogue, drawSkeleton]);

  const stopTracking = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setIsActive(false);
    setIsTrackingActive(false);
    setPetting(false, 0);
    setIsWaving(false);
  }, [setIsTrackingActive, setPetting, setIsWaving]);

  const startTracking = async () => {
    if (isActive || isLoading) return; 
    setIsLoading(true);
    setCameraError(null);

    try {
      if (!window.HandLandmarker) {
          await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.type = 'module';
              const pkgUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";
              script.textContent = `
                import { HandLandmarker, FilesetResolver } from "${pkgUrl}";
                window.HandLandmarker = HandLandmarker;
                window.FilesetResolver = FilesetResolver;
                window.dispatchEvent(new CustomEvent('mediapipe-ready'));
              `;
              const timeout = setTimeout(() => reject(new Error("MediaPipe Load Timeout")), 20000);
              window.addEventListener('mediapipe-ready', () => {
                  clearTimeout(timeout);
                  resolve();
              }, { once: true });
              document.head.appendChild(script);
          });
      }

      const vision = await window.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const handLandmarker = await window.HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: isMobile ? 1 : 2
      });

      landmarkerRef.current = handLandmarker;
      setTutorialActive(true);
      setTutorialStep(0); // Camera Permission Step
      setActiveTab('WORK');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: isMobile ? 320 : 640, 
          height: isMobile ? 240 : 480 
        } 
      });

      setIsActive(true);
      setIsTrackingActive(true);
      setTutorialStep(1); // Advance to Sync step
      setIsLoading(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            detect();
          };
        }
      }, 50);

    } catch (err: unknown) {
      console.error(err);
      setCameraError(err instanceof Error ? err.message : "Failed to start camera");
      setIsLoading(false);
      setIsActive(false);
    }
  };

  useEffect(() => { 
    const currentVideo = videoRef.current;
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (currentVideo && currentVideo.srcObject) {
            const stream = currentVideo.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }; 
  }, []);

  return (
    <div className={`fixed ${isMobile ? 'bottom-20 right-4' : 'top-32 right-6'} z-[100] pointer-events-none flex flex-col items-end gap-4`}>
        {/* Hand Tracking Toggle Button - Matches System Time Animation Exactly */}
        <motion.button
            animate={(isActive || activeTab !== 'QUEST_LOG') ? { x: 400, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startTracking}
            disabled={isLoading}
            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl border border-primary/30 bg-background/80 backdrop-blur-md text-primary transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(0,255,178,0.2)] pointer-events-auto"
        >
            {isLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Hand className="w-4 h-4 md:w-5 md:h-5" />}
            <span className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em]">{isLoading ? 'AI 로딩 중...' : '핸드 트래킹 시작'}</span>
        </motion.button>

        {/* World Coordinates HUD - Memoized to prevent re-rendering main component */}
        <CoordinateDisplay isActive={isActive} activeTab={activeTab} workViewMode={workViewMode} />

        {/* Camera View */}
        <AnimatePresence>
            {isActive && (
                <motion.div 
                    key="camera-view"
                    drag={!isMobile} dragControls={dragControls} dragListener={false} dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        boxShadow: tutorialStep === 1 
                            ? ['0 0 20px rgba(0,255,178,0.2)', '0 0 60px rgba(0,255,178,0.6)', '0 0 20px rgba(0,255,178,0.2)']
                            : '0 0 40px rgba(0,255,178,0.15)'
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                        type: 'spring', 
                        damping: 25, 
                        stiffness: 120,
                        boxShadow: { duration: 2, repeat: Infinity }
                    }}
                    className={`relative border border-primary/40 bg-black/95 rounded-xl overflow-hidden shadow-2xl ${isMobile ? 'w-[180px]' : 'w-64'} pointer-events-auto select-none`}
                    style={{ touchAction: 'none' }}
                >
                    <div onPointerDown={(e) => !isMobile && dragControls.start(e)} className={`flex items-center justify-between px-3 py-1.5 md:py-2 border-b border-primary/20 bg-primary/10 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}>
                        <div className="flex items-center gap-2 pointer-events-none">
                            <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[8px] md:text-[10px] font-mono text-primary uppercase tracking-widest">CAM</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded transition-colors text-primary/60">
                                <motion.div animate={{ rotate: isMinimized ? 180 : 0 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg></motion.div>
                            </button>
                            <button onPointerDown={(e) => e.stopPropagation()} onClick={stopTracking} className="p-1 hover:bg-red-500/20 rounded transition-colors text-primary/60 hover:text-red-400"><X className="w-3 h-3" /></button>
                        </div>
                    </div>
                    <motion.div animate={{ height: isMinimized ? 0 : 'auto' }} className="overflow-hidden bg-black">
                        <div className="relative aspect-video">
                            <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100 opacity-60" />
                            <canvas ref={canvasRef} width={isMobile ? 320 : 640} height={isMobile ? 240 : 480} className="absolute inset-0 w-full h-full pointer-events-none" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        {cameraError && <div className="mt-4 text-red-500 text-[10px] bg-red-500/10 p-2 border border-red-500/20 rounded">Error: {cameraError}</div>}
    </div>
  );
}

// Optimized sub-component for coordinate display
const CoordinateDisplay = React.memo(({ isActive, activeTab, workViewMode }: { isActive: boolean, activeTab: string, workViewMode: string }) => {
    const { trackingX, trackingY } = useGameStore(useShallow(state => ({
        trackingX: state.trackingX,
        trackingY: state.trackingY
    })));

    return (
        <motion.div 
            animate={(isActive || activeTab !== 'WORK' || workViewMode !== 'WORLD') ? { x: 400, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="flex flex-col items-end gap-1 px-3 md:px-4 py-1.5 md:py-2 bg-black/20 backdrop-blur-sm rounded-lg border border-primary/10"
        >
            <div className="flex items-center gap-2 md:gap-4">
                <span className="text-primary font-mono text-xs md:text-sm font-bold w-10 md:w-12 text-right">{Math.floor(trackingX).toString().padStart(3, '0')}</span>
                <span className="text-[8px] md:text-[9px] text-primary/40 font-mono font-black tracking-widest">X</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <span className="text-primary font-mono text-xs md:text-sm font-bold w-10 md:w-12 text-right">{Math.floor(trackingY).toString().padStart(3, '0')}</span>
                <span className="text-[8px] md:text-[9px] text-primary/40 font-mono font-black tracking-widest">Y</span>
            </div>
        </motion.div>
    );
});

CoordinateDisplay.displayName = 'CoordinateDisplay';
