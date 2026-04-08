/**
 * Dashboard Page
 * Main dashboard — Tempo-style layout with KPIs, charts, and data table
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store';
import { useDB } from '../database';
import { DashboardService } from '../database/DatabaseService';

// ── Helpers ────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `UGX ${(n / 1_000).toFixed(0)}K`;
  return `UGX ${n}`;
}

const FEE_SOURCE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#ef4444', '#06b6d4'];

// ── Main component ────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { isReady } = useDB();
  const [period, setPeriod] = useState<'30' | '90' | 'currentFY' | 'lastFY' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [chartHover, setChartHover] = useState<{ index: number; clientX: number; clientY: number } | null>(null);

  const handleChartHover = useCallback((info: { index: number; clientX: number; clientY: number } | null) => {
    setChartHover(info);
  }, []);

  const [donutHover, setDonutHover] = useState<{ index: number; clientX: number; clientY: number } | null>(null);

  const handleDonutHover = useCallback((info: { index: number; clientX: number; clientY: number } | null) => {
    setDonutHover(info);
  }, []);

  // ── Load real data from SQLite ────────────────────────────
  const kpis = useMemo(() => isReady ? DashboardService.getKPIs() : null, [isReady]);
  const revenuePoints = useMemo(() => isReady ? DashboardService.getRevenueFlow() : [], [isReady]);
  const rawFeeSources = useMemo(() => isReady ? DashboardService.getFeeSources() : [], [isReady]);

  const feeSources = useMemo(() =>
    rawFeeSources.map((s, i) => ({ ...s, color: FEE_SOURCE_COLORS[i % FEE_SOURCE_COLORS.length] })),
    [rawFeeSources]
  );

  const students = useMemo(() =>
    isReady ? DashboardService.getRecentStudents(search, 20) : [],
    [isReady, search]
  );

  const totalRevenue = useMemo(() => revenuePoints.reduce((s, p) => s + p.value, 0), [revenuePoints]);

  const collectionChange = kpis
    ? kpis.dailyCollectionsPrev > 0
      ? Math.round(((kpis.dailyCollections - kpis.dailyCollectionsPrev) / kpis.dailyCollectionsPrev) * 100)
      : 0
    : 0;

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: 24,
        }}
      >
        {/* Left: title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
        </div>

        {/* Center: period tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}
        >
          {([['30', '30 Days'], ['90', '3 Months'], ['currentFY', 'Current FY'], ['lastFY', 'Last FY'], ['all', 'All Time']] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setPeriod(v as '30' | '90' | 'currentFY' | 'lastFY' | 'all')}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: period === v ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: period === v ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 0 20px rgba(59,130,246,0.2)',
            }}
          >
            New
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <KPICard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>}
          title="Daily Collections"
          value={fmt(kpis?.dailyCollections ?? 0)}
          change={`${collectionChange >= 0 ? '+' : ''}${collectionChange}%`}
          positive={collectionChange >= 0}
          sub="Last 30 Days"
        />
        <KPICard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>}
          title="Active Students"
          value={(kpis?.activeStudents ?? 0).toLocaleString()}
          change={`${kpis?.newEnrollments ?? 0} new`}
          positive
          sub="Enrolled"
        />
        <KPICard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>}
          title="New Enrollments"
          value={String(kpis?.newEnrollments ?? 0)}
          change=""
          positive
          sub="Last 30 Days"
        />
        <KPICard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
          title="Collection Rate"
          value={`${kpis?.collectionRate ?? 0}%`}
          change=""
          positive={kpis ? kpis.collectionRate >= 80 : true}
          sub="Overall"
        />
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue Flow */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Revenue Flow</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>
          <div style={{ padding: '8px 24px 0' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(totalRevenue)}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Revenue</span>
              <span style={{ fontSize: 12, color: '#34d399' }}>{revenuePoints.length} months</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• Last 30 Days</span>
            </div>
          </div>
          {/* Chart area */}
          <div style={{ padding: '16px 24px 20px', position: 'relative' }}>
            <MiniLineChart data={revenuePoints} onHover={handleChartHover} />
            {/* Dynamic floating tooltip — follows cursor, positioned above */}
            {chartHover !== null && (() => {
              const pt = revenuePoints[chartHover.index];
              const prevValue = chartHover.index > 0 ? revenuePoints[chartHover.index - 1].value : null;
              const change = prevValue !== null ? pt.value - prevValue : null;
              const changePositive = change !== null && change >= 0;
              const fmtAmount = (v: number) => {
                if (v >= 1_000_000_000) return `UGX ${(v / 1_000_000_000).toFixed(1)}B`;
                if (v >= 1_000_000) return `UGX ${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `UGX ${(v / 1_000).toFixed(1)}K`;
                return `UGX ${v.toLocaleString()}`;
              };
              const fmtChange = (v: number) => {
                const abs = Math.abs(v);
                if (abs >= 1_000_000) return `${v >= 0 ? '+' : '-'}UGX ${(abs / 1_000_000).toFixed(1)}M`;
                if (abs >= 1_000) return `${v >= 0 ? '+' : '-'}UGX ${(abs / 1_000).toFixed(1)}K`;
                return `${v >= 0 ? '+' : '-'}UGX ${abs.toLocaleString()}`;
              };
              const maxValue = Math.max(...revenuePoints.map(d => d.value));
              const isRecord = pt.value === maxValue;
              const dateLabel = `${pt.month} 2025`;

              return (
                <div
                  style={{
                    position: 'fixed',
                    left: chartHover.clientX,
                    top: chartHover.clientY - 14,
                    transform: 'translateX(-50%) translateY(-100%)',
                    background: 'rgba(15, 29, 50, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--glass-border-hover)',
                    borderRadius: 12,
                    padding: '14px 18px',
                    maxWidth: 220,
                    minWidth: 190,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{dateLabel}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 8 }}>
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>{fmtAmount(pt.value)}</span>
                    {change !== null && (
                      <span style={{ color: changePositive ? '#34d399' : '#f87171' }}>{fmtChange(change)}</span>
                    )}
                  </div>
                  {isRecord && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>New Record Achieved!</div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {isRecord
                      ? `${pt.month} is the highest collection month with ${fmtAmount(pt.value)}.`
                      : change !== null
                        ? `${changePositive ? 'Increased' : 'Decreased'} by ${fmtChange(Math.abs(change)).replace(/^[+-]/, '')} from ${revenuePoints[chartHover.index - 1].month}.`
                        : `First recorded month of collections.`}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                    {revenuePoints.map((_, i) => (
                      <span
                        key={i}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: i === chartHover.index ? 'var(--text-primary)' : 'var(--text-muted)',
                          opacity: i === chartHover.index ? 1 : 0.35,
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Fee Sources Breakdown — donut */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Fee Sources Breakdown</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>···</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 32 }}>
            {/* Donut */}
            <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
              <DonutChart data={feeSources} onHover={handleDonutHover} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{donutHover !== null ? feeSources[donutHover.index].value.toLocaleString() : feeSources.reduce((s, f) => s + f.value, 0).toLocaleString()}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{donutHover !== null ? feeSources[donutHover.index].label : 'Total Students'}</span>
              </div>
            </div>
            {/* Donut hover tooltip — fixed above cursor */}
            {donutHover !== null && (() => {
              const seg = feeSources[donutHover.index];
              return (
                <div
                  style={{
                    position: 'fixed',
                    left: donutHover.clientX,
                    top: donutHover.clientY - 14,
                    transform: 'translateX(-50%) translateY(-100%)',
                    background: 'rgba(15, 29, 50, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--glass-border-hover)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    minWidth: 150,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{seg.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>{seg.value.toLocaleString()} students</span>
                    <span style={{ color: '#34d399' }}>{seg.pct}%</span>
                  </div>
                </div>
              );
            })()}

            {/* Legend */}
            <div style={{ flex: 1 }}>
              {feeSources.map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              margin: '0 24px 20px',
              padding: '10px 0',
              borderRadius: 10,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            More details →
          </div>
        </div>
      </div>

      {/* ── Students Table ───────────────────────────────────── */}
      <div className="card" style={{ padding: 0 }}>
        {/* Table header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{(kpis?.activeStudents ?? 0).toLocaleString()} Active Students</h3>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="input"
                placeholder="Search for a student…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, width: 200, height: 34, fontSize: 12 }}
              />
            </div>
            {/* Filter pills */}
            <FilterPill label="Class" />
            <FilterPill label="Status" />
            <FilterPill label="Term" />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Filter
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" style={{ accentColor: 'var(--primary)' }} /></th>
                <th>Name</th>
                <th>Class</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td><input type="checkbox" style={{ accentColor: 'var(--primary)' }} /></td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                  <td><ClassBadge cls={s.cls} /></td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{fmt(s.balance)}</td>
                  <td><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  sub: string;
}

function KPICard({ icon, title, value, change, positive, sub }: KPICardProps) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{title}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.15)',
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: positive ? '#34d399' : '#f87171' }}>{change}</span>
        <span style={{ color: 'var(--text-muted)' }}>• {sub}</span>
      </div>
    </div>
  );
}

function FilterPill({ label }: { label: string }) {
  return (
    <button
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '5px 12px', borderRadius: 8,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
      }}
    >
      {label}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; color: string }> = {
    Paid: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    Partial: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
    Overdue: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171' },
  };
  const s = map[status] ?? map.Paid;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 500,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      {status}
    </span>
  );
}

function ClassBadge({ cls }: { cls: string }) {
  const colors: Record<string, string> = {
    'S1 Red': '#f59e0b',
    'S2 Blue': '#3b82f6',
    'S3 Blue': '#3b82f6',
    'S4 Green': '#10b981',
    'S5 Green': '#10b981',
    'S6 Red': '#f59e0b',
  };
  const c = colors[cls] ?? '#60a5fa';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 500,
      background: `${c}22`, border: `1px solid ${c}44`, color: c,
    }}>
      {cls}
    </span>
  );
}

// ── SVG Mini-Charts ─────────────────────────────────────────────────

function MiniLineChart({ data, onHover }: { data: { month: string; value: number }[]; onHover?: (info: { index: number; clientX: number; clientY: number } | null) => void }) {
  const W = 520;
  const H = 160;
  const pad = { l: 40, r: 12, t: 8, b: 28 };
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value)) * 0.8;

  const pts = data.map((d, i) => {
    const x = pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const y = pad.t + (1 - (d.value - min) / (max - min)) * (H - pad.t - pad.b);
    return { x, y, ...d };
  });

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;

  // Y-axis labels
  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = min + ((max - min) * i) / yTicks;
    const y = pad.t + (1 - i / yTicks) * (H - pad.t - pad.b);
    return { v, y };
  });

  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    // Find the closest point by x-distance
    let closest = 0;
    let closestDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const dist = Math.abs(pts[i].x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }
    setActiveIdx(closest);
    if (onHover) {
      const pt = pts[closest];
      // Convert SVG x to pixel position relative to the chart container
      const clientX = rect.left + (pt.x / W) * rect.width;
      const clientY = rect.top + (pt.y / H) * rect.height;
      onHover({ index: closest, clientX, clientY });
    }
  };

  const handleMouseLeave = () => {
    setActiveIdx(null);
    if (onHover) onHover(null);
  };

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines + Y labels */}
      {yLabels.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.05)" />
          <text x={pad.l - 6} y={t.y + 4} textAnchor="end" fill="var(--text-muted)" fontSize="9">
            {t.v >= 1_000_000 ? `${(t.v / 1_000_000).toFixed(0)}M` : `${(t.v / 1_000).toFixed(0)}K`}
          </text>
        </g>
      ))}
      {/* Area + Line */}
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Vertical crosshair on hover */}
      {activeIdx !== null && (
        <line
          x1={pts[activeIdx].x} x2={pts[activeIdx].x}
          y1={pad.t} y2={H - pad.b}
          stroke="rgba(96,165,250,0.4)" strokeWidth="1" strokeDasharray="3,3"
        />
      )}
      {/* Dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={activeIdx === i ? 6 : 3.5}
          fill={activeIdx === i ? '#60a5fa' : '#3b82f6'}
          stroke="var(--bg-deep)"
          strokeWidth={activeIdx === i ? 3 : 2}
          style={{ transition: 'r 0.15s ease, fill 0.15s ease' }}
        />
      ))}
      {/* X labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 8} textAnchor="middle" fill={activeIdx === i ? 'var(--text-primary)' : 'var(--text-muted)'} fontSize="10" fontWeight={activeIdx === i ? 600 : 400}>
          {p.month}
        </text>
      ))}
    </svg>
  );
}

function DonutChart({ data, onHover }: { data: { label: string; value: number; color: string; pct: number }[]; onHover?: (info: { index: number; clientX: number; clientY: number } | null) => void }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const stroke = 18;
  const circ = 2 * Math.PI * r;
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Build cumulative angle boundaries for segment hit-testing
  const segBounds = React.useMemo(() => {
    let cum = 0;
    return data.map((d) => {
      const start = cum;
      cum += (d.pct / 100) * 360;
      return { start, end: cum };
    });
  }, [data]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * size - cx;
    const my = ((e.clientY - rect.top) / rect.height) * size - cy;
    const dist = Math.sqrt(mx * mx + my * my);
    const innerR = r - stroke / 2;
    const outerR = r + stroke / 2;
    if (dist < innerR || dist > outerR) {
      setActiveIdx(null);
      if (onHover) onHover(null);
      return;
    }
    // Angle from top, clockwise (matching SVG rotate(-90))
    let angle = Math.atan2(mx, -my) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    for (let i = 0; i < segBounds.length; i++) {
      if (angle >= segBounds[i].start && angle < segBounds[i].end) {
        setActiveIdx(i);
        if (onHover) onHover({ index: i, clientX: e.clientX, clientY: e.clientY });
        return;
      }
    }
    setActiveIdx(null);
    if (onHover) onHover(null);
  };

  const handleMouseLeave = () => {
    setActiveIdx(null);
    if (onHover) onHover(null);
  };

  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ cursor: 'crosshair' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {data.map((d, i) => {
        const dashLen = (d.pct / 100) * circ;
        const gap = circ - dashLen;
        const el = (
          <circle
            key={d.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={activeIdx === i ? stroke + 4 : stroke}
            strokeDasharray={`${dashLen} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-width 0.15s ease', opacity: activeIdx !== null && activeIdx !== i ? 0.5 : 1 }}
          />
        );
        offset += dashLen;
        return el;
      })}
    </svg>
  );
}
