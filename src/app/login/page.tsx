'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
const LOGS = [
  "INITIALIZING GANYA_CORE...",
  "LINKING NEURAL_INTERFACE...",
  "LOADING SYSTEM_MODULES...",
  "VERIFYING OPERATOR_CREDENTIALS..."
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [isBooting, setIsBooting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (step < LOGS.length) {
      const timer = setTimeout(() => {
        setBootLogs(prev => [...prev, LOGS[step]]);
        setStep(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 비밀번호 검증 (사용자 요청: ganya / rksi2ek!@)
    if (id === 'ganya' && pw === 'rksi2ek!@') {
      setIsBooting(true);
      setIsSuccess(true);
      
      // 쿠키 설정 (미들웨어용)
      document.cookie = "admin_auth=true; path=/; max-age=86400"; // 24시간
      
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } else {
      setError('ACCESS_DENIED: UNAUTHORIZED_OPERATOR');
      // 틀렸을 때 초기화할지 유지할지는 선택인데, 보안상 초기화가 좋습니다.
      setPw('');
    }
  };

  return (
    <main className="h-screen w-screen bg-[#0A0F0A] text-[#00FF41] flex flex-col items-center justify-center p-4 font-mono overflow-hidden relative">
      <div className="noise" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[380px] border border-[#00FF41]/20 bg-[#0D130D] p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FF41] to-transparent opacity-40" />
        
        <div className="flex flex-col items-center mb-8">
            {/* Simple Pixel Ganya placeholder using SVG */}
            <div className="w-20 h-20 bg-[#00FF41]/5 border border-[#00FF41]/10 flex items-center justify-center mb-6">
                <svg viewBox="0 0 10 10" className="w-12 h-12 text-[#00FF41] fill-current">
                    <rect x="2" y="3" width="6" height="4" />
                    <rect x="3" y="2" width="4" height="6" />
                    <rect x="2" y="7" width="1" height="1" />
                    <rect x="7" y="7" width="1" height="1" />
                </svg>
            </div>
            <h1 className="vt-font text-3xl tracking-[0.15em] text-[#00FF41] glow">GANYA SYSTEM</h1>
            <p className="text-[7px] tracking-[0.2em] text-[#00FF41]/35 mt-1 uppercase">Admin Console v1.0 · Access Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[7px] tracking-[0.2em] text-[#00FF41]/35 uppercase">Operator ID</label>
            <div className="flex items-center gap-2 border-b border-[#00FF41]/20">
                <span className="vt-font text-xl text-[#00FF41] opacity-60">&gt;</span>
                <input 
                  autoFocus
                  type="text" value={id} onChange={e => setId(e.target.value)}
                  className="w-full bg-transparent p-1.5 text-[10px] tracking-widest text-[#00FF41] focus:outline-none placeholder:text-[#00FF41]/10"
                  placeholder="enter id..."
                />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[7px] tracking-[0.2em] text-[#00FF41]/35 uppercase">Access Key</label>
            <div className="flex items-center gap-2 border-b border-[#00FF41]/20">
                <span className="vt-font text-xl text-[#00FF41] opacity-60">&gt;</span>
                <input 
                  type="password" value={pw} onChange={e => setPw(e.target.value)}
                  className="w-full bg-transparent p-1.5 text-[10px] tracking-widest text-[#00FF41] focus:outline-none placeholder:text-[#00FF41]/10"
                  placeholder="••••••••"
                />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full mt-6 py-3 border border-[#00CC33] bg-transparent text-[#00FF41] text-[10px] tracking-[0.2em] relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#00FF41]/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <span className="relative">[ ENTER SYSTEM ]</span>
          </button>
        </form>

        <div className="mt-8 min-h-[60px] text-[8px] tracking-widest leading-relaxed uppercase">
          {bootLogs.map((log, i) => (
            <div key={i} className="text-[#00FF41]/30">&gt; {log}</div>
          ))}
          {isBooting && <div className="animate-pulse text-[#00FF41]">ESTABLISHING_SECURE_LINK...</div>}
          {isSuccess && <div className="text-[#00FF41] mt-1">SUCCESS: ACCESS_GRANTED. REDIRECTING...</div>}
          {error && <div className="text-red-500 mt-2 bg-red-500/10 p-2 border border-red-500/20 animate-bounce">{error}</div>}
        </div>
      </motion.div>
    </main>
  );
}
