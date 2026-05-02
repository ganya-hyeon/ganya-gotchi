'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Battery, Wifi, Menu, Activity, User, Book, Briefcase, Heart, Rocket } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

export default function HUD() {
  const [currentTime, setCurrentTime] = React.useState<string>('0000.00.00 00:00:00');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Adjust to KST if needed, but Date() usually follows system time
      const formatted = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/(\d{4})\. (\d{2})\. (\d{2})\./, '$1.$2.$3');
      
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { activeTab, setActiveTab, triggerFeeding, setFeedQuest, setTutorialActive, setTutorialStep } = useGameStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 p-3 md:p-6 flex flex-col justify-between">
      {/* Top HUD Bar */}
      <div className="flex justify-between items-start pointer-events-none gap-2">
        <motion.div 
          animate={(activeTab === 'WORK' || activeTab === 'LOGS' || activeTab === 'STATUS') ? { x: -400, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="hud-glass p-2 md:p-4 rounded-xl flex items-center gap-3 md:gap-6 pointer-events-auto shrink min-w-0"
        >
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/40 shadow-[0_0_10px_var(--primary-glow)] shrink-0">
              <User className="text-primary w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-[8px] md:text-[10px] text-primary/60 font-bold uppercase tracking-widest leading-tight truncate">Subject_Profile</div>
              <div className="text-primary font-mono text-sm md:text-[22px] font-bold leading-tight">Ganya</div>
              <div className="text-[9px] md:text-[11px] text-primary/80 font-mono tracking-[0.15em] uppercase leading-tight mt-0.5 truncate">
                Product Designer · 3Y · Seoul
              </div>
              <div className="mt-1 hidden sm:flex flex-wrap gap-1">
                {['호기심 많음', '데이터 집착형', '성장 지향적'].map((trait, idx) => (
                  <span key={idx} className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1 py-0.5 rounded uppercase whitespace-nowrap">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-6 md:h-8 w-[1px] bg-primary/20 shrink-0" />
          
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className="text-[6px] md:text-[8px] text-primary/60 font-black uppercase tracking-[0.1em]">CORE STATUS</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 md:w-3.5 h-1 md:h-1.5 rounded-full relative overflow-hidden ${
                        i <= 4 
                        ? 'bg-primary shadow-[0_0_8px_rgba(0,255,178,0.4)]' 
                        : 'bg-primary/20'
                    }`}
                  >
                    {i <= 4 && (
                        <div className="absolute inset-0 opacity-20" style={{ 
                            backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.4) 50%)',
                            backgroundSize: '2px 100%'
                        }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] md:text-xs text-primary font-mono font-bold">80%</div>
          </div>
        </motion.div>

        <motion.div 
          animate={(activeTab === 'WORK' || activeTab === 'LOGS' || activeTab === 'STATUS') ? { x: 400, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="flex flex-col items-end gap-2 pointer-events-auto shrink-0"
        >
            <div className="hud-glass p-2 md:p-4 rounded-xl flex gap-3 md:gap-6 items-center">
                <div className="text-right">
                    <div className="text-[8px] md:text-[10px] text-primary/60 font-bold uppercase tracking-widest">SYSTEM TIME</div>
                    <div className="text-primary font-mono text-[10px] md:text-[14px] tabular-nums">{currentTime}</div>
                </div>
                <div className="flex gap-2 md:gap-3">
                    <Wifi className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                    <Battery className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                </div>
            </div>
        </motion.div>
      </div>

      {/* Side HUD - Stats / Logs */}
      <motion.div 
        animate={(activeTab === 'WORK' || activeTab === 'LOGS' || activeTab === 'STATUS') ? { x: -150, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-4 pointer-events-auto"
      >
        {[
          { icon: Activity, label: 'Pulse', action: () => {} },
          { icon: Heart, label: 'Status', action: () => setActiveTab('STATUS') },
          { icon: Terminal, label: 'Logs', action: () => setActiveTab('LOGS') },
        ].map((item, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.1, x: 5 }}
            onClick={item.action}
            className={`w-10 h-10 md:w-12 md:h-12 hud-glass rounded-lg flex items-center justify-center transition-colors group relative ${
              item.label === 'Status' && activeTab === 'STATUS' ? 'text-primary bg-primary/20 border-primary' : 'text-primary/60 hover:text-primary'
            }`}
          >
            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute left-12 md:left-14 hidden md:group-hover:block text-[10px] bg-primary text-black px-2 py-1 rounded font-bold whitespace-nowrap">
              {item.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom Navigation HUD */}
      <div className="flex justify-center pointer-events-auto pb-2 md:pb-0">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hud-glass p-1.5 md:p-2 rounded-2xl flex items-center gap-1 md:gap-2 overflow-x-auto max-w-full"
        >
          <NavButton 
            icon={Book} 
            label="Quest Log" 
            active={activeTab === 'QUEST_LOG'} 
            onClick={() => {
                setActiveTab('QUEST_LOG');
                setFeedQuest(null);
            }}
          />
          <NavButton 
            icon={Briefcase} 
            label="Work" 
            active={activeTab === 'WORK'} 
            onClick={() => {
                setActiveTab('WORK');
                setFeedQuest(null);
            }}
          />
          <NavButton 
            icon={Activity} 
            label="Feed" 
            active={activeTab === 'FEED'} 
            onClick={() => {
                setActiveTab('FEED');
                triggerFeeding();
                setFeedQuest(null);
            }}
          />
          <div className="w-[1px] h-6 bg-primary/20 mx-1" />
          <NavButton 
            icon={Menu} 
            label="Menu" 
            active={activeTab === 'MENU'} 
            onClick={() => {
                setActiveTab('MENU');
                setFeedQuest(null);
            }}
          />
        </motion.div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-10 md:w-20 h-10 md:h-20 border-t-2 border-l-2 border-primary/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-10 md:w-20 h-10 md:h-20 border-t-2 border-r-2 border-primary/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-10 md:w-20 h-10 md:h-20 border-b-2 border-l-2 border-primary/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-10 md:w-20 h-10 md:h-20 border-b-2 border-r-2 border-primary/20 pointer-events-none" />
    </div>
  );
}

function NavButton({ icon: Icon, label, active = false, onClick }: { icon: React.ElementType, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all group ${
        active ? 'bg-primary text-black' : 'text-primary/60 hover:text-primary hover:bg-primary/10'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-primary'}`} />
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </motion.button>
  );
}

