'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [command, setCommand] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [clock, setClock] = useState('00:00:00');
  const [uptime, setUptime] = useState('00:00:00');
  const startRef = useRef<number>(0);
  useEffect(() => {
    startRef.current = Date.now();
    setTimeout(() => setIsMounted(true), 0);
    
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => console.log('Analytics synced', data))
      .catch(err => console.error('Analytics sync failed:', err));
    
    const clockTimer = setInterval(() => {
        setClock(new Date().toLocaleTimeString([], { hour12: false }));
        const diff = Math.floor((Date.now() - startRef.current) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        setUptime(`${h}:${m}:${s}`);
    }, 1000);

    return () => {
        clearInterval(clockTimer);
    };
  }, []);

  const handleCommand = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!command.trim()) return;
    if (command.toLowerCase() === 'help') alert('AVAILABLE: PROJECTS, ANALYTICS, DASHBOARD, LOGOUT');
    if (command.toLowerCase() === 'logout') router.push('/login');
    setCommand('');
  };

  if (!isMounted) return null;

  return (
    <div className="app">
      <div className="noise" />
      {/* ── HEADER ── */}
      <div className="header">
        <div className="header-left">
          <div className="sys-logo">GANYA_SYS</div>
          <div className="sys-version">v1.0.0</div>
          <div className="status-item"><div className="status-dot"></div>SYSTEM ONLINE</div>
          <div className="status-item"><div className="status-dot warn"></div>3 DRAFTS</div>
        </div>
        <div className="header-right">
          <div className="status-item">OP: <span style={{ color: 'var(--green)' }}>GANYA</span></div>
          <div className="header-clock">{clock}</div>
          <div className="header-mode">OPERATOR MODE</div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="body">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-head">NAVIGATION_TREE</div>

          <div className="nav-section">
            <div className="nav-label">MAIN</div>
            <Link href="/admin">
                <div className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}>
                    <span className="nav-icon">◈</span> DASHBOARD
                </div>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-label">CONTENT</div>
            <Link href="/admin/projects">
                <div className={`nav-item ${pathname === '/admin/projects' ? 'active' : ''}`}>
                    <span className="nav-icon">◆</span> PROJECTS
                    <span className="nav-badge">7</span>
                </div>
            </Link>
            <Link href="/admin/analytics">
                <div className={`nav-item ${pathname === '/admin/analytics' ? 'active' : ''}`}>
                    <span className="nav-icon">◉</span> ANALYTICS
                </div>
            </Link>
            <Link href="/admin/messages">
                <div className={`nav-item ${pathname === '/admin/messages' ? 'active' : ''}`}>
                    <span className="nav-icon">✉</span> SIGNAL_LOGS
                </div>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-label">SYSTEM</div>
            <div className="nav-item">
              <span className="nav-icon">▣</span> SETTINGS
            </div>
            <Link href="/login">
                <div className="nav-item">
                    <span className="nav-icon">◁</span> LOGOUT
                </div>
            </Link>
          </div>

          <div className="sidebar-footer">
            <div className="sys-info">
              <div>MEM &nbsp;<span style={{ color: 'var(--green2)' }}>68%</span></div>
              <div>DISK &nbsp;<span style={{ color: 'var(--green2)' }}>42%</span></div>
              <div>UPT &nbsp;<span>{uptime}</span></div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main">
            {children}
        </div>
      </div>

      {/* ── COMMAND BAR ── */}
      <div className="cmd-bar">
        <div className="cmd-prompt">GANYA_SYS &gt;</div>
        <form onSubmit={handleCommand} className="flex-1">
            <input 
                className="cmd-input" 
                value={command} 
                onChange={e => setCommand(e.target.value)}
                placeholder="type command... (help, create_project, publish, sync, clear)"
                autoFocus
            />
        </form>
        <div className="cmd-hint">TAB: AUTOCOMPLETE · ENTER: EXECUTE</div>
      </div>
    </div>
  );
}
