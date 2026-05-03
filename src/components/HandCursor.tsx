'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

export default function HandCursor() {
  const { 
    trackingX, trackingY, isPinching, isHovering, isTrackingLoading, 
    isTrackingActive, setTrackingCoords, setHovering 
  } = useGameStore();
  const [trail, setTrail] = React.useState<{x: number, y: number}[]>([]);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse fallback for coordination and testing
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // On mobile, don't update coords via mousemove unless we want touch to drive it
      // But we use pointerEvents on PixelCharacter for direct interaction
      if (isMobile && !isTrackingActive) return;

      setTrackingCoords(e.clientX, e.clientY);
      
      const targetEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      const isOverUI = !!(targetEl && (
        targetEl.tagName === 'BUTTON' || 
        targetEl.tagName === 'A' || 
        window.getComputedStyle(targetEl).cursor === 'pointer' ||
        targetEl.closest('button') ||
        targetEl.closest('a')
      ));
      setHovering(isOverUI);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [setTrackingCoords, setHovering, isMobile, isTrackingActive]);

  React.useEffect(() => {
    if (trackingX !== 0 || trackingY !== 0) {
      setTimeout(() => {
        setTrail(prev => [{ x: trackingX, y: trackingY }, ...prev].slice(0, 3));
      }, 0);
    }
  }, [trackingX, trackingY]);

  // Hide cursor on mobile if tracking is not active
  if (isMobile && !isTrackingActive && !isTrackingLoading) return null;
  
  if (trackingX === 0 && trackingY === 0 && !isTrackingLoading) return null;

  const cursorState = isTrackingLoading ? 'loading' : (isPinching ? 'click' : (isHovering ? 'hover' : 'default'));
  
  const MAIN_NEON = '#02FAB3';

  return (
    <>
      {/* Motion Trail */}
      {trail.map((pos, i) => (
        i > 0 && (
          <div 
            key={i}
            className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-primary/5"
            style={{ 
              width: `${20 - i * 4}px`, height: `${20 - i * 4}px`,
              left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)',
              opacity: 0.2 / i, borderColor: MAIN_NEON
            }}
          />
        )
      ))}

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        animate={{ x: trackingX, y: trackingY }}
        transition={{ type: 'spring', damping: 40, stiffness: 1000, mass: 0.02 }}
      >
        <div className="relative flex items-center justify-center pointer-events-none" style={{ width: '80px', height: '80px', transform: 'translate(-50%, -50%)' }}>
          
          <motion.div 
            initial={false}
            animate={{ 
                scale: cursorState === 'hover' ? 0.28 : 0.22, // Precisely 20%+ expansion
                rotate: cursorState === 'loading' ? 360 : 0
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 400 }}
            className="relative"
          >
            {/* SVG implementation with Enhanced Hover Visuals */}
            <svg width="239" height="239" viewBox="0 0 239 239" fill="none" xmlns="http://www.w3.org/2000/svg" 
              style={{ 
                filter: cursorState === 'hover' 
                  ? `drop-shadow(0 0 15px ${MAIN_NEON}) brightness(1.2)` 
                  : `drop-shadow(0 0 8px ${MAIN_NEON}66)` 
              }}
            >
                <defs>
                    <radialGradient id="hoverGradient" cx="119.5" cy="119.5" r="118.5" gradientUnits="userSpaceOnUse">
                        <stop offset="0.6" stopColor={MAIN_NEON} stopOpacity="0"/>
                        <stop offset="1" stopColor={MAIN_NEON} stopOpacity={cursorState === 'hover' ? 0.6 : 0}/>
                    </radialGradient>
                </defs>

                {/* Outer Glow Ring (Visible on Hover) */}
                <circle 
                    cx="119.5" cy="119.5" r="118.5" 
                    fill="url(#hoverGradient)" 
                    stroke={MAIN_NEON} 
                    strokeWidth={cursorState === 'hover' ? 3 : 2}
                    opacity={cursorState === 'hover' ? 1 : 0.3}
                />

                <circle cx="119.5" cy="119.5" r="89.5" stroke={MAIN_NEON} strokeWidth="4"/>
                <circle opacity="0.3" cx="119.5" cy="119.5" r="48.5" stroke={MAIN_NEON} strokeWidth="2"/>
                <circle cx="119.5" cy="119.5" r="15.5" fill={MAIN_NEON} style={{ filter: cursorState === 'hover' ? 'blur(2px)' : 'none' }}/>
                
                <rect x="116" y="65" width="4" height="12" fill={MAIN_NEON}/>
                <rect x="116" y="31" width="4" height="18" fill={MAIN_NEON}/>
                <rect x="116" y="191" width="4" height="18" fill={MAIN_NEON}/>
                <rect x="30" y="122" width="4" height="18" transform="rotate(-90 30 122)" fill={MAIN_NEON}/>
                <rect x="191" y="122" width="4" height="18" transform="rotate(-90 191 122)" fill={MAIN_NEON}/>
                <rect x="116" y="162" width="4" height="12" fill={MAIN_NEON}/>
                <rect x="65" y="122" width="4" height="12" transform="rotate(-90 65 122)" fill={MAIN_NEON}/>
                <rect x="162" y="122" width="4" height="12" transform="rotate(-90 162 122)" fill={MAIN_NEON}/>
                
                <path d="M118 2L130.99 14H105.01L118 2Z" fill={MAIN_NEON}/>
                <path d="M118 237L130.99 225H105.01L118 237Z" fill={MAIN_NEON}/>
                <path d="M2 119.5L14 106.51L14 132.49L2 119.5Z" fill={MAIN_NEON}/>
                <path d="M236.5 119.5L224.5 106.51L224.5 132.49L236.5 119.5Z" fill={MAIN_NEON}/>
            </svg>
          </motion.div>

          {/* Interaction Overlays */}
          <AnimatePresence>
            {cursorState === 'hover' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-[-15px] pointer-events-none"
              >
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-[3px] border-l-[3px]" style={{ borderColor: MAIN_NEON }} />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-[3px] border-r-[3px]" style={{ borderColor: MAIN_NEON }} />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[3px] border-l-[3px]" style={{ borderColor: MAIN_NEON }} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[3px] border-r-[3px]" style={{ borderColor: MAIN_NEON }} />
              </motion.div>
            )}

            {cursorState === 'click' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute w-full h-full border-[2px] rounded-full"
                style={{ borderColor: MAIN_NEON }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}



