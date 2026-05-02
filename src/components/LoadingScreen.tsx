'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  'Booting Ganya-Gotchi OS...',
  'Establishing neural link...',
  'Loading personality subroutines...',
  'Connecting to data cluster...',
  'Syncing visual sensors...',
  'System ready.'
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !isReady) {
      setIsReady(true);
    }
  }, [progress, isReady]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogs(prev => {
        if (prev.length < LOADING_MESSAGES.length) {
          return [...prev, LOADING_MESSAGES[prev.length]];
        }
        clearInterval(logInterval);
        return prev;
      });
    }, 150);
    return () => clearInterval(logInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-background flex flex-col items-center justify-center p-6 select-none cursor-crosshair">
      <div className="max-w-md w-full">
        {/* Terminal Header */}
        <div className="mb-12 font-mono">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-4 flex justify-between"
            >
                <span>SYS_BOOT_INIT</span>
                <span>V.1.0.42</span>
            </motion.div>
            
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-primary/80 text-xs flex gap-2"
                    >
                        <span className="text-primary/40">[{i}]</span>
                        <span>{log}</span>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-4">
            <div className="flex justify-between items-end font-mono">
                <span className="text-primary/60 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary animate-pulse rounded-full" />
                  Initialization
                </span>
                <span className="text-primary font-bold text-3xl tracking-tighter tabular-nums text-neon">
                  {Math.min(progress, 100)}<span className="text-sm ml-1 opacity-50">%</span>
                </span>
            </div>
            
            {/* Outer Track */}
            <div className="w-full h-4 bg-primary/5 rounded-sm overflow-hidden border border-primary/20 relative">
                {/* Background Grid for the bar */}
                <div className="absolute inset-0 opacity-20" 
                     style={{ 
                         backgroundImage: `linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                         backgroundSize: '10% 100%' 
                     }} 
                />
                
                {/* Filling Bar */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className="h-full bg-primary relative shadow-[0_0_20px_#00FFB2]"
                >
                  {/* Highlight on top of the bar */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
                  
                  {/* Pixel blocks on the edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 shadow-[0_0_10px_#FFF]" />
                </motion.div>
            </div>
            
            {/* Sub-label */}
            <div className="flex justify-between font-mono text-[8px] text-primary/40 uppercase tracking-[0.2em]">
              <span>Memory_Alloc: OK</span>
              <span>Buffer_Stream: ACTIVE</span>
            </div>
        </div>

        {/* Wake Up Button */}
        <div className="mt-16 flex justify-center h-20">
            <AnimatePresence>
                {isReady && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px #00FFB2' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onComplete}
                        className="px-12 py-4 bg-primary text-black font-mono font-black text-lg rounded-full tracking-[0.2em] uppercase transition-all"
                    >
                        Wake Up Ganya
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
               backgroundImage: `linear-gradient(var(--hud-border) 1px, transparent 1px), linear-gradient(90deg, var(--hud-border) 1px, transparent 1px)`,
               backgroundSize: '100px 100px' 
           }} 
      />
    </div>
  );
}
