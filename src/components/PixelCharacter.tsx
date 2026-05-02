'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

const PAL: Record<string, string | null> = {
  '_': null, 'N': '#0D0500', 'D': '#2A1005',
  'Y': '#FFD000', 'H': '#FFE840', 'O': '#DC9800',
  'W': '#FFFDE0', 'B': '#C03010', 'K': '#F0A07A',
  'T': '#B86000', 'F': '#C85000',
  'G': '#00FFB2', 'S': '#008F63' // Glow/Silver for evolution
};

const CELL = 7;
const GRID = 24;
const EYE = { lc: 5, lr: 7, rc: 14, rr: 7 };

const BASE_GRID = [
    ['_','_','_','_','_','_','_','_','N','N','N','N','N','N','N','N','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','D','D','Y','H','H','H','H','H','H','H','H','D','N','_','_','_','_','_'],
    ['_','_','_','_','_','_','T','T','Y','H','H','H','H','H','H','H','N','N','N','_','_','_','_','_'],
    ['_','_','_','_','N','B','Y','H','H','H','H','H','H','W','W','W','W','Y','Y','N','N','_','_','_'],
    ['_','_','_','_','T','H','H','H','H','H','H','K','W','W','W','W','W','H','H','O','D','_','_','_'],
    ['_','_','_','N','Y','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','N','D','_','_'],
    ['_','_','_','N','Y','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','O','D','_','_'],
    ['_','_','_','D','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','O','D','_','_'],
    ['_','N','Y','Y','H','H','H','H','H','Y','H','H','H','H','H','H','H','H','H','H','H','Y','N','_'],
    ['_','N','Y','Y','H','H','H','H','H','O','B','B','B','H','H','H','H','H','H','H','H','Y','N','_'],
    ['_','N','Y','Y','H','H','H','H','H','O','B','B','B','B','H','H','H','H','H','H','H','Y','N','_'],
    ['_','N','Y','Y','H','H','H','H','H','H','O','B','B','O','H','H','H','H','H','H','H','Y','N','_'],
    ['_','N','Y','Y','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','Y','N','_'],
    ['_','N','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','Y','N','_'],
    ['O','Y','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','Y','Y'],
    ['O','Y','Y','H','_','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','_','H','Y','Y'],
    ['O','Y','Y','T','N','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','N','H','Y','Y'],
    ['_','N','Y','T','N','H','H','H','H','H','H','H','H','H','H','H','H','H','H','H','N','Y','N','_'],
    ['_','_','N','O','Y','Y','H','H','H','H','H','H','H','H','H','H','H','H','H','Y','Y','N','_','_'],
    ['_','_','_','_','N','O','Y','Y','H','H','H','H','H','H','H','H','H','Y','Y','Y','N','_','_','_'],
    ['_','_','_','_','N','O','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','H','Y','Y','Y','D','_','_','_'],
    ['_','_','_','_','_','N','T','T','Y','Y','Y','Y','Y','Y','Y','Y','Y','B','N','_','_','_','_','_'],
    ['_','_','_','N','N','B','O','O','T','N','N','N','N','N','N','N','B','O','O','B','D','N','_','_'],
    ['_','_','_','N','N','B','O','O','B','_','_','_','_','_','_','B','B','O','O','B','N','_','_','_'],
];

// Evolution Overlay Pixels
const EVO_PARTS: Record<number, { r: number, c: number, v: string }[]> = {
  2: [
    { r: 2, c: 2, v: 'G' }, { r: 1, c: 3, v: 'G' }, { r: 0, c: 4, v: 'G' }, // Horn L
    { r: 2, c: 21, v: 'G' }, { r: 1, c: 20, v: 'G' }, { r: 0, v: 'G', c: 19 }, // Horn R
  ],
  3: [
    { r: 10, c: 0, v: 'G' }, { r: 11, c: 1, v: 'G' }, { r: 12, c: 2, v: 'G' }, // Wing L
    { r: 10, c: 23, v: 'G' }, { r: 11, c: 22, v: 'G' }, { r: 12, v: 'G', c: 21 }, // Wing R
  ],
  4: [
    { r: 0, c: 12, v: 'H' }, { r: -1, c: 12, v: 'H' }, // Halo
    { r: 4, c: 4, v: 'G' }, { r: 4, c: 19, v: 'G' }, // Power dots
  ]
};

export default function PixelCharacter({ level }: { level: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { trackingX, trackingY, isPetting, isWaving, setTrackingCoords, setPetting } = useGameStore();
  
  const [offsets, setOffsets] = useState({ ox: 0, oy: 0 });
  const [eyeState, setEyeState] = useState<'open' | 'closed' | 'half'>('open');
  const [waveMotion, setWaveMotion] = useState({ tx: 0, r: 0 });
  const animFrameRef = useRef<number>(0);

  // Direct Interaction (Touch/Mouse)
  const handleInteraction = (x: number, y: number) => {
    setTrackingCoords(x, y);
    
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(x - centerX, y - centerY);
    
    if (dist < 120) {
      setPetting(true, 1);
    } else {
      setPetting(false, 0);
    }
  };

  // Pre-render static body to offscreen canvas for performance
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 192;
    offscreen.height = 192;
    const octx = offscreen.getContext('2d')!;
    
    // Draw Base
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const v = BASE_GRID[r][c];
        if (!PAL[v]) continue;
        // Skip eye holes to draw them dynamically
        if ((c >= EYE.lc && c <= EYE.lc + 4 && r >= EYE.lr && r <= EYE.lr + 4) ||
            (c >= EYE.rc && c <= EYE.rc + 4 && r >= EYE.rr && r <= EYE.rr + 4)) continue;
        
        octx.fillStyle = PAL[v] as string;
        octx.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    }

    // Draw Evolution Parts
    for (let l = 2; l <= level; l++) {
      EVO_PARTS[l]?.forEach(p => {
        octx.fillStyle = PAL[p.v] as string;
        octx.fillRect(p.c * CELL, p.r * CELL, CELL, CELL);
      });
    }

    offscreenCanvasRef.current = offscreen;
  }, [level]);

  // Handle waving motion
  useEffect(() => {
    if (isWaving) {
      const waveSeq = [
        { tx: -6, r: -4, oy: -3 }, { tx: 6, r: 4, oy: 3 },
        { tx: -5, r: -3, oy: -3 }, { tx: 5, r: 3, oy: 3 },
        { tx: -3, r: -2, oy: -3 }, { tx: 3, r: 2, oy: 3 }, { tx: 0, r: 0, oy: 0 },
      ];
      waveSeq.forEach((step, i) => {
        setTimeout(() => {
          if (step.tx !== undefined) setWaveMotion({ tx: step.tx, r: step.r });
          setOffsets(prev => ({ ...prev, oy: step.oy }));
        }, i * 130);
      });
    } else {
      const reset = setTimeout(() => {
        setWaveMotion({ tx: 0, r: 0 });
        setOffsets(p => ({ ...p, oy: 0 }));
      }, 0);
      return () => clearTimeout(reset);
    }
  }, [isWaving]);

  // Main Render Loop
  useEffect(() => {
    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas || !offscreenCanvasRef.current) {
            animFrameRef.current = requestAnimationFrame(render);
            return;
        }
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, 192, 192);
        
        // 1. Draw Static Body
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);

        // 2. Draw Dynamic Eyes
        if (isPetting || isWaving) {
            const drawHappy = (bc: number, br: number) => {
                const oy = Math.round(offsets.oy);
                // Fill background with body color first
                ctx.fillStyle = '#FFE840'; 
                ctx.fillRect(bc * CELL, br * CELL + oy, 5 * CELL, 5 * CELL);
                
                // Draw black smile lines
                ctx.fillStyle = '#0D0500';
                ctx.fillRect(bc * CELL + CELL, br * CELL + CELL + oy, 3 * CELL, CELL);
                ctx.fillRect(bc * CELL, br * CELL + 2 * CELL + oy, CELL, CELL);
                ctx.fillRect(bc * CELL + 4 * CELL, br * CELL + 2 * CELL + oy, CELL, CELL);
            };
            drawHappy(EYE.lc, EYE.lr); drawHappy(EYE.rc, EYE.rr);
        } else if (eyeState === 'open') {
            const drawEye = (bc: number, br: number) => {
                ctx.fillStyle = '#FEE42D'; ctx.fillRect(bc * CELL, br * CELL, 5 * CELL, 5 * CELL);
                const dox = Math.max(-1.5, Math.min(1.5, offsets.ox / CELL));
                const doy = Math.max(-1.5, Math.min(1.5, offsets.oy / CELL));
                ctx.fillStyle = '#0D0500'; ctx.fillRect(bc * CELL + CELL + dox * CELL, br * CELL + CELL + doy * CELL, 2 * CELL, 2 * CELL);
            };
            drawEye(EYE.lc, EYE.lr); drawEye(EYE.rc, EYE.rr);
        } else {
            ctx.fillStyle = '#0D0500';
            const row = eyeState === 'half' ? 2 : 3;
            ctx.fillRect(EYE.lc * CELL, (EYE.lr + row) * CELL, 5 * CELL, CELL);
            ctx.fillRect(EYE.rc * CELL, (EYE.rr + row) * CELL, 5 * CELL, CELL);
        }

        animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [offsets, eyeState, isPetting, isWaving]);

  // Eye tracking & Blinking logic
  useEffect(() => {
    const handleBlink = () => {
        if (isPetting || isWaving) return;
        setEyeState('half');
        setTimeout(() => setEyeState('closed'), 60);
        setTimeout(() => setEyeState('half'), 120);
        setTimeout(() => setEyeState('open'), 180);
    };
    const interval = setInterval(() => {
        if (Math.random() > 0.7) handleBlink();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPetting, isWaving]);

  useEffect(() => {
    if (!canvasRef.current || eyeState === 'closed' || isPetting || isWaving) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = trackingX - centerX;
    const dy = trackingY - centerY;
    const dist = Math.hypot(dx, dy);
    if (dist > 20) { // Deadzone
      const maxOffset = 5; const factor = 0.12;
      setOffsets({ 
        ox: (dx / dist) * Math.min(dist * factor, maxOffset), 
        oy: (dy / dist) * Math.min(dist * factor, maxOffset) 
      });
    }
  }, [trackingX, trackingY, eyeState, isPetting, isWaving]);

  const SVGS = [
    '/icons/bubble_01.svg',
    '/icons/light_01.svg',
    '/icons/star02.svg',
    '/icons/light_02.svg',
    '/icons/star_01.svg'
  ];

  const [particleConfigs, setParticleConfigs] = useState<{id:number, x:number, delay:number, duration:number, iconIndex:number}[]>([]);
  
  useEffect(() => {
    if (isPetting && particleConfigs.length === 0) {
      const generate = setTimeout(() => {
        setParticleConfigs(Array.from({ length: 12 }).map((_, i) => {
          // 일직선으로 올라가도록 고정된 X 좌표 사용
          const xPos = (Math.random() - 0.5) * 140; 
          return {
            id: i,
            x: xPos,
            delay: i * 0.15, // 따다닥 등장하는 간격
            duration: 1.0 + Math.random() * 0.4, // 일정한 속도감 부여
            iconIndex: Math.floor(Math.random() * 5)
          };
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
      className="relative w-48 h-48 flex items-center justify-center touch-none select-none cursor-pointer"
      onPointerDown={(e) => handleInteraction(e.clientX, e.clientY)}
      onPointerMove={(e) => {
        if (e.buttons > 0) handleInteraction(e.clientX, e.clientY);
      }}
      onPointerUp={() => setPetting(false, 0)}
      onPointerLeave={() => setPetting(false, 0)}
    >
      <motion.div
        animate={{ 
            y: [0, -4, 0],
            translateX: waveMotion.tx,
            rotate: waveMotion.r,
            scale: isPetting ? 1.08 : 1
        }}
        transition={isWaving ? { duration: 0.12, ease: "linear" } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <canvas ref={canvasRef} width={168} height={168} className="w-42 h-42" style={{ imageRendering: 'pixelated' }} />
      </motion.div>
      
      {/* Petting Particles */}
      <AnimatePresence>
        {isPetting && particleConfigs.map((cfg) => (
            <motion.div 
               key={cfg.id} 
               initial={{ opacity: 0, scale: 0, y: 20, x: cfg.x }} 
               animate={{ 
                   opacity: [0, 1, 1, 0], 
                   y: -200, 
                   x: cfg.x,
                   scale: [0.5, 1, 1, 0.5],
               }} 
               exit={{ opacity: 0, scale: 0 }} 
               transition={{ duration: cfg.duration, repeat: Infinity, delay: cfg.delay, ease: "linear" }} 
               className="absolute pointer-events-none select-none w-8 h-8 flex items-center justify-center"
               style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 178, 0.8))' }}
            >
                <img src={SVGS[cfg.iconIndex]} alt="particle" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
            </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
