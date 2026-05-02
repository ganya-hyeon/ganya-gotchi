'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TerminalFrame({ children, title }: { children: React.ReactNode, title?: string }) {
  return (
    <div className="relative w-full h-full p-4 md:p-8 flex flex-col overflow-hidden">
      {/* Outer Glow */}
      <div className="absolute inset-0 border-[20px] border-black z-50 pointer-events-none" />
      
      {/* CRT Overlay Elements */}
      <div className="crt-overlay" />
      <div className="crt-flicker" />
      <div className="scanline" />

      {/* Main Terminal Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 terminal-border bg-[#0a0c0b]/80 relative flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="h-10 border-b border-[#00FFB2]/30 flex items-center justify-between px-4 bg-[#00FFB2]/5">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-[#00FFB2]/50" />
            </div>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase opacity-50">
              {title || 'CORE_MANAGEMENT_SYSTEM_V2.14'}
            </span>
          </div>
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
            PORT: 3000 // ADMIN_SESSION: ACTIVE
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 font-mono custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        <div className="h-8 border-t border-[#00FFB2]/20 flex items-center justify-between px-4 bg-[#00FFB2]/5 text-[9px] uppercase tracking-widest opacity-40">
          <div>(C) 2026 GANYA_SYSTEMS_CORP</div>
          <div className="flex gap-4">
              <span>STATUS: NOMINAL</span>
              <span>Uptime: 00:24:12</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
