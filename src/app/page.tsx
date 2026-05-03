'use client';

import HUD from "@/components/HUD";
import QuestLog from "@/components/QuestLog";
import PixelCharacter from "@/components/PixelCharacter";
import LoadingScreen from "@/components/LoadingScreen";
import DialogueBox from "@/components/DialogueBox";
import BehaviorObserver from "@/components/BehaviorObserver";
import FeedingSystem from "@/components/FeedingSystem";
import FeedQuestPopup from "@/components/FeedQuestPopup";
import StatusSystem from "@/components/StatusSystem";
import HandTrackingSystem from "@/components/HandTrackingSystem";
import HandCursor from "@/components/HandCursor";
import WorkWorld from "@/components/WorkWorld";
import LogsView from "@/components/LogsView";
import TutorialOverlay from "@/components/TutorialOverlay";
import SignalSystem from "@/components/SignalSystem";
import { useGameStore } from "@/store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const { level, isEvolving, triggerEvolution, trackingX, trackingY, activeTab, setPriorityDialogue, fetchProjects } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [evoStage, setEvoStage] = useState<'AWAKEN' | 'DETECT' | 'CONNECT' | 'IDLE'>('IDLE');

  // Check if hand tracking is active
  const isTrackingActive = trackingX !== 0 || trackingY !== 0;

  useEffect(() => {
    fetchProjects();
    // Track visitor - Disabled for static export compatibility
    // fetch('/api/analytics', { method: 'POST' }).catch(console.error);
  }, [fetchProjects]);

  useEffect(() => {
    if (isEvolving) {
      setTimeout(() => setEvoStage('AWAKEN'), 0);
      const t1 = setTimeout(() => setEvoStage('DETECT'), 1000);
      const t2 = setTimeout(() => setEvoStage('CONNECT'), 2000);
      const t3 = setTimeout(() => {
        setEvoStage('IDLE');
        triggerEvolution();
      }, 3000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isEvolving, triggerEvolution]);

  // Initial Greeting
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setPriorityDialogue("안녕 반가워! ◈");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, setPriorityDialogue]);

  return (
    <main className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background border-none outline-none ${ (isTrackingActive && !isLoading) ? 'cursor-none' : '' }`}>
      <BehaviorObserver />
      <FeedingSystem />
      <FeedQuestPopup />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />
        ) : (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            {/* Background Starfield / Grid Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <div className="absolute inset-0 opacity-20 will-change-[background-position]" 
                  style={{ 
                    backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    transform: 'translateZ(0)'
                  }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
            </div>

            {/* View Switcher */}
            <AnimatePresence mode="wait">
                {activeTab === 'WORK' ? (
                    <WorkWorld key="work" />
                ) : activeTab === 'LOGS' ? (
                    <LogsView key="logs" />
                ) : (
                    <motion.div 
                        key="character"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative z-10 flex flex-col items-center gap-12"
                    >
                      {/* Evolution Overlay Removed for Static Feeling */}

                      {/* Central Character (Ganya) Container */}
                      <motion.div 
                        className="relative"
                        animate={isEvolving ? { 
                          y: [0, -40, 0],
                        } : {}}
                        transition={{ duration: 3, ease: "easeInOut" }}
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -20, 0],
                            filter: level >= 2 
                              ? ['drop-shadow(0 0 20px #00FFB2)', 'drop-shadow(0 0 50px #00FFB2)']
                              : ['drop-shadow(0 0 10px var(--primary-glow))', 'drop-shadow(0 0 30px var(--primary-glow))']
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          className={`transition-all duration-1000 flex items-center justify-center relative will-change-transform ${
                            level >= 2 ? 'w-80 h-80' : 'w-64 h-64'
                          }`}
                          style={{ transform: 'translateZ(0)' }}
                        >
                          {/* The Animated Pixel Character */}
                          <PixelCharacter />
                        </motion.div>

                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                          <div className="text-primary font-mono text-[14px] opacity-50 uppercase tracking-widest">LV.{level}</div>
                          <div className="text-primary font-mono text-[16px] font-bold">{level === 1 ? 'STARTER' : 'EXPLORER'}</div>
                        </div>
                      </motion.div>

                      {/* Dialogue Box Area */}
                      <DialogueBox />

                      {/* Quest UI */}
                      <QuestLog />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Screen Layer */}
            <StatusSystem />

            {/* Hand Tracking UI Layer */}
            <HandTrackingSystem />

            {/* Hand Tracking Visual Feedback */}
            <HandCursor />
            <SignalSystem />

            {/* HUD Layer */}
            <HUD />

            {/* Tutorial Overlay */}
            <TutorialOverlay />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
