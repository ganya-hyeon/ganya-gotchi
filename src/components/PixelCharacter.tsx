'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

const SVGS = [
  '/icons/bubble_01.svg',
  '/icons/light_01.svg',
  '/icons/light_02.svg',
  '/icons/star02.svg',
  '/icons/star_01.svg'
];

// ── SVG 데이터 기반 정밀 좌표 ──────────────────────────────────────────
const MIN_X = 50, MIN_Y = 34, OC = 10, CELL = 10;

// 기본 몸통 윤곽선 (공통)
const BODY_PX = [
  [120,54],[120,44],[120,34],[110,54],[100,54],[90,64],[160,64],[170,74],
  [80,64],[70,74],[60,84],[60,164],[179,164],[50,114],[189,114],[179,84],[60,94],[60,174],
  [70,184],[90,194],[110,194],[130,194],[159,184],[80,184],[100,194],[100,204],[120,194],
  [140,194],[140,204],[150,194],[169,184],[179,174],[50,124],[189,124],[179,94],[60,104],
  [50,134],[189,134],[50,144],[189,144],[50,154],[189,154],[179,104],[150,64],[130,54],[140,54],
];

// 레벨 2: EXPLORER 추가 장비 (모자)
const HAT_PX = [
  // 챙 (y=89, x=50~190)
  [50,84],[60,84],[70,84],[80,84],[90,84],[100,84],[110,84],[120,84],[130,84],[140,84],[150,84],[160,84],[170,84],[180,84],[190,84],
  // 몸체 (y=74, 64, 54, 44)
  [60,74],[70,74],[80,74],[90,74],[100,74],[110,74],[120,74],[130,74],[140,74],[150,74],[160,74],[170,74],[180,74],
  [70,64],[80,64],[90,64],[100,64],[110,64],[120,64],[130,64],[140,64],[150,64],[160,64],[170,64],
  [80,54],[90,54],[100,54],[110,54],[120,54],[130,54],[140,54],[150,54],[160,54],
];

// 레벨 2: EXPLORER 추가 장비 (가방 - 옆면)
const BACKPACK_PX = [
  [179,114],[189,114],[199,114],
  [179,124],[189,124],[199,124],
  [179,134],[189,134],[199,134],
  [179,144],[189,144],[199,144],
];

// 표정 타입 정의
interface Face {
  mouth: number[][];
  eyes: number[][] | null;
}

// 표정 데이터 세트
const FACE_DEFAULT: Face = {
  mouth: [[110,137],[110,142],[120,137],[120,142],[130,137],[130,142]],
  eyes: null // 트래킹 사용
};

const FACE_HAPPY01: Face = {
  mouth: [[110,137],[110,144],[120,137],[120,144],[130,137],[130,144]],
  eyes: [[90,109],[149,109],[100,119],[159,119],[80,119],[139,119]]
};

const FACE_HAPPY02: Face = {
  mouth: [[110,137],[110,149],[120,137],[120,149],[130,137],[130,149]],
  eyes: [[90,109],[149,109],[100,119],[159,119],[80,119],[139,119]]
};

const FACE_SLEEP: Face = {
  mouth: [[110,137],[110,142],[120,137],[120,142],[130,137],[130,142]],
  eyes: [[89,124],[98,124],[141,124],[151,124]] // 감은 눈
};

const EYE_L_CFG = { sx: (95 - MIN_X) / OC * CELL, sy: (116 - MIN_Y) / OC * CELL, cx: (95 - MIN_X) / OC * CELL + CELL / 2, cy: (116 - MIN_Y) / OC * CELL + 8 };
const EYE_R_CFG = { sx: (145 - MIN_X) / OC * CELL, sy: (116 - MIN_Y) / OC * CELL, cx: (145 - MIN_X) / OC * CELL + CELL / 2, cy: (145 - MIN_Y) / OC * CELL + 8 };
const SOCK_H = 16; 
const MAX_EYE_MOVE = 3;

export default function PixelCharacter() {
  const { isPetting, setPetting, isWaving, level, isEvolving, setPriorityDialogue, priorityDialogue, isHovering, setHovering } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleConfigs, setParticleConfigs] = useState<{id: number, x: number, delay: number, duration: number, iconIndex: number}[]>([]);
  const [waveMotion, setWaveMotion] = useState({ tx: 0, r: 0 });
  const [happyFrame, setHappyFrame] = useState(0); 
  const [isSleeping, setIsSleeping] = useState(false);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const lastPetTime = useRef<number>(0);
  const eyePos = useRef({ lx: EYE_L_CFG.cx, ly: EYE_L_CFG.cy, rx: EYE_R_CFG.cx, ry: EYE_R_CFG.cy });

  // 비활성 타이머 리셋 함수
  const resetIdleTimer = React.useCallback(() => {
    setIsSleeping(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setIsSleeping(true);
    }, 180000); // 정확히 3분 (3 * 60 * 1000)
  }, []);

  useEffect(() => {
    const handleEvents = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        mousePos.current = { x: e.clientX, y: e.clientY };
      } else if (e.touches.length > 0) {
        mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      resetIdleTimer();
    };
    
    window.addEventListener('mousemove', handleEvents as unknown as EventListener);
    window.addEventListener('mousedown', handleEvents as unknown as EventListener);
    window.addEventListener('touchstart', handleEvents as unknown as EventListener);
    window.addEventListener('keydown', resetIdleTimer);
    
    setTimeout(() => resetIdleTimer(), 0); // 초기 시작
    
    return () => {
      window.removeEventListener('mousemove', handleEvents as unknown as EventListener);
      window.removeEventListener('mousedown', handleEvents as unknown as EventListener);
      window.removeEventListener('touchstart', handleEvents as unknown as EventListener);
      window.removeEventListener('keydown', resetIdleTimer);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    if (!isPetting) {
        setTimeout(() => setHappyFrame(0), 0);
        return;
    }
    const interval = setInterval(() => {
      setHappyFrame(prev => (prev === 0 ? 1 : 0));
    }, 200);
    return () => clearInterval(interval);
  }, [isPetting]);

  // 랜덤 행동 유도 멘트 로직
  useEffect(() => {
    if (isSleeping || isPetting || isHovering) {
        return;
    }

    const tips = [
        "work 탭으로 내 여행일지를 확인해볼래? ◈",
        "feed를 눌러서 먹이를 줘봐! 내 능력치가 보일거야 ✨",
        "가냐랑 같이 여행을 떠나볼까? 🐣",
        "내 레벨이 오르면 어떻게 변할지 궁금하지 않아? ◈",
        "오늘도 가냐랑 힘차게 달려보자구! 🔥"
    ];

    const interval = setInterval(() => {
        // 이미 다른 중요 대화가 있으면 건너뜀
        if (priorityDialogue) return;

        const randomMsg = tips[Math.floor(Math.random() * tips.length)];
        setPriorityDialogue(randomMsg);
        
        // 5초 후 메시지 제거
        setTimeout(() => {
            setPriorityDialogue(null);
        }, 5000);
    }, 25000); // 25초마다 새로운 팁 시도

    return () => clearInterval(interval);
  }, [isSleeping, isPetting, isHovering, setPriorityDialogue, priorityDialogue]);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const relX = (mousePos.current.x - rect.left) * scaleX;
      const relY = (mousePos.current.y - rect.top) * scaleY;

      const updateEye = (cfg: {cx: number, cy: number, sx: number, sy: number}) => {
        const dx = relX - cfg.cx;
        const dy = relY - cfg.cy;
        const dist = Math.hypot(dx, dy);
        const f = Math.min(dist / 150, 1);
        const angle = Math.atan2(dy, dx);
        return { tx: cfg.cx + Math.cos(angle) * MAX_EYE_MOVE * f, ty: cfg.cy + Math.sin(angle) * MAX_EYE_MOVE * f };
      };

      const tL = updateEye(EYE_L_CFG);
      const tR = updateEye(EYE_R_CFG);
      eyePos.current.lx += (tL.tx - eyePos.current.lx) * 0.15;
      eyePos.current.ly += (tL.ty - eyePos.current.ly) * 0.15;
      eyePos.current.rx += (tR.tx - eyePos.current.rx) * 0.15;
      eyePos.current.ry += (tR.ty - eyePos.current.ry) * 0.15;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const toX = (val: number) => (val - MIN_X) / OC * CELL;
      const toY = (val: number) => (val - MIN_Y) / OC * CELL;

      // 1. 몸통 검은색 채우기
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(toX(100), toY(64)); ctx.lineTo(toX(100), toY(74)); ctx.lineTo(toX(80), toY(74)); ctx.lineTo(toX(80), toY(84)); ctx.lineTo(toX(70), toY(84)); ctx.lineTo(toX(70), toY(114)); ctx.lineTo(toX(60), toY(114)); ctx.lineTo(toX(60), toY(164.5)); ctx.lineTo(toX(70), toY(164.5)); ctx.lineTo(toX(70), toY(184.5)); ctx.lineTo(toX(90), toY(184.5)); ctx.lineTo(toX(90), toY(194.5)); ctx.lineTo(toX(159), toY(194.5)); ctx.lineTo(toX(159), toY(184.5)); ctx.lineTo(toX(179), toY(184.5)); ctx.lineTo(toX(179), toY(164)); ctx.lineTo(toX(189), toY(164)); ctx.lineTo(toX(189), toY(114)); ctx.lineTo(toX(179.5), toY(114)); ctx.lineTo(toX(179.5), toY(84)); ctx.lineTo(toX(170), toY(84)); ctx.lineTo(toX(170), toY(74)); ctx.lineTo(toX(149.5), toY(74)); ctx.lineTo(toX(149.5), toY(64));
      ctx.closePath(); ctx.fill();

      // 2. 흰색 픽셀 (윤곽선)
      ctx.fillStyle = '#FFFFFF';
      BODY_PX.forEach(([x, y]) => { ctx.fillRect(toX(x), toY(y), CELL, CELL); });

      // 3. 레벨 2 장비 렌더링 (EXPLORER)
      if (level >= 2) {
        // 모자 (흰색)
        ctx.fillStyle = '#FFFFFF';
        HAT_PX.forEach(([x, y]) => { ctx.fillRect(toX(x), toY(y), CELL, CELL); });
        // 모자 포인트 (검은색으로 변경하여 대비)
        ctx.fillStyle = '#111111';
        ctx.fillRect(toX(120), toY(64), CELL, CELL);

        // 가방 (진한 갈색/검은색)
        ctx.fillStyle = '#111111';
        BACKPACK_PX.forEach(([x, y]) => { ctx.fillRect(toX(x), toY(y), CELL, CELL); });
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(toX(189), toY(124), CELL, CELL); // 가방 포인트
      }

      // 표정 결정 우선순위: Petting/Hovering > Sleeping > Default
      let currentFace: Face = FACE_DEFAULT;
      if (isPetting || isHovering) {
        currentFace = happyFrame === 0 ? FACE_HAPPY01 : FACE_HAPPY02;
      } else if (isSleeping) {
        currentFace = FACE_SLEEP;
      }

      // 입/눈 픽셀 색상 (흰색)
      currentFace.mouth.forEach(([x, y]) => { ctx.fillRect(toX(x), toY(y), CELL, CELL); });

      if (currentFace.eyes) {
        currentFace.eyes.forEach(([x, y]) => { ctx.fillRect(toX(x), toY(y), CELL, CELL); });
      } else {
        const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
        const lx = clamp(Math.round(eyePos.current.lx - CELL/2), EYE_L_CFG.sx - MAX_EYE_MOVE, EYE_L_CFG.sx + MAX_EYE_MOVE);
        const ly = clamp(Math.round(eyePos.current.ly - CELL/2), EYE_L_CFG.sy, EYE_L_CFG.sy + SOCK_H - CELL);
        const rx = clamp(Math.round(eyePos.current.rx - CELL/2), EYE_R_CFG.sx - MAX_EYE_MOVE, EYE_R_CFG.sx + MAX_EYE_MOVE);
        const ry = clamp(Math.round(eyePos.current.ry - CELL/2), EYE_R_CFG.sy, EYE_R_CFG.sy + SOCK_H - CELL);
        ctx.fillRect(lx, ly, CELL, CELL); ctx.fillRect(rx, ry, CELL, CELL);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPetting, isHovering, happyFrame, isSleeping, level]);

  useEffect(() => {
    if (isWaving) {
      const interval = setInterval(() => { setWaveMotion({ tx: (Math.random() - 0.5) * 4, r: (Math.random() - 0.5) * 6 }); }, 100);
      return () => clearInterval(interval);
    } else { 
      setTimeout(() => setWaveMotion({ tx: 0, r: 0 }), 0); 
    }
  }, [isWaving]);

  const handleInteraction = (clientX: number, clientY: number) => { 
    resetIdleTimer();
    setPetting(true, 1); 

    const nowTime = Date.now();
    if (!lastPetTime.current || nowTime - lastPetTime.current > 4000) {
      const messages = ["더 쓰다듬어줘! 💖", "헤헤, 기분 좋아... ✨", "가냐는 쓰다듬는게 제일 좋아! ◈", "손길이 따뜻해! 💕"];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setPriorityDialogue(randomMsg);
      lastPetTime.current = nowTime;
    }
  };

  useEffect(() => {
    if (isPetting && particleConfigs.length === 0) {
      const generate = setTimeout(() => {
        const particleCount = 5; // 개수를 10개에서 5개로 축소
        const intervals = [0.1, 0.2, 0.15, 0.25]; // 간격을 조금 더 넓게 조정
        let currentDelay = 0;
        const possibleX = Array.from({ length: 11 }, (_, i) => (i - 5) * 20);
        const shuffledX = [...possibleX].sort(() => Math.random() - 0.5);
        setParticleConfigs(Array.from({ length: particleCount }).map((_, i) => {
          currentDelay += intervals[i % 4] * 2.5; 
          return { id: i, x: shuffledX[i], delay: currentDelay, duration: 4.5, iconIndex: Math.floor(Math.random() * 5) };
        }));
      }, 0);
      return () => clearTimeout(generate);
    } else if (!isPetting && particleConfigs.length > 0) {
      const clear = setTimeout(() => setParticleConfigs([]), 0);
      return () => clearTimeout(clear);
    }
  }, [isPetting, particleConfigs.length]);

  return (
    <div 
      className="relative w-64 h-64 flex items-center justify-center touch-none select-none cursor-pointer" 
      onPointerDown={(e) => handleInteraction(e.clientX, e.clientY)} 
      onPointerMove={(e) => { 
        if (e.buttons > 0) handleInteraction(e.clientX, e.clientY); 
      }} 
      onPointerUp={() => setPetting(false, 0)} 
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => {
        setHovering(false);
        setPetting(false, 0);
      }}
    >
      
      {/* 캐릭터 자체에는 이제 말풍선이 없음 (메인 대화창으로 통합) */}

      <motion.div 
        className="relative z-10" 
        animate={isEvolving ? {
          opacity: [1, 0.8, 1],
          filter: [
            'drop-shadow(0 0 10px var(--primary-glow))',
            'drop-shadow(0 0 30px #FFFFFF)',
            'drop-shadow(0 0 10px var(--primary-glow))'
          ]
        } : { 
          y: isSleeping ? [0, 2, 0] : [0, -4, 0], 
          translateX: waveMotion.tx, 
          rotate: waveMotion.r, 
          scale: isPetting ? 1.08 : 1,
          opacity: isSleeping ? 0.8 : 1
        }} 
        transition={isEvolving ? {
          duration: 0.15,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "linear",
          times: [0, 0.2, 0.5, 0.7, 0.9, 1]
        } : isWaving ? { 
          duration: 0.12, 
          ease: "linear" 
        } : { 
          duration: isSleeping ? 6 : 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <canvas ref={canvasRef} width={150} height={180} className="w-36 h-44" style={{ imageRendering: 'pixelated' }} />
      </motion.div>

      <AnimatePresence>
        {isPetting && particleConfigs.length > 0 && particleConfigs.map((cfg) => (
            <motion.div 
                key={`${cfg.id}-${cfg.iconIndex}`} 
                initial={{ opacity: 0, y: 30, x: cfg.x, scale: 0.6 }} 
                animate={{ opacity: [0, 1, 1, 1, 0], y: -220, scale: 0.6 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: cfg.duration, repeat: Infinity, delay: cfg.delay, ease: "linear" }} 
                className="absolute pointer-events-none select-none w-10 h-10 flex items-center justify-center z-20" 
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))' }}
            >
                <Image src={SVGS[cfg.iconIndex]} alt="particle" width={40} height={40} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
            </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
