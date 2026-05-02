'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

const FOOD_POOL = [
  { id: 'f1', emoji: '🔍', name: 'UX Research', quest: { name: '카카오 인터랙션 디자인 개선', diff: '⭐⭐⭐⭐⭐', reward: '전환율 +20%', dialogs: ['문제를 발견했다! 사용자들이 핵심 버튼에서 이탈하고 있어…', 'C4D로 마이크로 인터랙션 재설계 완료!', '결과: 전환율 20% 상승. 데이터가 증명한다!'] } },
  { id: 'f2', emoji: '⚙️', name: 'Motion Logic', quest: { name: 'AI 기반 대시보드 설계', diff: '⭐⭐⭐⭐', reward: '생산성 3배 향상', dialogs: ['데이터를 줘… Gemini API 연결 시작.', '실시간 데이터 시각화 시스템 완료!', '이탈율 15% 감소. 최적화 성공.'] } },
  { id: 'f3', emoji: '📊', name: 'Behavior Data', quest: { name: '3D 모션 시스템 구축', diff: '⭐⭐⭐', reward: '브랜드 몰입감 강화', dialogs: ['이건 최적화할 수 있어. R3F 파이프라인 분석 중.', '60fps 3D 인터랙션 구현 완료!', '디자인 시스템 통합 성공.'] } },
];

interface Food {
  id: string;
  emoji: string;
  name: string;
  quest: {
    name: string;
    diff: string;
    reward: string;
    dialogs: string[];
  };
  key: number;
  x: number;
  y: number;
}

export default function FeedingSystem() {
  const [activeFoods, setActiveFoods] = useState<Food[]>([]);
  const { setFeedQuest, feedTrigger, setPriorityDialogue, activeTab } = useGameStore();

  useEffect(() => {
    if (activeTab !== 'FEED') {
      const reset = setTimeout(() => setActiveFoods([]), 0);
      return () => clearTimeout(reset);
    }
  }, [activeTab]);

  const spawnOne = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const food = FOOD_POOL[Math.floor(Math.random() * FOOD_POOL.length)];
    
    let x = 0, y = 0;
    let attempts = 0;
    
    // Attempt to find a position that doesn't overlap the bottom dialogue area or character too closely
    while (attempts < 30) {
      const angle = Math.random() * 2 * Math.PI;
      const dist = 220 + Math.random() * 180; // Expanded range (220px to 400px)
      x = centerX + Math.cos(angle) * dist - 32;
      y = centerY + Math.sin(angle) * dist - 32;
      
      // Safety check:
      // Avoid the bottom dialogue area (Bottom 350px of the screen if centered)
      const isInBottomDialogRange = y > window.innerHeight - 350 && Math.abs(x + 32 - centerX) < 400;
      
      // Keep it within window bounds
      const isOutOfBounds = x < 50 || x > window.innerWidth - 100 || y < 100 || y > window.innerHeight - 150;

      if (!isInBottomDialogRange && !isOutOfBounds) break;
      attempts++;
    }
    
    return {
      ...food,
      key: Math.random(),
      x,
      y,
    };
  };

  useEffect(() => {
    if (feedTrigger > 0) {
      const newFoods = Array.from({ length: 3 }).map(() => spawnOne());
      const timeout = setTimeout(() => setActiveFoods(prev => [...prev, ...newFoods]), 0);

      const timer = setTimeout(() => {
        setActiveFoods([]);
      }, 20000);

      return () => {
        clearTimeout(timeout);
        clearTimeout(timer);
      };
    }
  }, [feedTrigger]);

  const handleDragEnd = (_: unknown, info: { point: { x: number, y: number } }, food: Food) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const dist = Math.hypot(info.point.x - centerX, info.point.y - centerY);

    if (dist < 150) {
      setFeedQuest(food.quest);
      setPriorityDialogue("음 맛있다! 🐣");
      setTimeout(() => setPriorityDialogue(null), 2000);
      
      // Remove eaten and spawn a new one
      setActiveFoods(prev => [
          ...prev.filter(f => f.key !== food.key),
          spawnOne()
      ]);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {activeFoods.map((food) => (
          <motion.div
            key={food.key}
            drag
            dragSnapToOrigin
            onDragEnd={(e, info) => handleDragEnd(e, info, food)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.1 }}
            style={{ 
                left: food.x, 
                top: food.y,
                position: 'absolute'
            }}
            className="pointer-events-auto cursor-grab active:cursor-grabbing w-16 h-16 flex flex-col items-center justify-center hud-glass rounded-xl border-primary/20 hover:border-primary/60 transition-colors"
          >
            <span className="text-2xl mb-1">{food.emoji}</span>
            <span className="text-[7px] text-primary/60 font-mono uppercase font-bold text-center leading-tight">{food.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
