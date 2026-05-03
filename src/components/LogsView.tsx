'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Award, Briefcase, Zap, Star, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

const CHAPTERS = [
  { id: 'all', year: 'ALL', label: '전체 기록', lv: 'LV.4', lvName: 'EVOLVING', exp: 960 },
  { id: 'c5', year: '2025', label: '현재', lv: 'LV.4', lvName: 'EVOLVING', exp: 960 },
  { id: 'c4', year: '2024', label: '확장', lv: 'LV.4', lvName: 'EXPANDING', exp: 820 },
  { id: 'c3', year: '2023', label: '성장', lv: 'LV.3', lvName: 'GROWING', exp: 520 },
  { id: 'c2', year: '2022', label: '탐색', lv: 'LV.2', lvName: 'EXPLORING', exp: 280 },
  { id: 'c1', year: '2021', label: '시작', lv: 'LV.1', lvName: 'INIT_GANYA', exp: 120 },
];

const LOG_ENTRIES = [
  { id: 'l01', chapter: 'c1', date: '2021.03', type: 'event', text: 'UI/UX 디자인의 세계에 첫 발을 내딛다. "디자인이 이렇게 재밌는 거였어?"', tags: ['event'], exp: 10, stats: { ux: 5 } },
  { id: 'l02', chapter: 'c1', date: '2021.06', type: 'skill', text: 'Figma 첫 사용. 프레임, 컴포넌트, 오토레이아웃과 씨름 시작.', tags: ['skill', 'ux'], exp: 15, stats: { ux: 10 } },
  { id: 'l03', chapter: 'c1', date: '2021.09', type: 'quest', text: '첫 번째 개인 프로젝트 — 앱 UI 리디자인 완료. 처음으로 케이스 스터디 작성.', tags: ['ux'], exp: 25, stats: { ux: 15 } },
  { id: 'l04', chapter: 'c1', date: '2021.12', type: 'skill', text: 'Adobe After Effects 입문. 모션의 매력에 빠지다.', tags: ['skill', 'motion'], exp: 20, stats: { motion: 10 } },
  { id: 'l05', chapter: 'c2', date: '2022.02', type: 'quest', text: '에이전시 인턴 시작. 실제 클라이언트 프로젝트 첫 투입. 긴장과 설렘.', tags: ['event', 'ux'], exp: 35, stats: { ux: 20 } },
  { id: 'l06', chapter: 'c2', date: '2022.04', type: 'project', text: '첫 B2C 앱 UX 프로젝트 참여. 사용자 인터뷰 진행, 리서치 방법론 습득.', tags: ['ux'], exp: 40, stats: { ux: 25 } },
  { id: 'l07', chapter: 'c2', date: '2022.07', type: 'skill', text: 'Cinema 4D 입문. 3D 공간 개념이 처음으로 이해되기 시작.', tags: ['skill', '3d'], exp: 25, stats: { '3d': 15 } },
  { id: 'l08', chapter: 'c2', date: '2022.09', type: 'quest', text: '모션 그래픽 첫 납품. 클라이언트 반응이 좋았던 기억.', tags: ['motion'], exp: 45, stats: { motion: 25 } },
  { id: 'l09', chapter: 'c2', date: '2022.11', type: 'event', text: 'UX 커뮤니티 스터디 참여 시작. 다양한 관점에서 디자인을 바라보는 법 배움.', tags: ['event', 'skill'], exp: 20, stats: { ux: 10 } },
  { id: 'l10', chapter: 'c3', date: '2023.02', type: 'project', text: '브랜드 3D 캠페인 영상 메인 디자이너로 참여. C4D 실력이 급성장.', tags: ['3d', 'motion'], exp: 55, stats: { '3d': 30, motion: 20 } },
  { id: 'l11', chapter: 'c3', date: '2023.05', type: 'quest', text: 'SNS 콘텐츠 모션 시리즈 정기 제작 시작. 빠른 사이클에서 퀄리티 유지하는 법 터득.', tags: ['motion'], exp: 40, stats: { motion: 30 } },
  { id: 'l12', chapter: 'c3', date: '2023.07', type: 'skill', text: 'Figma Variables & Prototyping 심화 학습. 인터랙티브 프로토타입 수준 향상.', tags: ['skill', 'ux'], exp: 30, stats: { ux: 20 } },
  { id: 'l13', chapter: 'c3', date: '2023.09', type: 'project', text: '이커머스 앱 전체 UX 플로우 리디자인. 처음으로 리드 디자이너 역할.', tags: ['ux'], exp: 60, stats: { ux: 30 } },
  { id: 'l14', chapter: 'c3', date: '2023.11', type: 'skill', text: '사용성 테스트, FullStory, Maze 등 리서치 툴 본격 도입.', tags: ['skill', 'ux'], exp: 35, stats: { ux: 15 } },
  { id: 'l15', chapter: 'c4', date: '2024.02', type: 'project', text: '제품 3D 비주얼라이징 프로젝트. 실사급 머티리얼 구현에 처음으로 성공.', tags: ['3d'], exp: 50, stats: { '3d': 35 } },
  { id: 'l16', chapter: 'c4', date: '2024.04', type: 'quest', text: 'UI 디자인 개선 프로젝트. C4D 마이크로 인터랙션으로 차별화. 재계약 성사.', tags: ['ux', 'motion'], exp: 70, stats: { ux: 35, motion: 20 } },
  { id: 'l17', chapter: 'c4', date: '2024.06', type: 'project', text: '핀테크 앱 온보딩 리디자인. 이탈 구간 분석 → UX 개선안 내부 표준 채택.', tags: ['ux'], exp: 65, stats: { ux: 30 } },
  { id: 'l18', chapter: 'c4', date: '2024.08', type: 'quest', text: 'AI 어드민 대시보드 설계. 처음으로 AI+데이터 UX 영역 진입.', tags: ['ux', 'skill'], exp: 60, stats: { ux: 25, ai: 30 } },
  { id: 'l19', chapter: 'c4', date: '2024.09', type: 'project', text: '디자인 시스템 구축 착수. 토큰 체계 수립, Figma-Storybook 브릿지 설계.', tags: ['ux', 'skill'], exp: 55, stats: { ux: 25 } },
  { id: 'l20', chapter: 'c4', date: '2024.12', type: 'event', text: '포트폴리오 리뉴얼 결정. "단순 포트폴리오는 싫어. 경험으로 만들자."', tags: ['event'], exp: 20, stats: {} },
  { id: 'l21', chapter: 'c5', date: '2025.01', type: 'skill', text: 'Three.js / React 본격 학습 시작. 인터랙티브 웹 개발 영역 확장.', tags: ['skill', '3d'], exp: 40, stats: { '3d': 20, ai: 25 } },
  { id: 'l22', chapter: 'c5', date: '2025.03', type: 'quest', text: '가냐 캐릭터 픽셀아트 시스템 완성. 다마고치 포트폴리오 컨셉 확정.', tags: ['event', 'skill'], exp: 45, stats: { ai: 20 } },
  { id: 'l23', chapter: 'c5', date: '2025.06', type: 'project', text: 'MediaPipe 손 트래킹 인터랙션 구현. 포트폴리오에 실제 AI 기술 통합.', tags: ['skill', 'ux'], exp: 50, stats: { ai: 35, ux: 15 } },
  { id: 'l24', chapter: 'c5', date: '2026.04', type: 'current', text: '현재 진행 중 — 포트폴리오 완성을 향해 항해 중. 아직 끝나지 않은 여정.', tags: ['event'], exp: 0, stats: {} },
];

const TYPE_CONFIG = {
  quest: { icon: Award, color: 'text-primary' },
  skill: { icon: Zap, color: 'text-blue-400' },
  project: { icon: Briefcase, color: 'text-amber-400' },
  event: { icon: Star, color: 'text-pink-400' },
  current: { icon: Terminal, color: 'text-primary' },
};

const CHAR_BODY = [
    ['_','_','_','O','O','O','O','O','_','_'],
    ['_','_','H','H','H','H','H','H','H','_'],
    ['_','H','H','H','H','H','H','H','H','H'],
    ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
    ['Y','N','N','Y','Y','Y','N','N','Y','Y'],
    ['Y','N','N','Y','Y','Y','N','N','Y','Y'],
    ['Y','Y','Y','O','O','O','Y','Y','Y','Y'],
    ['_','Y','Y','Y','Y','Y','Y','Y','Y','_'],
    ['_','_','Y','Y','Y','Y','Y','Y','_','_'],
    ['_','D','O','Y','Y','Y','Y','O','D','_'],
];
const COLOR_MAP: Record<string, string | null> = { '_': null, 'Y': '#FFDB4D', 'H': '#FFE87A', 'O': '#E68800', 'D': '#B85000', 'N': '#111111' };

interface Stats {
  ux: number;
  motion: number;
  '3d': number;
  ai: number;
  exp: number;
}

export default function LogsView() {
  const { setActiveTab } = useGameStore();
  const [activeChapter, setActiveChapter] = useState('all');
  const [filter, setFilter] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate totals
  const totalStats = LOG_ENTRIES.reduce<Stats>((acc, log) => {
    if (log.stats) {
      Object.entries(log.stats).forEach(([k, v]) => {
        const key = k as keyof Omit<Stats, 'exp'>;
        acc[key] = (acc[key] || 0) + v;
      });
    }
    acc.exp += log.exp;
    return acc;
  }, { ux: 0, motion: 0, '3d': 0, ai: 0, exp: 0 });

  const maxStatValue = Math.max(...Object.values(totalStats).filter(v => typeof v === 'number') as number[]);


  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 80, 80);
    const size = 6;
    const ox = (80 - 10 * size) / 2;
    const oy = (80 - 10 * size) / 2;
    CHAR_BODY.forEach((row, r) => row.forEach((pixel, c) => {
      const color = COLOR_MAP[pixel];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(ox + c * size, oy + r * size, size, size);
      }
    }));
  }, []);

  const filteredLogs = LOG_ENTRIES
    .filter(log => {
      const chMatch = activeChapter === 'all' || log.chapter === activeChapter;
      const typeMatch = filter === 'all' || log.type === filter;
      return chMatch && typeMatch;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 pt-20 pb-20 px-4 md:px-8 flex flex-col lg:flex-row gap-4 lg:gap-8 pointer-events-none overflow-y-auto lg:overflow-hidden scrollbar-hide"
    >
      {/* Left: Chapter Nav (Horizontal scroll on mobile, Vertical on desktop) */}
      <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 pointer-events-auto overflow-x-auto lg:overflow-y-auto py-2 lg:pr-4 scrollbar-hide shrink-0">
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChapter(ch.id)}
            className={`text-left p-3 lg:p-4 rounded-lg border transition-all group shrink-0 lg:shrink min-w-[120px] lg:min-w-0 ${
              activeChapter === ch.id 
                ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,255,178,0.2)]' 
                : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <div className={`font-mono text-[10px] lg:text-xs font-bold tracking-widest ${activeChapter === ch.id ? 'text-primary' : 'text-primary/40'}`}>
              {ch.year}
            </div>
            <div className="text-[9px] lg:text-[10px] text-primary/60 mt-1 uppercase tracking-wider truncate">
              {ch.label}
            </div>
            <div className="mt-2 text-[7px] lg:text-[8px] border border-primary/20 px-2 py-0.5 inline-block rounded uppercase tracking-tighter text-primary/40 group-hover:text-primary/60 transition-colors">
              {ch.lv}
            </div>
          </button>
        ))}
      </div>

      {/* Center: Terminal Log */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 flex flex-col hud-glass rounded-2xl overflow-hidden pointer-events-auto border-primary/10 order-2 lg:order-none relative">
        <button 
          onClick={() => setActiveTab('MENU')}
          className="absolute top-4 right-4 lg:top-6 lg:right-6 w-10 h-10 rounded-lg flex items-center justify-center border border-primary/20 text-primary/60 hover:text-primary hover:border-primary transition-all z-10"
        >
          ✕
        </button>

        <div className="p-4 lg:p-6 border-b border-primary/10 flex flex-col gap-4">
          <div className="pr-10">
            <h2 className="text-primary font-mono text-xs lg:text-sm font-black tracking-[0.2em] uppercase">
              {activeChapter === 'all' ? 'SYSTEM_TOTAL_LOGS' : `CHAPTER_${activeChapter.toUpperCase()}_LOGS`}
            </h2>
            <p className="text-primary/40 text-[8px] lg:text-[9px] mt-1 tracking-widest">
              {activeChapter === 'all' ? '전체 성장 기록 분석' : `${activeChapter.slice(1)}단계 성장 가속 기록`}
            </p>
          </div>
          
          <div className="flex gap-1 lg:gap-2 overflow-x-auto w-full pb-1 scrollbar-hide">
            {['all', 'quest', 'skill', 'project'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 lg:px-3 py-1 rounded text-[8px] lg:text-[9px] font-mono border transition-all uppercase tracking-widest whitespace-nowrap ${
                  filter === f 
                    ? 'bg-primary text-black border-primary' 
                    : 'border-primary/20 text-primary/40 hover:border-primary/40 hover:text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 scroll-smooth custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredLogs.map((log, idx) => {
              const Config = TYPE_CONFIG[log.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.current;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3 lg:gap-4 group"
                >
                  <div className={`mt-1 shrink-0 ${Config.color}`}>
                    <Config.icon size={12} className="lg:w-[14px] lg:h-[14px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-primary/30 font-mono text-[8px] lg:text-[9px]">{log.date}</span>
                      {log.exp > 0 && (
                        <span className="text-primary font-mono text-[8px] lg:text-[9px] font-bold">+EXP {log.exp}</span>
                      )}
                    </div>
                    <p className="text-primary/80 text-[10px] lg:text-[11px] leading-relaxed group-hover:text-primary transition-colors break-words">
                      {log.text}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1 lg:gap-2">
                      {log.tags.map(tag => (
                        <span key={tag} className="text-[7px] lg:text-[8px] border border-primary/20 px-1.5 py-0.5 rounded text-primary/40 uppercase font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {(activeChapter === 'all' || activeChapter === 'c5') && (
            <div className="flex items-center gap-3 text-primary/40 text-[10px] font-mono mt-4">
              <ChevronRight size={12} className="animate-pulse" />
              항해 계속 중
              <span className="w-2 h-4 bg-primary/40 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Stat Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4 lg:gap-6 pointer-events-auto overflow-y-auto lg:overflow-y-auto py-2 lg:pr-2 scrollbar-hide shrink-0 order-3 lg:order-none">
        {/* Char Card */}
        <div className="hud-glass p-4 lg:p-6 rounded-2xl border-primary/10 text-center">
          <div className="flex justify-center mb-4">
            <canvas ref={canvasRef} width={80} height={80} className="pixelated shadow-[0_0_20px_rgba(255,219,77,0.15)] w-16 h-16 lg:w-20 lg:h-20" />
          </div>
          <h3 className="text-primary font-mono text-[10px] lg:text-xs font-bold tracking-widest uppercase truncate">LV.{Math.floor(totalStats.exp / 250) + 1} · INIT_GANYA</h3>
          <p className="text-primary/40 text-[8px] lg:text-[9px] mt-1 tracking-widest uppercase">성장 가속화 중</p>
        </div>

        {/* Stats Grid for Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* EXP */}
            <div className="hud-glass p-4 lg:p-6 rounded-2xl border-primary/10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-primary/40 text-[8px] lg:text-[9px] font-bold uppercase tracking-widest">Experience</span>
                <span className="text-primary font-mono text-xs lg:text-sm font-bold shadow-glow">{totalStats.exp}</span>
              </div>
              <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ width: `${Math.min((totalStats.exp / 1000) * 100, 100)}%`, opacity: 1 }}
                  className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,178,0.5)]" 
                />
              </div>
            </div>

            {/* Growth Stats */}
            <div className="hud-glass p-4 lg:p-6 rounded-2xl border-primary/10 flex flex-col gap-4 lg:gap-6">
              <h4 className="text-primary/40 text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.2em] border-b border-primary/5 pb-2">Stats</h4>
              <div className="flex flex-col gap-3 lg:gap-4">
                  {[
                    { label: 'UX', key: 'ux', color: 'bg-primary' },
                    { label: 'Motion', key: 'motion', color: 'bg-blue-400' },
                    { label: '3D', key: '3d', color: 'bg-amber-400' },
                    { label: 'AI', key: 'ai', color: 'bg-pink-400' },
                  ].map((stat) => (
                    <div key={stat.key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-primary/60 text-[8px] lg:text-[10px] tracking-widest uppercase">{stat.label}</span>
                        <span className="text-primary/80 font-mono text-[8px] lg:text-[10px]">{totalStats[stat.key as keyof typeof totalStats] || 0}</span>
                      </div>
                      <div className="h-0.5 bg-primary/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(totalStats[stat.key as keyof typeof totalStats] / maxStatValue) * 100}%` }}
                          className={`h-full ${stat.color} opacity-80`}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
        </div>

        {/* Recent Quests - Hidden on small mobile if space is tight, or just keep it */}
        <div className="hud-glass p-4 lg:p-6 rounded-2xl border-primary/10 mb-4 lg:mb-0">
          <h4 className="text-primary/40 text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.2em] mb-3 lg:mb-4">Recent Quests</h4>
          <div className="flex flex-col gap-2 lg:gap-3">
            {LOG_ENTRIES.filter(l => l.type === 'quest' || l.type === 'project').slice(-3).reverse().map(q => (
              <div key={q.id} className="p-2 lg:p-3 border border-primary/5 rounded-lg hover:border-primary/20 transition-all cursor-pointer group">
                <div className="text-primary/80 text-[9px] lg:text-[10px] leading-tight group-hover:text-primary transition-colors">{q.text.slice(0, 40)}...</div>
                <div className="text-primary/30 text-[7px] lg:text-[8px] mt-1 lg:mt-2 font-mono uppercase tracking-tighter">{q.date} · +{q.exp} EXP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
