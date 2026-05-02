'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type Project } from '@/store/useGameStore';
import { Globe, Layout, Box, ArrowRight, Maximize2, Grid, Menu } from 'lucide-react';

// --- Project Data is now loaded from useGameStore ---
interface Star {
    proj: Project;
    rx: number;
    ry: number;
    size: number;
    opacity: number;
    pulse: number;
}

interface BackgroundStar {
    rx: number;
    ry: number;
    size: number;
    opacity: number;
    twinkle: number;
    color: string;
}

const CAT_COLOR = { ux: '#00FFC8', vid: '#00F5FF', '3d': '#FFE600' };
const STAR_ZONES = { ux: [0.12, 0.38], vid: [0.38, 0.62], '3d': [0.62, 0.88] };

export default function WorkWorld() {
    const {
        projects,
        trackingX,
        trackingY,
        workViewMode,
        setWorkViewMode
    } = useGameStore();

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [pan, setPan] = useState({ x: 0, y: 0 });

    const starsRef = useRef<Star[]>([]);
    const bgStarsRef = useRef<BackgroundStar[]>([]);
    const animRef = useRef<number>(0);

    // Initialize stars once
    useEffect(() => {
        if (!projects || projects.length === 0) return;

        const catCounts: Record<string, number> = {};
        const stars = projects.map((p, i) => {
            const cat = p.cat;
            const count = catCounts[cat] || 0;
            catCounts[cat] = count + 1;

            const [xMin, xMax] = STAR_ZONES[cat as keyof typeof STAR_ZONES] || [0, 1];
            const seed = (cat.charCodeAt(0) * 17 + i * 137);
            const r = (n: number) => ((seed * 9301 + 49297 * (n + 1)) % 233280) / 233280;

            return {
                proj: p,
                rx: xMin + r(0) * (xMax - xMin),
                ry: 0.2 + r(1) * 0.6,
                size: 3 + r(2) * 4,
                opacity: 0.6 + r(3) * 0.4,
                pulse: Math.random() * Math.PI * 2
            };
        });
        starsRef.current = stars;

        // Initialize Background Stars
        if (bgStarsRef.current.length === 0) {
            const bgStars = Array.from({ length: 300 }).map(() => ({
                rx: Math.random(),
                ry: Math.random(),
                size: Math.random() * 1.2 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
                twinkle: Math.random() * Math.PI * 2,
                color: Math.random() > 0.9 ? (Math.random() > 0.5 ? '#00FFC8' : '#00F5FF') : '#FFFFFF'
            }));
            bgStarsRef.current = bgStars;
        }
    }, [projects]);

    const [hoveredProj, setHoveredProj] = useState<Project | null>(null);

    const lastCoords = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (workViewMode !== 'WORLD') {
            if (hoveredProj) {
                requestAnimationFrame(() => setHoveredProj(null));
            }
            return;
        }
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = trackingX - rect.left;
        const my = trackingY - rect.top;

        let found: Project | null = null;
        for (const s of starsRef.current) {
            const sx = s.rx * canvas.width + pan.x;
            const sy = s.ry * canvas.height + pan.y;
            const d = Math.hypot(mx - sx, my - sy);
            if (d < 30) {
                found = s.proj;
                break;
            }
        }
        if (found !== hoveredProj) {
            const nextFound = found;
            requestAnimationFrame(() => setHoveredProj(nextFound));
        }
    }, [trackingX, trackingY, pan, workViewMode, hoveredProj]);

    const startRenderLoop = useCallback((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let t = 0;

        const render = () => {
            if (workViewMode !== 'WORLD') {
                animRef.current = requestAnimationFrame(render);
                return;
            }

            const W = canvas.width = canvas.offsetWidth;
            const H = canvas.height = canvas.offsetHeight;
            if (W === 0 || H === 0) {
                animRef.current = requestAnimationFrame(render);
                return;
            }

            t += 0.01;
            ctx.clearRect(0, 0, W, H);

            // Draw Background Stars
            ctx.fillStyle = '#FFFFFF';
            bgStarsRef.current.forEach(s => {
                const sx = (s.rx * W + pan.x * 0.4) % W;
                const sy = (s.ry * H + pan.y * 0.4) % H;
                const finalX = sx < 0 ? sx + W : sx;
                const finalY = sy < 0 ? sy + H : sy;
                const twinkle = s.opacity * (0.6 + 0.4 * Math.sin(t * 2 + s.twinkle));

                ctx.globalAlpha = twinkle;
                if (s.size > 1.2) {
                    ctx.beginPath(); ctx.arc(finalX, finalY, s.size, 0, Math.PI * 2); ctx.fill();
                } else {
                    ctx.fillRect(finalX, finalY, s.size * 2, s.size * 2);
                }
            });
            ctx.globalAlpha = 1.0;

            // Background Nebula Glows
            const nebulae = [
                { x: 0.25, y: 0.45, col: '0,255,200', r: W * 0.25 },
                { x: 0.76, y: 0.45, col: '255,230,0', r: W * 0.18 },
            ];
            nebulae.forEach(n => {
                const gx = n.x * W + pan.x, gy = n.y * H + pan.y;
                const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, n.r);
                g.addColorStop(0, `rgba(${n.col}, 0.04)`);
                g.addColorStop(1, `rgba(${n.col}, 0)`);
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, n.r, 0, Math.PI * 2); ctx.fill();
            });

            // Draw Project Stars
            starsRef.current.forEach(s => {
                const x = s.rx * W + pan.x;
                const y = s.ry * H + pan.y;

                const isHovered = s.proj === hoveredProj;
                ctx.beginPath();
                ctx.arc(x, y, isHovered ? s.size * 1.5 : s.size, 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? '#00FFB2' : `rgba(0, 255, 178, ${s.opacity})`;

                if (isHovered) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00FFB2';
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.strokeStyle = '#00FFB2';
                    ctx.setLineDash([5, 5]);
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x - 20, y - 20, 40, 40);
                } else {
                    ctx.fill();
                }
            });

            animRef.current = requestAnimationFrame(render);
        };

        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [workViewMode, pan, hoveredProj]);

    const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
        if (node) {
            startRenderLoop(node);
        } else {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        }
    }, [startRenderLoop]);


    return (
        <div className="fixed inset-0 z-40 bg-black flex flex-col pointer-events-auto">
            {/* Header Overlay */}
            <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 grid grid-cols-3 items-start z-50 pointer-events-none">
                {/* Left Side: Archive Title */}
                <div className="flex flex-col pointer-events-auto">
                    <h1 className="text-primary font-mono text-lg md:text-xl font-black tracking-widest leading-none opacity-40">ARCHIVE</h1>
                </div>

                {/* Center: Mode Toggles & Compass */}
                <div className="flex flex-col items-center gap-2 md:gap-4 pointer-events-auto">
                    <div className="flex bg-black/40 border border-primary/20 backdrop-blur-xl rounded overflow-x-auto max-w-[90vw]">
                        <button
                            onClick={() => setWorkViewMode('WORLD')}
                            className={`px-3 md:px-6 py-2 md:py-2.5 flex items-center gap-2 transition-all flex-shrink-0 ${workViewMode === 'WORLD' ? 'bg-primary/20 text-primary shadow-[inset_0_0_15px_rgba(0,255,178,0.2)]' : 'text-primary/40 hover:text-primary'}`}
                            style={{ borderRight: '1px solid rgba(0,255,178,0.1)' }}
                        >
                            <Box className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span className="text-[8px] md:text-[10px] font-mono font-black uppercase tracking-widest">World</span>
                        </button>
                        <button
                            onClick={() => setWorkViewMode('LIST')}
                            className={`px-3 md:px-6 py-2 md:py-2.5 flex items-center gap-2 transition-all flex-shrink-0 ${workViewMode === 'LIST' ? 'bg-primary/20 text-primary shadow-[inset_0_0_15px_rgba(0,255,178,0.2)]' : 'text-primary/40 hover:text-primary'}`}
                            style={{ borderRight: '1px solid rgba(0,255,178,0.1)' }}
                        >
                            <Menu className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span className="text-[8px] md:text-[10px] font-mono font-black uppercase tracking-widest">List</span>
                        </button>
                        <button
                            onClick={() => setWorkViewMode('GRID')}
                            className={`px-3 md:px-6 py-2 md:py-2.5 flex items-center gap-2 transition-all flex-shrink-0 ${workViewMode === 'GRID' ? 'bg-primary/20 text-primary shadow-[inset_0_0_15px_rgba(0,255,178,0.2)]' : 'text-primary/40 hover:text-primary'}`}
                            style={{ borderRight: '1px solid rgba(0,255,178,0.1)' }}
                        >
                            <Grid className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span className="text-[8px] md:text-[10px] font-mono font-black uppercase tracking-widest">Grid</span>
                        </button>
                        <button
                            onClick={() => setWorkViewMode('GALLERY')}
                            className={`px-3 md:px-6 py-2 md:py-2.5 flex items-center gap-2 transition-all flex-shrink-0 ${workViewMode === 'GALLERY' ? 'bg-primary/20 text-primary shadow-[inset_0_0_15px_rgba(0,255,178,0.2)]' : 'text-primary/40 hover:text-primary'}`}
                        >
                            <Layout className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span className="text-[8px] md:text-[10px] font-mono font-black uppercase tracking-widest">Gallery</span>
                        </button>
                    </div>

                    {/* Degree Compass Bar */}
                    {workViewMode === 'WORLD' && (
                        <div className="relative w-full max-w-[600px] h-10 md:h-12 flex flex-col items-center overflow-hidden pointer-events-none px-4">
                            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                                <span className="text-primary font-mono text-[11px] md:text-[14px] font-bold">{Math.abs(Math.floor((trackingX / 4) % 360))}°</span>
                            </div>
                            <div className="relative w-full h-[1px] bg-primary/20 overflow-hidden">
                                <motion.div
                                    className="absolute top-0 flex items-start"
                                    style={{ x: -((trackingX / 4) % 20) - 20 }}
                                >
                                    {Array.from({ length: 61 }).map((_, _i) => (
                                        <div key={_i} className="flex flex-col items-center flex-shrink-0" style={{ width: '20px' }}>
                                            <div className={`w-[1px] bg-primary/40 ${_i % 5 === 0 ? 'h-2 md:h-3' : 'h-1 md:h-1.5'}`} />
                                            {_i % 5 === 0 && (
                                                <span className="text-[6px] md:text-[7px] text-primary/20 font-mono mt-1">
                                                    {Math.floor(((trackingX / 4) + (_i - 30) * 10) % 360 + 360) % 360}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                            <div className="absolute top-4 w-[1px] h-3 md:h-4 bg-primary shadow-[0_0_10px_#00FFB2]" />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {workViewMode === 'WORLD' ? (
                        <motion.div
                            key="world"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full cursor-none relative overflow-hidden"
                            onPointerDown={(e) => {
                                const startX = e.clientX, startY = e.clientY;
                                const startPanX = pan.x, startPanY = pan.y;
                                const onMove = (em: PointerEvent) => {
                                    setPan({ x: startPanX + (em.clientX - startX), y: startPanY + (em.clientY - startY) });
                                };
                                const onUp = () => {
                                    window.removeEventListener('pointermove', onMove);
                                    window.removeEventListener('pointerup', onUp);
                                };
                                window.addEventListener('pointermove', onMove);
                                window.addEventListener('pointerup', onUp);
                            }}
                            onClick={() => {
                                if (hoveredProj) {
                                    setSelectedProject(hoveredProj);
                                    setWorkViewMode('LIST');
                                }
                            }}
                        >
                            <canvas ref={canvasRef} className="w-full h-full" />

                            {/* Custom Crosshair Cursor */}
                            <div
                                className="fixed pointer-events-none z-[100] flex items-center justify-center"
                                style={{
                                    left: trackingX,
                                    top: trackingY,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className="relative w-12 h-12 border border-primary/20 rounded-full flex items-center justify-center">
                                    <div className="absolute w-[1px] h-16 bg-primary/30" />
                                    <div className="absolute h-[1px] w-16 bg-primary/30" />
                                    <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_#00FFB2]" />

                                    {/* Scanning pulse effect */}
                                    <motion.div
                                        animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 border border-primary/10 rounded-full"
                                    />
                                </div>

                                {/* Target Info Tag */}
                                <div className="absolute left-10 top-0 flex flex-col gap-0.5 text-[8px] font-mono text-primary/60 bg-black/40 backdrop-blur-sm px-2 py-1 border border-primary/10 rounded uppercase pointer-events-none whitespace-nowrap">
                                    <p>SCAN_TGT: <span className="text-primary font-bold">{hoveredProj ? hoveredProj.id : 'NONE'}</span></p>
                                    <p>LOCK_ST: <span className={hoveredProj ? 'text-primary font-bold' : ''}>{hoveredProj ? 'ACTIVE' : 'IDLE'}</span></p>
                                </div>
                            </div>

                            {/* Hover Popup Overlay */}
                            {hoveredProj && (
                                <div
                                    className="absolute pointer-events-none p-4 border border-primary/40 bg-black/90 backdrop-blur-md rounded-xl w-56 flex flex-col gap-2 shadow-2xl"
                                    style={{ left: trackingX + 20, top: trackingY - 10 }}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] text-primary font-bold uppercase px-1.5 py-0.5 border border-primary/30 rounded">{hoveredProj.id}</span>
                                        <span className="text-[9px] text-primary/60 uppercase">{hoveredProj.year}</span>
                                    </div>
                                    <h3 className="text-white text-sm font-bold leading-tight">{hoveredProj.name}</h3>
                                    <p className="text-primary/60 text-[10px] uppercase tracking-wider">{hoveredProj.client}</p>
                                    <div className="mt-1 pt-2 border-t border-primary/10 flex items-center gap-2 text-primary font-bold">
                                        <span className="text-[8px] uppercase tracking-[0.2em]">Click to open log</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            )}

                            {/* HUD Corner Data (Ref. hud-tl, etc) */}
                            <div className="absolute bottom-16 md:bottom-24 left-4 md:left-8 text-[8px] md:text-[10px] font-mono text-primary/30 leading-loose uppercase tracking-widest pointer-events-none">
                                <p>▶ {isMobile ? 'TOUCH' : 'HOVER'} TO LOCK_TGT</p>
                                <p>▶ DRAG TO PAN_WORLD</p>
                                <p>▶ CLICK TO ACCESS_DB</p>
                            </div>
                        </motion.div>
                    ) : workViewMode === 'GRID' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full h-full p-6 md:p-24 pt-32 md:pt-40 overflow-y-auto custom-scrollbar"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[280px]">
                                {projects.map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        whileHover={{ y: -10 }}
                                        onClick={() => { setSelectedProject(p); setWorkViewMode('LIST'); }}
                                        className={`group relative rounded-2xl border border-primary/10 bg-black/40 backdrop-blur-xl overflow-hidden cursor-pointer p-6 min-h-[200px] ${i % 4 === 0 ? 'md:col-span-2' : ''}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-mono text-primary/40 uppercase">{p.id}</span>
                                            <h3 className="text-white text-lg md:text-xl font-black">{p.name}</h3>
                                            <p className="text-primary/60 text-[10px] md:text-xs uppercase tracking-widest">{p.client}</p>
                                        </div>
                                        <div className="mt-8 md:absolute md:bottom-6 md:left-6 md:right-6 flex justify-between items-end">
                                            <div className="flex gap-2">
                                                {p.roles.slice(0, 2).map(role => (
                                                    <span key={role} className="text-[8px] text-primary/40 px-2 py-0.5 border border-primary/10 rounded-full">{role}</span>
                                                ))}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                                        </div>
                                        {/* Tech tag */}
                                        <div className="absolute top-6 right-6">
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_10px_var(--col)]" style={{ backgroundColor: CAT_COLOR[p.cat as keyof typeof CAT_COLOR], '--col': CAT_COLOR[p.cat as keyof typeof CAT_COLOR] } as React.CSSProperties} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : workViewMode === 'GALLERY' ? (
                        <motion.div
                            key="gallery"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="w-full h-full flex items-center px-6 md:px-12 overflow-x-auto custom-scrollbar gap-6 md:gap-12 snap-x"
                        >
                            {projects.map((p) => (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => { setSelectedProject(p); setWorkViewMode('LIST'); }}
                                    className="flex-shrink-0 w-[85vw] md:w-[450px] aspect-[4/5] rounded-3xl border border-primary/20 bg-black/60 relative overflow-hidden group cursor-pointer snap-center"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                                    <div className="absolute top-8 md:top-12 left-8 md:left-12 z-20">
                                        <span className="text-primary font-mono text-xs md:text-sm tracking-[0.5em]">{p.id}</span>
                                        <h3 className="text-white text-3xl md:text-5xl font-black mt-2 md:mt-4 leading-none">{p.name}</h3>
                                    </div>
                                    <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12 right-8 md:right-12 z-20 flex justify-between items-end">
                                        <div className="flex flex-col gap-1 md:gap-2">
                                            <p className="text-primary font-bold text-base md:text-lg">{p.year}</p>
                                            <p className="text-primary/40 text-[8px] md:text-[10px] uppercase tracking-widest">{p.client}</p>
                                        </div>
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary transition-all group-hover:scale-110">
                                            <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-black transition-colors" />
                                        </div>
                                    </div>
                                    {/* Visual background element */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Globe className="w-48 md:w-64 h-48 md:h-64 text-primary animate-spin-slow" />
                                    </div>
                                </motion.div>
                            ))}
                            {/* End spacer */}
                            <div className="w-24 flex-shrink-0" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full h-full flex"
                        >
                            {/* List Sidebar */}
                            <div className="w-80 h-full border-r border-primary/10 pt-32 px-8 flex flex-col gap-8 bg-black/50 overflow-y-auto custom-scrollbar">
                                {['ux', 'vid', '3d'].map(cat => (
                                    <div key={cat} className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-primary" style={{ backgroundColor: CAT_COLOR[cat as keyof typeof CAT_COLOR] }} />
                                            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.3em]">{cat === 'ux' ? 'UI/UX_DESIGN' : cat === 'vid' ? 'MOTION_GRAPHICS' : '3D_CREATIVE'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {projects.filter(p => p.cat === cat).map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setSelectedProject(p)}
                                                    className={`group text-left p-3 rounded-lg border transition-all flex flex-col ${selectedProject?.id === p.id ? 'bg-primary border-primary text-black' : 'border-primary/10 hover:border-primary/40 text-primary/60 hover:text-primary'}`}
                                                >
                                                    <span className="text-[8px] font-mono opacity-60 mb-1">{p.id}</span>
                                                    <span className="text-[11px] font-bold leading-tight">{p.name}</span>
                                                    <span className="text-[9px] mt-1 opacity-50">{p.year}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Detail View */}
                            <div className="flex-1 h-full pt-32 px-12 overflow-y-auto custom-scrollbar bg-primary/2">
                                {selectedProject ? (
                                    <div className="max-w-3xl flex flex-col gap-12 pb-32">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">{selectedProject.cat}</span>
                                                <span className="text-primary/40 text-[10px] font-mono">{selectedProject.year}</span>
                                            </div>
                                            <h2 className="text-white text-4xl font-black tracking-tight">{selectedProject.name}</h2>
                                            <div className="flex gap-2">
                                                {selectedProject.roles.map((role: string) => (
                                                    <span key={role} className="text-[10px] text-primary/60 px-2 py-0.5 border border-primary/10 rounded-full">{role}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mockup Area */}
                                        <div className="aspect-video bg-black border border-primary/20 rounded-2xl overflow-hidden relative group">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 border-2 border-primary/40 rounded-full flex items-center justify-center animate-pulse">
                                                        <Maximize2 className="text-primary w-6 h-6" />
                                                    </div>
                                                    <span className="text-[10px] text-primary font-mono tracking-widest uppercase">Visualizing_Resource_Data...</span>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[8px] font-mono text-primary/30 uppercase tracking-tighter">
                                                <p>Buffer_ID: {selectedProject.id}_RENDER_v0.1</p>
                                                <p>Secure_Protocol: Enabled</p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="flex flex-col gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-40 border-b border-primary/10 pb-2">Background</h4>
                                                    <p className="text-primary/80 text-sm leading-relaxed">{selectedProject.desc.background}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-40 border-b border-primary/10 pb-2">Thinking Process</h4>
                                                    <p className="text-primary/80 text-sm leading-relaxed">{selectedProject.desc.thinking}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-6">
                                                <div className="flex flex-col gap-4">
                                                    <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-40 border-b border-primary/10 pb-2">Technical Meta</h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {Object.entries(selectedProject.meta).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between items-center border-b border-primary/5 py-1">
                                                                <span className="text-[10px] text-primary/40 uppercase">{k}</span>
                                                                <span className="text-xs text-primary/80 font-bold">{v as string}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-40 border-b border-primary/10 pb-2">Core Outcomes</h4>
                                                    <ul className="flex flex-col gap-2">
                                                        {selectedProject.outcomes.map((o: string, i: number) => (
                                                            <li key={i} className="flex items-center gap-3 text-xs text-primary/80">
                                                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                                {o}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-6 opacity-20">
                                            <Globe className="w-24 h-24 text-primary animate-pulse" />
                                            <span className="text-xl font-mono text-primary tracking-[0.5em] uppercase">Select_Node_To_Load</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 255, 178, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 178, 0.4);
        }
      `}</style>
        </div>
    );
}
