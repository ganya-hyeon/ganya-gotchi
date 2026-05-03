'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function BehaviorObserver() {
  const { setPriorityDialogue, setTrackingCoords } = useGameStore();
  
  const clickCount = useRef(0);
  const lastActive = useRef(0);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    lastActive.current = Date.now();
    const handleAction = (e?: MouseEvent) => {
      lastActive.current = Date.now();
      
      if (e) {
        setTrackingCoords(e.clientX, e.clientY);
      }

      // Clear idle warning
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      
      // If the current priority dialogue is the idle message, clear it immediately upon action
      useGameStore.getState().setPriorityDialogue(null);
      
      idleTimeout.current = setTimeout(() => {
        setPriorityDialogue("지루해... ◈");
        setTimeout(() => setPriorityDialogue(null), 3000);
      }, 180000); // 3 minutes
    };

    const handleClick = () => {
      handleAction();
      clickCount.current += 1;

      if (clickCount.current >= 5) {
        setPriorityDialogue("신나!!");
        clickCount.current = 0;
        setTimeout(() => setPriorityDialogue(null), 2000);
      }

      if (clickTimeout.current) clearTimeout(clickTimeout.current);
      clickTimeout.current = setTimeout(() => {
        clickCount.current = 0;
      }, 1000);
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('mousemove', (e) => handleAction(e));
    
    // Initial idle setup removed to avoid "default" idle message
    // handleAction();

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('mousemove', (e) => handleAction(e));
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [setPriorityDialogue, setTrackingCoords]);

  return null;
}
