'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { User, Activity, Star, Database } from 'lucide-react';

const CATS = [
  {
    id: 'interaction',
    name: 'INTERACTION DESIGN',
    meta: '인터랙션 · UX 설계 · 프로토타이핑',
    avg: 82,
    color: '#00FFB2',
    icon: <Activity className="w-5 h-5 text-[#00FFB2]" />,
    stats: [
      {
        icon: '◈',
        name: '마이크로 인터랙션 설계',
        pct: 90,
        tag: 'gained',
        tagLabel: 'MAX LEVEL',
        change: '+12 this month',
        up: true,
        subs: [
          { name: '애니메이션 타이밍', val: 92 },
          { name: '트리거 설계', val: 88 },
          { name: '피드백 루프', val: 90 },
        ],
        projects: ['UI 디자인 개선', '앱 온보딩 리디자인'],
      },
      {
        icon: '◉',
        name: 'UX 리서치 & 분석',
        pct: 85,
        tag: 'gained',
        tagLabel: 'PROFICIENT',
        change: '+8 this month',
        up: true,
        subs: [
          { name: '사용자 인터뷰', val: 90 },
          { name: '데이터 분석', val: 80 },
          { name: 'A/B 테스트', val: 85 },
        ],
        projects: ['앱 온보딩 리디자인', 'AI 대시보드 설계'],
      },
      {
        icon: '◆',
        name: '프로토타이핑',
        pct: 78,
        tag: 'growing',
        tagLabel: 'GROWING',
        change: '+5 this month',
        up: true,
        subs: [
          { name: 'Figma 고급', val: 88 },
          { name: '코드 프로토타입', val: 70 },
          { name: '인터랙티브 UX', val: 76 },
        ],
        projects: ['디자인 시스템 구축', '포트폴리오 3D 경험'],
      },
      {
        icon: '▣',
        name: '정보 구조 설계',
        pct: 72,
        tag: 'growing',
        tagLabel: 'GROWING',
        change: '+3 this month',
        up: true,
        subs: [
          { name: '내비게이션 설계', val: 75 },
          { name: '콘텐츠 계층', val: 70 },
          { name: '플로우 다이어그램', val: 72 },
        ],
        projects: ['앱 온보딩 리디자인', '디자인 시스템 구축'],
      },
    ]
  },
  {
    id: 'ai',
    name: 'AI · DATA DESIGN',
    meta: 'AI 인터페이스 · 데이터 시각화 · 리서치',
    avg: 73,
    color: '#64C8FF',
    icon: <Database className="w-5 h-5 text-[#64C8FF]" />,
    stats: [
      {
        icon: '◉',
        name: 'AI 인터페이스 설계',
        pct: 77,
        tag: 'growing',
        tagLabel: 'GROWING',
        change: '+15 this month',
        up: true,
        subs: [
          { name: '설명가능한 AI UI', val: 72 },
          { name: '추천 인터페이스', val: 80 },
          { name: 'AI 피드백 디자인', val: 78 },
        ],
        projects: ['AI 기반 대시보드 설계', 'AI 추천 인터페이스'],
      },
      {
        icon: '◈',
        name: '데이터 시각화',
        pct: 80,
        tag: 'gained',
        tagLabel: 'PROFICIENT',
        change: '+10 this month',
        up: true,
        subs: [
          { name: '차트 & 그래프 설계', val: 85 },
          { name: '실시간 데이터 UI', val: 78 },
          { name: '대시보드 레이아웃', val: 77 },
        ],
        projects: ['AI 기반 대시보드 설계'],
      },
      {
        icon: '◇',
        name: 'AI 툴 활용',
        pct: 82,
        tag: 'gained',
        tagLabel: 'PROFICIENT',
        change: '+6 this month',
        up: true,
        subs: [
          { name: 'Midjourney', val: 90 },
          { name: 'Gemini API 연동', val: 75 },
          { name: 'ChatGPT 프롬프팅', val: 82 },
        ],
        projects: ['AI 추천 인터페이스', '포트폴리오 3D 경험'],
      },
      {
        icon: '▷',
        name: '사용자 데이터 분석',
        pct: 55,
        tag: 'learning',
        tagLabel: 'LEARNING',
        change: '+2 this month',
        up: false,
        subs: [
          { name: 'FullStory 분석', val: 60 },
          { name: 'SQL 기초', val: 45 },
          { name: 'Python 리서치', val: 60 },
        ],
        projects: ['AI 기반 대시보드 설계'],
      },
    ]
  },
  {
    id: 'creative',
    name: 'CREATIVE · 3D',
    meta: '3D 모션 · 비주얼 시스템 · 브랜딩',
    avg: 74,
    color: '#FFB432',
    icon: <Star className="w-5 h-5 text-[#FFB432]" />,
    stats: [
      {
        icon: '◆',
        name: '비주얼 시스템 설계',
        pct: 88,
        tag: 'gained',
        tagLabel: 'PROFICIENT',
        change: '+4 this month',
        up: true,
        subs: [
          { name: '타이포그래피', val: 90 },
          { name: '컬러 시스템', val: 88 },
          { name: '아이코노그래피', val: 85 },
        ],
        projects: ['디자인 시스템 구축', '포트폴리오 3D 경험'],
      },
      {
        icon: '◈',
        name: '3D 모션 & 인터랙션',
        pct: 68,
        tag: 'growing',
        tagLabel: 'GROWING',
        change: '+18 this month',
        up: true,
        subs: [
          { name: 'Three.js / R3F', val: 65 },
          { name: 'Blender 기초', val: 60 },
          { name: 'C4D 모션', val: 80 },
        ],
        projects: ['3D 모션 인트로 시스템', '포트폴리오 3D 경험'],
      },
      {
        icon: '▣',
        name: '브랜드 아이덴티티',
        pct: 75,
        tag: 'growing',
        tagLabel: 'GROWING',
        change: '+3 this month',
        up: true,
        subs: [
          { name: '로고 & 심볼', val: 70 },
          { name: '브랜드 가이드라인', val: 80 },
          { name: '모션 아이덴티티', val: 75 },
        ],
        projects: ['3D 모션 인트로 시스템'],
      },
      {
        icon: '◉',
        name: '생성 AI 활용 크리에이티브',
        pct: 65,
        tag: 'learning',
        tagLabel: 'LEARNING',
        change: '+20 this month',
        up: true,
        subs: [
          { name: 'Midjourney 고급', val: 80 },
          { name: 'AI 영상 생성', val: 50 },
          { name: '프롬프트 엔지니어링', val: 65 },
        ],
        projects: ['포트폴리오 3D 경험'],
      },
    ]
  }
];

export default function StatusSystem() {
  const { activeTab, setActiveTab, level } = useGameStore();
  const [currentCat, setCurrentCat] = useState(0);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (activeTab !== 'STATUS') return null;

  const cat = CATS[currentCat];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col pointer-events-auto"
    >
      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,255,178,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,178,.03) 1px,transparent 1px)`,
            backgroundSize: '36px 36px' 
          }} 
      />

      {/* Header (Project style) */}
      <div className="h-16 border-b border-primary/10 px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] text-primary/60 font-bold uppercase tracking-widest leading-tight">Profile</div>
            <div className="text-primary font-mono text-[18px] font-bold leading-tight tracking-[0.2em]">GANYA · STATUS</div>
          </div>
          <div className="h-8 w-[1px] bg-primary/10" />
          <div className="flex items-center gap-3">
             <span className="text-[8px] text-primary/40 font-bold uppercase tracking-widest">Core Status</span>
             <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-3 h-1.5 border border-primary/30 ${i <= 4 ? 'bg-primary' : 'bg-primary/10'}`} />
                ))}
             </div>
             <span className="text-[10px] font-mono text-primary ml-1">80%</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
              <div className="text-[9px] text-primary/50 font-mono tracking-widest uppercase">LV.{level} · INIT_GANYA</div>
              <div className="text-[9px] text-primary/30 font-mono tracking-wider mt-1">{new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.')}</div>
           </div>
           <button 
             onClick={() => setActiveTab('QUEST_LOG')}
             className="w-10 h-10 rounded-lg flex items-center justify-center border border-primary/20 text-primary/60 hover:text-primary hover:border-primary transition-all"
           >
             ✕
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden z-10 custom-scrollbar">
        {/* Left: Orbit Panel */}
        <div className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-primary/10 flex flex-col items-center justify-center p-6 lg:p-8 relative shrink-0">
          <div className="relative w-[240px] h-[240px] lg:w-[300px] lg:h-[300px] flex items-center justify-center">
            {/* Orbit Rings */}
            <div className="absolute inset-0 border border-primary/5 rounded-full animate-spin-slow" />
            <div className="absolute inset-6 lg:inset-8 border border-primary/5 rounded-full animate-spin-slow reverse" />
            
            {/* Center Character Area */}
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-1 lg:gap-2 shadow-[0_0_20px_rgba(0,255,178,0.1)]">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/20 rounded flex items-center justify-center text-primary">
                    <User className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="text-[7px] lg:text-[8px] text-primary/60 font-mono">LV.{level}</div>
                <div className="w-10 h-0.5 lg:w-12 lg:h-1 bg-primary/10 overflow-hidden rounded-full">
                    <div className="h-full bg-primary" style={{ width: '68%' }} />
                </div>
            </div>

            {/* Orbit Nodes */}
            {CATS.map((c, idx) => {
                const angles = [270, 150, 30]; // Positioned in triangle
                const angle = angles[idx];
                const rad = (angle * Math.PI) / 180;
                const r = window.innerWidth < 1024 ? 100 : 130;
                const tx = Math.cos(rad) * r;
                const ty = Math.sin(rad) * r;

                return (
                    <motion.button
                        key={c.id}
                        onClick={() => {
                            setCurrentCat(idx);
                            setExpandedIdx(null);
                        }}
                        style={{ x: tx, y: ty }}
                        initial={false}
                        animate={{ 
                            scale: currentCat === idx ? 1.1 : 1,
                            borderColor: currentCat === idx ? c.color : 'rgba(0, 255, 178, 0.2)'
                        }}
                        className={`absolute w-14 h-14 lg:w-16 lg:h-16 rounded-xl border flex flex-col items-center justify-center gap-1 bg-black/80 backdrop-blur-sm transition-colors ${currentCat === idx ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                    >
                        {React.cloneElement(c.icon as React.ReactElement<{ className?: string }>, {
                          className: `w-5 h-5 lg:w-6 lg:h-6 ${currentCat === idx ? '' : 'opacity-40'}`
                        })}
                        <span className={`text-[6px] lg:text-[7px] font-bold tracking-tighter ${currentCat === idx ? 'text-primary' : 'text-primary/40'}`}>
                            {c.id === 'interaction' ? 'INTERACT' : (c.id === 'ai' ? 'AI·DATA' : 'CREATIVE')}
                        </span>
                    </motion.button>
                );
            })}

            {/* SVG Connector lines */}
            <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 300 300">
                <AnimatePresence>
                    {(() => {
                        const angles = [270, 150, 30];
                        const angle = angles[currentCat];
                        const rad = (angle * Math.PI) / 180;
                        const r = 130; // SVG uses fixed viewbox
                        const tx = 150 + Math.cos(rad) * r;
                        const ty = 150 + Math.sin(rad) * r;
                        return (
                            <motion.line
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                x1="150" y1="150" x2={tx} y2={ty}
                                stroke={cat.color}
                                strokeWidth="0.5"
                                strokeDasharray="4 2"
                            />
                        );
                    })()}
                </AnimatePresence>
            </svg>
          </div>

          <div className="mt-8 lg:mt-12 text-center">
            <div className="text-[8px] text-primary/30 uppercase tracking-[0.3em] mb-1">Total Skill Score</div>
            <div className="text-[20px] lg:text-[28px] font-mono font-bold text-primary tracking-tight">
                78<span className="text-sm text-primary/30 ml-1">/ 100</span>
            </div>
          </div>
        </div>

        {/* Right: Stats Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 lg:p-8 border-b border-primary/10 flex justify-between items-end">
            <div>
                <motion.h2 
                    key={cat.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-primary font-mono text-lg lg:text-xl font-bold tracking-widest"
                >
                    {cat.name}
                </motion.h2>
                <p className="text-[9px] lg:text-[10px] text-primary/50 mt-1 uppercase tracking-wider">{cat.meta}</p>
            </div>
            <div className="text-right">
                <div className="text-[24px] lg:text-[32px] font-mono font-bold text-primary leading-none">{cat.avg}</div>
                <div className="text-[7px] lg:text-[8px] text-primary/30 uppercase tracking-widest mt-1">Avg</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
            <div className="flex flex-col gap-3 lg:gap-4">
                {cat.stats.map((s, i) => (
                    <motion.div
                        key={`${cat.id}-${s.name}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            duration: 0.4,
                            delay: i * 0.03,
                            ease: [0.23, 1, 0.32, 1] 
                        }}
                        className={`border rounded-xl p-4 lg:p-5 cursor-pointer will-change-transform ${expandedIdx === i ? 'border-primary/40 bg-primary/5' : 'border-primary/10 hover:border-primary/20 bg-black/40'}`}
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 lg:gap-4">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 border border-primary/20 flex items-center justify-center text-sm lg:text-lg">
                                    {s.icon}
                                </div>
                                <div>
                                    <h3 className="text-primary font-bold text-xs lg:text-sm tracking-wide">{s.name}</h3>
                                    <span className={`text-[7px] lg:text-[8px] border px-2 py-0.5 rounded uppercase mt-1 inline-block ${s.tag === 'gained' ? 'border-primary/30 text-primary/60' : 'border-blue-400/30 text-blue-400/60'}`}>
                                        {s.tagLabel}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg lg:text-xl font-mono font-bold text-primary" style={{ color: cat.color }}>{s.pct}</div>
                                <div className={`text-[7px] lg:text-[8px] uppercase tracking-tighter ${s.up ? 'text-primary/60' : 'text-red-400/60'}`}>{s.change}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-primary/10 rounded-full overflow-hidden mb-2">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${s.pct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full"
                                style={{ backgroundColor: cat.color }}
                            />
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                            {expandedIdx === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 mt-4 border-t border-primary/10 flex flex-col gap-3">
                                        <div className="grid grid-cols-1 gap-2">
                                            {s.subs.map(sub => (
                                                <div key={sub.name} className="flex items-center gap-3 lg:gap-4">
                                                    <span className="text-[8px] lg:text-[9px] text-primary/40 font-mono w-20 lg:w-24 shrink-0 uppercase truncate">{sub.name}</span>
                                                    <div className="flex-1 h-0.5 bg-primary/5">
                                                        <div className="h-full bg-primary/30" style={{ width: `${sub.val}%` }} />
                                                    </div>
                                                    <span className="text-[8px] lg:text-[9px] text-primary/60 font-mono w-6 text-right">{sub.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-[7px] lg:text-[8px] text-primary/30 uppercase tracking-widest mb-2">Linked Projects</div>
                                            <div className="flex flex-wrap gap-1 lg:gap-2">
                                                {s.projects.map(p => (
                                                  <span key={p} className="text-[7px] lg:text-[8px] border border-primary/20 px-1.5 lg:px-2 py-0.5 lg:py-1 text-primary/60 hover:text-primary hover:border-primary transition-all">
                                                      {p}
                                                  </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Corners */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-primary/30" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-primary/30" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-primary/30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-primary/30" />
    </motion.div>
  );
}
