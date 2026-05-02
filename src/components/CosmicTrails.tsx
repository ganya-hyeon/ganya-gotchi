'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  life: number;
  opacity: number;
}

export default function CosmicTrails() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trackingX, trackingY, isTrackingActive } = useGameStore();
  const particlesRef = useRef<Particle[]>([]);
  const trailPointsRef = useRef<{x: number, y: number, life: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isTrackingActive) {
        // Update Trail Points
        trailPointsRef.current.push({ x: trackingX, y: trackingY, life: 1 });
        
        // Render Trail
        if (trailPointsRef.current.length > 1) {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          for (let i = 0; i < trailPointsRef.current.length; i++) {
            const p = trailPointsRef.current[i];
            const opacity = p.life * 0.6;
            ctx.strokeStyle = `rgba(0, 255, 178, ${opacity})`;
            
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
            
            p.life -= 0.05; // Fade out trail
          }
          ctx.stroke();
        }
        
        // Remove dead trail points
        trailPointsRef.current = trailPointsRef.current.filter(p => p.life > 0);

        // Emit new ambient particles
        if (Math.random() > 0.5) {
          particlesRef.current.push({
            x: trackingX,
            y: trackingY,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: '#00ffb2',
            life: 1,
            opacity: 1
          });
        }
      }

      // Update and Render Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.02;
        p.opacity = p.life;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [trackingX, trackingY, isTrackingActive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[150] pointer-events-none"
    />
  );
}
