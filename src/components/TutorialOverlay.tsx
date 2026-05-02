'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Stars, Sparkles, Hand, Target, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

interface DataPoint {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export default function TutorialOverlay() {
  const { 
    isTutorialActive, 
    tutorialStep, 
    setTutorialStep, 
    setTutorialActive,
    trackingX,
    trackingY,
    isPetting,
    isPinching,
    setActiveTab
  } = useGameStore();

  const [phase, setPhase] = useState<'EXPLAIN' | 'INTERACT'>('EXPLAIN');
  const [showSuccess, setShowSuccess] = useState(false);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { id: 1, x: 20, y: 30, collected: false },
    { id: 2, x: 80, y: 40, collected: false },
    { id: 3, x: 50, y: 70, collected: false },
  ]);
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Spotlight config
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, radius: 0, opacity: 0 });

  // Handle Phase Transitions
  useEffect(() => {
    if (!isTutorialActive) return;

    if (phase === 'EXPLAIN') {
      setTimeLeft(5);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (tutorialStep === 4) {
              // Final step exit logic is handled by a separate effect
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            advanceToInteract();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, tutorialStep, isTutorialActive]);

  // Handle final exit with slide-up effect
  useEffect(() => {
    if (isTutorialActive && tutorialStep === 4) {
      const timer = setTimeout(() => {
        setTutorialActive(false);
        setTutorialStep(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isTutorialActive, tutorialStep, setTutorialActive, setTutorialStep]);

  const advanceToInteract = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Page transitions based on step - wrapped in setTimeout to prevent render cycle conflicts
    setTimeout(() => {
      if (tutorialStep === 3) {
        setActiveTab('QUEST_LOG');
      } else {
        setActiveTab('WORK');
      }
    }, 0);
    
    setPhase('INTERACT');
  };

  // Update spotlight based on phase and step
  useEffect(() => {
    if (!isTutorialActive) return;

    if (phase === 'EXPLAIN') {
      setSpotlight({ x: 50, y: 50, radius: 0, opacity: 0.8 }); // Dim all for explanation
      return;
    }

    switch (tutorialStep) {
      case 0: // Start Button
        setSpotlight({ x: 85, y: 15, radius: 100, opacity: 0.8 });
        break;
      case 1: // Tracking
        setSpotlight({ x: 50, y: 50, radius: 0, opacity: 0 });
        break;
      case 2: // Pinch
        setSpotlight({ x: 50, y: 50, radius: 120, opacity: 0.8 });
        break;
      case 3: // Petting
        setSpotlight({ x: 50, y: 50, radius: 200, opacity: 0.8 });
        break;
      default:
        setSpotlight({ x: 50, y: 50, radius: 0, opacity: 0 });
    }
  }, [tutorialStep, phase, isTutorialActive]);

  // Interaction Logic
  useEffect(() => {
    if (!isTutorialActive || phase === 'EXPLAIN') return;

    if (tutorialStep === 1) {
      const tx = (trackingX / window.innerWidth) * 100;
      const ty = (trackingY / window.innerHeight) * 100;
      const updatedPoints = dataPoints.map(p => {
        if (!p.collected) {
          const dist = Math.sqrt(Math.pow(tx - p.x, 2) + Math.pow(ty - p.y, 2));
          if (dist < 5) return { ...p, collected: true };
        }
        return p;
      });

      if (updatedPoints.some((p, i) => p.collected !== dataPoints[i].collected)) {
        setDataPoints(updatedPoints);
        if (updatedPoints.every(p => p.collected)) {
          triggerSuccess(() => {
            setTutorialStep(2);
            setPhase('EXPLAIN');
          });
        }
      }
    }

    if (tutorialStep === 2 && isPinching) {
      triggerSuccess(() => {
        setTutorialStep(3);
        setPhase('EXPLAIN');
      });
    }

    if (tutorialStep === 3 && isPetting) {
      triggerSuccess(() => {
        setTutorialStep(4);
        setPhase('EXPLAIN');
      });
    }
  }, [trackingX, trackingY, tutorialStep, isTutorialActive, dataPoints, isPinching, isPetting, phase]);

  const triggerSuccess = (callback: () => void) => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      callback();
    }, 1500);
  };

  if (!isTutorialActive) return null;

  const stepContents = [
    { title: '시각 센서 활성화', desc: '먼저 함선의 시각 센서(카메라)를 활성화하여 가냐의 세계에 접속해야 합니다. 우측 상단의 버튼을 눌러주세요.' },
    { title: '데이터 수집 (이동)', desc: '검지 손가락 끝으로 화면의 에테르 데이터를 터치하여 수집하십시오. 당신의 움직임이 시스템에 기록됩니다.' },
    { title: '시스템 실행 (클릭)', desc: '검지와 엄지를 가볍게 맞잡는 [핀치] 제스처로 중앙의 코어를 클릭하여 명령을 실행하십시오.' },
    { title: '가냐와 교감하기', desc: '이제 퀘스트 페이지로 이동했습니다. 가냐를 부드럽게 쓰다듬어(Swipe) 우호도를 높이고 교감을 완료하세요.' },
    { title: '시스템 훈련 완료', desc: '축하합니다! 당신은 이제 정식 네비게이터로서 모든 권한을 획득했습니다. 여행을 시작하세요!' }
  ];

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Spotlight Mask */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-1000"
        style={{ 
          opacity: spotlight.opacity,
          maskImage: spotlight.radius > 0 
            ? `radial-gradient(circle ${spotlight.radius}px at ${spotlight.x}% ${spotlight.y}%, transparent 100%, black 100%)`
            : 'none',
          WebkitMaskImage: spotlight.radius > 0 
            ? `radial-gradient(circle ${spotlight.radius}px at ${spotlight.x}% ${spotlight.y}%, transparent 100%, black 100%)`
            : 'none'
        }}
      />

      <AnimatePresence>
        {isTutorialActive && (
          <div className="absolute inset-0">
            {/* Guidance Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-32 flex items-center justify-center px-6 pointer-events-auto">
              <motion.div 
                  initial={{ y: -100 }} 
                  animate={{ y: 0 }}
                  exit={{ y: -300, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "anticipate" }}
                  className="w-full max-w-2xl bg-black/80 backdrop-blur-xl border-x border-b border-primary/20 rounded-b-2xl p-6 relative overflow-hidden"
              >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                  <div className="flex justify-between items-start gap-6">
                      <div>
                          <div className="flex items-center gap-2 text-primary/40 font-mono text-[10px] uppercase tracking-[0.3em] mb-1">
                              <AlertCircle className="w-3 h-3" />
                              MISSION_STEP {tutorialStep + 1}
                          </div>
                          <h2 className="text-primary font-black text-xl md:text-2xl tracking-tighter uppercase italic">{stepContents[tutorialStep]?.title}</h2>
                          <p className="text-primary/60 font-mono text-xs mt-2 max-w-lg leading-relaxed">{stepContents[tutorialStep]?.desc}</p>
                      </div>
                      
                      {phase === 'EXPLAIN' && tutorialStep < 4 && (
                          <button 
                              onClick={advanceToInteract}
                              className="flex flex-col items-center gap-2 group"
                          >
                              <div className="relative w-12 h-12 flex items-center justify-center">
                                  <svg className="w-full h-full -rotate-90">
                                      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/20" />
                                      <motion.circle 
                                          cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"
                                          initial={{ pathLength: 1 }} animate={{ pathLength: 0 }} transition={{ duration: 5, ease: "linear" }}
                                      />
                                  </svg>
                                  <span className="absolute text-primary font-bold text-xs">{timeLeft}</span>
                              </div>
                              <span className="text-primary/40 font-mono text-[9px] uppercase tracking-widest group-hover:text-primary transition-colors flex items-center gap-1">
                                  SKIP <ChevronRight className="w-3 h-3" />
                              </span>
                          </button>
                      )}
                  </div>
              </motion.div>
            </div>

            {/* Final Completion View */}
            {tutorialStep === 4 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ y: -500, opacity: 0 }}
                transition={{ duration: 0.8, ease: "anticipate" }}
                className="absolute inset-0 flex items-center justify-center flex-col gap-6"
              >
                <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
                    />
                    <CheckCircle2 className="text-primary w-32 h-32 relative z-10" />
                </div>
                <div className="text-center space-y-2 relative z-10">
                  <h1 className="text-primary font-black text-6xl italic uppercase tracking-tighter">훈련 완료</h1>
                  <p className="text-primary/60 font-mono text-sm tracking-widest uppercase">System Synchronization Complete</p>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {phase === 'INTERACT' && (
                  <motion.div key="interact-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                      {tutorialStep === 1 && dataPoints.map(p => !p.collected && (
                          <motion.div key={`point-${p.id}`} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute w-12 h-12" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}>
                              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                              <Target className="text-primary w-6 h-6 animate-pulse" />
                          </motion.div>
                      ))}
                      {tutorialStep === 2 && (
                          <div key="pinch-target" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-primary/20 rounded-full flex items-center justify-center">
                               <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20" />
                               <Hand className="text-primary w-12 h-12 animate-bounce" />
                          </div>
                      )}
                  </motion.div>
              )}

              {showSuccess && (
                <motion.div key="success-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-[400] pointer-events-none">
                  <motion.div key="success-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                  <motion.div key="success-content" initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 relative z-10">
                      <CheckCircle2 className="text-primary w-20 h-20" />
                      <h3 className="text-primary font-black text-4xl italic uppercase">MISSION CLEAR!</h3>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {tutorialStep < 4 && (
              <button 
                onClick={() => { setTutorialActive(false); setTutorialStep(0); }} 
                className="absolute bottom-[88px] left-1/2 -translate-x-1/2 text-primary/40 hover:text-primary font-mono text-[10px] uppercase tracking-[0.5em] pointer-events-auto transition-all py-2 border-b border-transparent hover:border-primary/20"
              >
                [ SKIP_TRAINING ]
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
