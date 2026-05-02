'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Download, Send, ChevronRight, Terminal } from 'lucide-react';

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

export default function SignalSystem() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'MENU' | 'ROLE' | 'MESSAGE'>('MENU');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const addLog = (log: string) => {
    setLogs(prev => [...prev.slice(-3), log]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep('MENU');
    setSelectedRole(null);
    setLogs(['> establishing connection...', '> channel open']);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsTransmitting(true);
    addLog(`> role: ${selectedRole}`);
    addLog('> sending signal...');
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, content: message }),
      });

      if (response.ok) {
        addLog('> transmission complete');
        setTimeout(() => {
          setIsOpen(false);
          setMessage('');
          setSelectedRole(null);
          setIsTransmitting(false);
        }, 1500);
      } else {
        addLog('> error: signal lost');
        setIsTransmitting(false);
      }
    } catch (error) {
      addLog('> error: network failure');
      setIsTransmitting(false);
    }
  };

  const roles = [
    'UI/UX Designer',
    '2D Motion Designer',
    '3D Designer'
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4 pointer-events-none">
      {/* 2. Hover Interaction Label */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute bottom-full mb-4 right-0"
          >
            <div className="px-4 py-2 bg-black/80 backdrop-blur-xl border border-primary/40 rounded-lg shadow-[0_0_20px_rgba(0,255,178,0.2)]">
              <div className="text-[10px] font-mono font-black text-primary tracking-[0.2em] uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
                <TypewriterText text="SEND SIGNAL" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Icon (Fixed Bottom Right) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpen}
        className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center pointer-events-auto group"
      >
        {/* Signal Waves */}
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border border-primary rounded-full"
        />
        
        {/* Pixel Planet Icon */}
        <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(0,255,178,0.5)]">
          <svg viewBox="0 0 32 32" className="w-10 h-10 md:w-12 md:h-12 fill-primary group-hover:scale-110 transition-transform">
            <circle cx="16" cy="16" r="7" fill="currentColor" fillOpacity="0.2" />
            <path d="M13 13h6v6h-6z" fill="currentColor" fillOpacity="0.5" />
            <path d="M15 15h2v2h-2z" fill="currentColor" />
            <path d="M4 22l4 4M24 6l4 4M8 18l16-12M6 24l22-18" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6" fill="none" />
            <rect x="24" y="10" width="2" height="2" fill="currentColor" className="animate-pulse" />
            <rect x="8" y="22" width="1" height="1" fill="currentColor" />
          </svg>
        </div>

        {/* Orbiting Satellite */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-4px]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#00FFB2]" />
        </motion.div>
      </motion.button>

      {/* 3. Signal Interface Panel (Popup) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full mb-6 right-0 w-72 md:w-80 pointer-events-auto"
          >
            <div className="bg-black/90 backdrop-blur-2xl border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,255,178,0.1)]">
              {/* Header */}
              <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-mono font-bold text-primary tracking-[0.2em] uppercase">Signal Interface</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-primary/40 hover:text-primary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Interaction Logs */}
              <div className="px-4 py-2 bg-black/50 border-b border-primary/10 min-h-[60px]">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] font-mono text-primary/60">
                    <TypewriterText text={log} delay={i * 500} />
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div className="p-4">
                {step === 'MENU' ? (
                  <div className="flex flex-col gap-2">
                    <MenuButton 
                      icon={<ExternalLink className="w-4 h-4" />} 
                      text="1. View Work" 
                      onClick={() => window.open('https://behance.net', '_blank')}
                    />
                    <MenuButton 
                      icon={<Download className="w-4 h-4" />} 
                      text="2. PDF Download" 
                      onClick={() => window.open('/portfolio.pdf', '_blank')}
                    />
                    <MenuButton 
                      icon={<Send className="w-4 h-4" />} 
                      text="3. Send Message" 
                      onClick={() => setStep('ROLE')}
                    />
                  </div>
                ) : step === 'ROLE' ? (
                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] font-mono text-primary/40 uppercase tracking-widest mb-1">{'> select position:'}</div>
                    <div className="grid grid-cols-1 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setSelectedRole(role);
                            setStep('MESSAGE');
                            addLog(`> selected: ${role}`);
                          }}
                          className="w-full text-left p-3 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/40 rounded-lg transition-all group flex items-center justify-between"
                        >
                          <span className="text-[10px] font-mono text-primary group-hover:translate-x-1 transition-transform uppercase tracking-wider">{role}</span>
                          <ChevronRight className="w-3 h-3 text-primary/20 group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setStep('MENU')}
                      className="mt-2 py-2 text-[10px] font-mono text-primary/40 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                      [ cancel ]
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">
                        {`> position: ${selectedRole}`}
                      </span>
                      <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">{'> message:'}</span>
                      <textarea
                        autoFocus
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-24 bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs font-mono text-primary focus:outline-none focus:border-primary/50 transition-all resize-none"
                        placeholder="Type your signal here..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setStep('ROLE')}
                        className="flex-1 py-2 rounded-lg border border-primary/10 text-primary/40 text-[10px] font-mono uppercase tracking-widest hover:bg-primary/5 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        disabled={isTransmitting || !message.trim()}
                        onClick={handleSendMessage}
                        className="flex-[2] py-2 bg-primary/20 hover:bg-primary/30 disabled:opacity-50 rounded-lg border border-primary/40 text-primary text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        {isTransmitting ? 'Transmitting...' : 'Transmit Signal'}
                        {!isTransmitting && <Send className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>


              {/* Status Bar */}
              <div className="px-4 py-2 bg-primary/5 flex items-center justify-between border-t border-primary/10">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-primary/40 uppercase">Connection Stable</span>
                </div>
                <span className="text-[8px] font-mono text-primary/40">V 2.0.4</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 rounded-lg transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="text-primary/40 group-hover:text-primary transition-colors">
          {icon}
        </div>
        <span className="text-[11px] font-mono text-primary/80 group-hover:text-primary transition-colors uppercase tracking-wider">{text}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-primary/20 group-hover:text-primary/60 transition-all translate-x-0 group-hover:translate-x-1" />
    </button>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
