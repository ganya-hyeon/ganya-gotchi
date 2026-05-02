'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

const messages = [
  "데이터 집착형 모드 활성화. 패턴 분석 중...",
  "성장 지향적 사고 회로 가동. 신규 프로젝트 탐색.",
  "신규 인터페이스 설계 완료. 시스템 최적화 실행.",
  "새로운 지식을 습득했습니다! 가냐 코어 업그레이드."
];

export default function DialogueBox() {
  const priorityDialogue = useGameStore((state) => state.priorityDialogue);
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Handle priorities or normal typing loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentTarget = priorityDialogue || messages[index];
    
    if (isTyping) {
      if (displayText.length < currentTarget.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, 50);
      } else {
        // If it was a priority dialogue, we don't loop it, we wait for it to be cleared
        if (priorityDialogue) {
            const stop = setTimeout(() => setIsTyping(false), 0);
            return () => clearTimeout(stop);
        } else {
            setTimeout(() => setIsTyping(false), 0);
            timeout = setTimeout(() => {
              setIsTyping(true);
              setIndex((prev) => (prev + 1) % messages.length);
              setDisplayText("");
            }, 3000);
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, index, isTyping, priorityDialogue]);

  // Special effect: Reset typing when priorityDialogue changes
  useEffect(() => {
    if (priorityDialogue) {
       const reset = setTimeout(() => {
           setDisplayText("");
           setIsTyping(true);
       }, 0);
       return () => clearTimeout(reset);
    }
  }, [priorityDialogue]);

  return (
    <div className="w-full max-w-lg mt-16 px-4">
      <div className="relative p-6 bg-black/80 border border-primary/40 rounded-sm shadow-[0_0_20px_rgba(0,255,178,0.1)] overflow-hidden group">
        {/* Header decoration */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-primary font-bold tracking-[0.2em] font-mono">GANYA</span>
          <div className="h-[1px] flex-1 bg-primary/30" />
        </div>

        {/* Text Area */}
        <div className="min-h-[60px] flex items-start">
          <p className="text-primary font-mono text-base leading-relaxed tracking-wide">
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-2.5 h-5 ml-1 bg-primary align-middle"
            />
          </p>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />
      </div>
    </div>
  );
}
