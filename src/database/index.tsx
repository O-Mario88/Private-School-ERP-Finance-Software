/**
 * MAPLE ERP — Database React Context & Provider
 * Initializes SQLite on app mount, runs schema + seed, and provides DB access.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initDatabase, resetDatabase, getDatabaseSize, forcePersist } from './connection';
import { applySchema } from './schema';
import { seedDatabase, isSeeded } from './seed';
import type { Database as SqlJsDatabase } from 'sql.js';

// ── Context ────────────────────────────────────────────────────────

interface DatabaseContextValue {
  db: SqlJsDatabase | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  dbSize: number;
  reset: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
  isLoading: true,
  error: null,
  dbSize: 0,
  reset: async () => {},
});

// ── Provider ───────────────────────────────────────────────────────

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbSize, setDbSize] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        console.log('[MapleDB] Booting database...');
        const database = await initDatabase();

        if (cancelled) return;

        // Apply schema (CREATE IF NOT EXISTS — safe to re-run)
        applySchema(database);
        console.log('[MapleDB] Schema applied');

        // Seed if empty
        if (!isSeeded(database)) {
          console.log('[MapleDB] Seeding database with sample data...');
          seedDatabase(database);
          await forcePersist();
          console.log('[MapleDB] Seed complete & persisted');
        } else {
          console.log('[MapleDB] Database already seeded');
        }

        if (cancelled) return;
        setDb(database);
        setDbSize(getDatabaseSize());
        setIsReady(true);
      } catch (err: any) {
        console.error('[MapleDB] Init failed:', err);
        if (!cancelled) setError(err.message || 'Database initialization failed');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  const reset = useCallback(async () => {
    setIsLoading(true);
    setIsReady(false);
    setError(null);
    try {
      const database = await resetDatabase();
      applySchema(database);
      seedDatabase(database);
      await forcePersist();
      setDb(database);
      setDbSize(getDatabaseSize());
      setIsReady(true);
    } catch (err: any) {
      setError(err.message || 'Database reset failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady, isLoading, error, dbSize, reset }}>
      {children}
    </DatabaseContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────

export function useDB() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDB must be used within <DatabaseProvider>');
  return ctx;
}

// ── Loading Screen Component ───────────────────────────────────────

export function DatabaseLoadingScreen({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0a0e1a', color: '#e2e8f0',
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>MAPLE School Finance ERP</div>
      {error ? (
        <>
          <div style={{ color: '#f87171', fontSize: 14, marginTop: 12 }}>
            Database Error: {error}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                marginTop: 16, padding: '8px 24px', borderRadius: 8,
                background: '#3b82f6', color: '#fff', border: 'none',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Retry
            </button>
          )}
        </>
      ) : (
        <>
          <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            Initializing offline database...
          </div>
          <div style={{
            width: 200, height: 3, background: '#1e293b',
            borderRadius: 4, marginTop: 24, overflow: 'hidden',
          }}>
            <div style={{
              width: '60%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              borderRadius: 4,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </>
      )}
    </div>
  );
}
