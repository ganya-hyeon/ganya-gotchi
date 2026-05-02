'use client';

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [projectStats, setProjectStats] = useState({ total: 0, done: 0, wip: 0 });

  useEffect(() => {
    // Fetch Visitor Count
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setVisitorCount(data.totalVisitors || 0))
      .catch(err => {
        console.error('Failed to load analytics:', err);
        setVisitorCount(0);
      });

    // Fetch Project Stats
    fetch('/api/projects')
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const done = data.filter(p => p.status === 'done').length;
          const wip = data.filter(p => p.status === 'wip').length;
          setProjectStats({ total: data.length, done, wip });
        }
      })
      .catch(err => console.error('Failed to load project stats:', err));
  }, []);

  return (
    <div className="page active">
        <div className="page-header">
          <div>
            <div className="page-title">DASHBOARD</div>
            <div className="page-subtitle">SYSTEM OVERVIEW · REAL-TIME STATUS</div>
          </div>
          <div className="page-actions">
            <button className="btn"><span>⟳ SYNC</span></button>
            <button className="btn primary"><span>+ NEW PROJECT</span></button>
          </div>
        </div>

        <div className="page-body">
          <div className="dash-grid">

            {/* STAT: 방문자 */}
            <div className="panel stat-panel">
              <div className="panel-head"><span>VISITORS</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="stat-num">{visitorCount}</div>
                <div className="stat-label">TOTAL VISITORS</div>
                <div className="stat-delta">↑ +24 THIS WEEK</div>
              </div>
            </div>

            {/* STAT: 프로젝트 */}
            <div className="panel stat-panel">
              <div className="panel-head"><span>PROJECTS</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="stat-num">{projectStats.total}</div>
                <div className="stat-label">TOTAL PROJECTS</div>
                <div className="stat-delta amber">{projectStats.wip} WIP · {projectStats.done} DONE</div>
              </div>
            </div>

            {/* STAT: EXP */}
            <div className="panel stat-panel">
              <div className="panel-head"><span>EXP TOTAL</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="stat-num glow">1240</div>
                <div className="stat-label">GROWTH POINTS</div>
                <div className="stat-delta">LV.4 · EVOLVING</div>
              </div>
            </div>

            {/* STAT: 체류시간 */}
            <div className="panel stat-panel">
              <div className="panel-head"><span>AVG SESSION</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="stat-num">4:32</div>
                <div className="stat-label">AVG TIME (MIN)</div>
                <div className="stat-delta">↑ +0:45 VS LAST WEEK</div>
              </div>
            </div>

            {/* ACTIVITY LOG */}
            <div className="panel activity-panel">
              <div className="panel-head"><span>ACTIVITY_LOG</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="log-list">
                    <LogEntry time="14:38" icon="ok" text='PROJECT "카카오 인터랙션" PUBLISHED' />
                    <LogEntry time="13:12" icon="ok" text='VISITOR COUNT UPDATED · +12' />
                    <LogEntry time="11:55" icon="warn" text='DRAFT "디자인 시스템" MODIFIED' />
                    <LogEntry time="10:30" icon="ok" text='SYNC COMPLETE · 7 ITEMS' />
                </div>
              </div>
            </div>

            {/* NODE STATUS */}
            <div className="panel node-panel">
              <div className="panel-head"><span>SYSTEM_NODE</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="node-grid">
                  <NodeItem label="CPU" val="32%" />
                  <NodeItem label="MEM" val="68%" warn />
                  <NodeItem label="DISK" val="42%" />
                  <NodeItem label="NET" val="15%" />
                </div>
              </div>
            </div>

            {/* ASCII 차트 */}
            <div className="panel chart-panel">
              <div className="panel-head"><span>VISITOR_GRAPH · 7D</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="ascii-chart">
{`30 |          .---.
25 |         /     \\
20 |    .---'       '---.
15 |   /                 \\
10 |  /                   \\
 5 | /                     \\
 0 |'-----------------------'
   M   T   W   T   F   S   S`}
                </div>
              </div>
            </div>

          </div>
        </div>
    </div>
  );
}

function LogEntry({ time, icon, text }: { time: string, icon: string, text: string }) {
    return (
        <div className="log-entry">
            <span className="log-time">{time}</span>
            <span className={`log-icon ${icon}`}>{icon === 'ok' ? '◈' : '◇'}</span>
            <span className="log-text">{text}</span>
        </div>
    );
}

function NodeItem({ label, val, warn }: { label: string, val: string, warn?: boolean }) {
    return (
        <div className="node-item">
            <div className="node-name">{label}</div>
            <div className="node-bar">
                <div className={`node-fill ${warn ? 'warn' : ''}`} style={{ width: val }}></div>
            </div>
            <div className="node-val" style={{ color: warn ? 'var(--amber)' : '' }}>{val}</div>
        </div>
    );
}
