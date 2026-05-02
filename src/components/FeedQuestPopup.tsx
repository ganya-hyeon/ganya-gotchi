'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { X, ChevronRight } from 'lucide-react';

export default function FeedQuestPopup() {
  const { activeFeedQuest, setFeedQuest } = useGameStore();
  const [dialogIdx, setDialogIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (activeFeedQuest) {
      const reset = setTimeout(() => {
        setDialogIdx(0);
        setDisplayText("");
      }, 0);
      return () => clearTimeout(reset);
    }
  }, [activeFeedQuest]);

  useEffect(() => {
    if (!activeFeedQuest) return;

    const fullText = activeFeedQuest.dialogs[dialogIdx];
    if (displayText.length < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    } else if (dialogIdx < activeFeedQuest.dialogs.length - 1) {
      const pause = setTimeout(() => {
        setDialogIdx(prev => prev + 1);
        setDisplayText("");
      }, 2500);
      return () => clearTimeout(pause);
    }
  }, [displayText, dialogIdx, activeFeedQuest]);

  if (!activeFeedQuest) return null;

  return (
    <div className="fixed right-10 top-1/2 -translate-y-1/2 z-[200] pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        className="w-[336px] bg-black/90 border border-primary/30 p-6 relative overflow-hidden"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] bg-primary/10 border border-primary/20 px-2 py-0.5 text-primary/60 font-mono tracking-widest">QUEST_UNLOCKED</span>
          <button onClick={() => setFeedQuest(null)} className="text-primary/40 hover:text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quest Info */}
        <h3 className="text-primary font-mono font-bold text-[14px] uppercase tracking-tight mb-4 leading-relaxed">
          {activeFeedQuest.name}
        </h3>

        <div className="space-y-2 mb-6 border-b border-primary/10 pb-4">
          <div className="flex gap-4 items-baseline">
            <span className="text-[10px] text-primary/30 font-mono w-20 uppercase">Difficulty</span>
            <span className="text-primary/70 text-[12px]">{activeFeedQuest.diff}</span>
          </div>
          <div className="flex gap-4 items-baseline">
            <span className="text-[10px] text-primary/30 font-mono w-20 uppercase">Reward</span>
            <span className="text-primary/70 text-[12px]">{activeFeedQuest.reward}</span>
          </div>
        </div>

        {/* Process Section */}
        <div className="space-y-4">
          <div className="text-[10px] text-primary/30 font-mono uppercase tracking-[0.2em]">Process ──────</div>
          
          <div className="bg-primary/5 border border-primary/10 p-3 min-h-[80px] relative">
            <div className="absolute -left-1 top-2 text-primary/20 text-[10px]">▶</div>
            <p className="text-primary font-mono text-[12px] leading-relaxed italic">
              &quot;{displayText}&quot;
              <span className="inline-block w-1.5 h-3 ml-1 bg-primary animate-pulse" />
            </p>
          </div>

          <div className="flex justify-between items-center mt-4">
               <span className="text-[10px] text-primary/30 font-mono uppercase tracking-widest">{dialogIdx + 1} / {activeFeedQuest.dialogs.length}</span>
               <button 
                onClick={() => { alert(`Navigating to project: ${activeFeedQuest.name}`); setFeedQuest(null); }}
                className="flex items-center gap-1.5 text-primary/60 hover:text-primary font-mono text-[11px] uppercase tracking-widest transition-all hover:translate-x-1"
               >
                 View More <ChevronRight className="w-3 h-3" />
               </button>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/20" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/20" />
      </motion.div>
    </div>
  );
}
