'use client';

import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="page active">
        <div className="page-header">
          <div>
            <div className="page-title">ANALYTICS</div>
            <div className="page-subtitle">PERFORMANCE DATA · VISITOR INSIGHTS</div>
          </div>
          <div className="page-actions">
            <button className="btn"><span>↓ EXPORT CSV</span></button>
          </div>
        </div>
        
        <div className="page-body">
          <div className="analytics-grid">

            <div className="panel analytics-panel">
              <div className="panel-head"><span>PROJECT PERFORMANCE</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="vis-bar-chart">
                    <AnalyticsBar label="카카오 인터랙션 개선" val={88} />
                    <AnalyticsBar label="앱 온보딩 리디자인" val={72} />
                    <AnalyticsBar label="디자인 시스템 구축" val={45} />
                    <AnalyticsBar label="AI 어드민 대시보드" val={94} />
                    <AnalyticsBar label="브랜드 3D 모션 인트로" val={58} />
                </div>
              </div>
            </div>

            <div className="panel" style={{ gridColumn: 'span 1' }}>
              <div className="panel-head"><span>TRAFFIC SOURCE</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="vis-bar-chart">
                    <AnalyticsBar label="DIRECT" val={42} />
                    <AnalyticsBar label="REFERRAL" val={28} />
                    <AnalyticsBar label="SEARCH" val={18} />
                    <AnalyticsBar label="SOCIAL" val={12} />
                </div>
              </div>
            </div>

            <div className="panel" style={{ gridColumn: 'span 1' }}>
              <div className="panel-head"><span>DEVICE TYPE</span><div className="panel-head-dot"></div></div>
              <div className="panel-body">
                <div className="vis-bar-chart">
                    <AnalyticsBar label="DESKTOP" val={75} />
                    <AnalyticsBar label="MOBILE" val={20} />
                    <AnalyticsBar label="TABLET" val={5} />
                </div>
              </div>
            </div>

          </div>
        </div>
    </div>
  );
}

function AnalyticsBar({ label, val }: { label: string, val: number }) {
    return (
        <div className="bar-row">
            <div className="bar-label">{label}</div>
            <div className="bar-track">
                <div className="bar-fill" style={{ width: `${val}%` }}></div>
            </div>
            <div className="bar-val">{val}%</div>
        </div>
    );
}
