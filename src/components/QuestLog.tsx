'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { ChevronRight, CheckCircle } from 'lucide-react';

export default function QuestLog() {
  const { activeQuest, setActiveQuest, completeProject } = useGameStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Reset step when activeQuest changes using a small delay to avoid sync render loop warnings
    const timeout = setTimeout(() => setCurrentStep(0), 0);
    return () => clearTimeout(timeout);
  }, [activeQuest?.id]);

  if (!activeQuest) return null;

  // Construct a story array from the project's description and outcomes
  const story = [
    activeQuest.desc.background,
    activeQuest.desc.thinking,
    activeQuest.desc.challenge,
    ...activeQuest.outcomes
  ].filter(Boolean);

  const isLastStep = currentStep === story.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (activeQuest.status !== 'done') {
        completeProject(activeQuest.id);
      }
      setActiveQuest(null);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm pointer-events-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="hud-glass w-full max-w-lg rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary/10 px-6 py-3 border-b border-primary/20 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Active Quest</span>
            <span className="text-primary font-mono font-bold tracking-tight">{activeQuest.name}</span>
          </div>
          <button 
            onClick={() => setActiveQuest(null)}
            className="text-primary/40 hover:text-primary"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[200px] flex flex-col justify-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="text-primary/90 font-mono text-lg leading-relaxed text-center italic"
            >
              &quot;{story[currentStep]}&quot;
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {story.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-primary' : 'bg-primary/20'}`} 
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-8 py-3 bg-primary text-black font-bold rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_var(--primary-glow)] transition-all"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>COMPLETE QUEST</span>
                </>
              ) : (
                <>
                  <span>NEXT LOG</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2 bg-black/20 text-[9px] text-primary/30 font-mono uppercase tracking-[0.3em] flex justify-between">
          <span>LOG_ID: {activeQuest.id}_SEQ_{currentStep}</span>
          <span>SYSTEM_READY</span>
        </div>
      </motion.div>
    </div>
  );
}
