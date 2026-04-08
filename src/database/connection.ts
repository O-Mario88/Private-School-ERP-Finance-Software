/**
 * SQLite Database Connection Manager
 * Uses sql.js (SQLite compiled to WebAssembly) for browser-based SQLite.
 * Persists the full database to IndexedDB for offline durability.
 */
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';

const IDB_NAME = 'maple_erp_storage';
const IDB_STORE = 'databases';
const IDB_KEY = 'maple_erp_main';

// ── IndexedDB persistence helpers ──────────────────────────────────

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIDB(): Promise<Uint8Array | null> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(IDB_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(data: Uint8Array): Promise<void> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const req = store.put(data, IDB_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromIDB(): Promise<void> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const req = store.delete(IDB_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Connection state ───────────────────────────────────────────────

let db: SqlJsDatabase | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize the SQLite database.
 * - Loads WASM binary for sql.js
 * - Attempts to restore from IndexedDB
 * - Falls back to a fresh database
 */
export async function initDatabase(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: () => `/sql-wasm.wasm`,
  });

  const saved = await loadFromIDB();
  if (saved) {
    db = new SQL.Database(saved);
    console.log('[MapleDB] Restored database from IndexedDB');
  } else {
    db = new SQL.Database();
    console.log('[MapleDB] Created fresh database');
  }

  // Configure SQLite pragmas for offline-first performance
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');
  db.run('PRAGMA cache_size = 10000;');
  db.run('PRAGMA temp_store = MEMORY;');
  db.run('PRAGMA synchronous = NORMAL;');

  return db;
}

/** Get the current database instance (throws if not initialized) */
export function getDatabase(): SqlJsDatabase {
  if (!db) throw new Error('[MapleDB] Database not initialized. Call initDatabase() first.');
  return db;
}

/** Debounced persist — saves to IndexedDB 500ms after last write */
export function persistDatabase(): void {
  if (!db) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!db) return;
    const data = db.export();
    saveToIDB(new Uint8Array(data)).catch(err =>
      console.error('[MapleDB] Persist failed:', err)
    );
  }, 500);
}

/** Force immediate save to IndexedDB */
export async function forcePersist(): Promise<void> {
  if (!db) return;
  if (saveTimer) clearTimeout(saveTimer);
  const data = db.export();
  await saveToIDB(new Uint8Array(data));
  console.log('[MapleDB] Force persisted to IndexedDB');
}

/** Delete the database and create a fresh one */
export async function resetDatabase(): Promise<SqlJsDatabase> {
  if (db) db.close();
  db = null;
  await deleteFromIDB();
  console.log('[MapleDB] Database reset');
  return initDatabase();
}

/** Check if a database exists in IndexedDB */
export async function hasExistingDatabase(): Promise<boolean> {
  const saved = await loadFromIDB();
  return saved !== null;
}

/** Get current database file size in bytes */
export function getDatabaseSize(): number {
  if (!db) return 0;
  return db.export().length;
}

/** Execute a write operation with automatic persistence */
export function execWrite(sql: string, params?: any[]): void {
  const database = getDatabase();
  if (params) {
    database.run(sql, params);
  } else {
    database.run(sql);
  }
  persistDatabase();
}

/** Execute a read query and return rows as objects */
export function execQuery<T = Record<string, any>>(sql: string, params?: any[]): T[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  if (params) stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

/** Execute a query and return the first row or null */
export function execQueryOne<T = Record<string, any>>(sql: string, params?: any[]): T | null {
  const rows = execQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/** Execute a scalar query (single value) */
export function execScalar<T = number>(sql: string, params?: any[]): T | null {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  if (params) stmt.bind(params);
  let result: T | null = null;
  if (stmt.step()) {
    const row = stmt.get();
    result = row[0] as T;
  }
  stmt.free();
  return result;
}

/** Run multiple statements in a transaction */
export function execTransaction(fn: () => void): void {
  const database = getDatabase();
  database.run('BEGIN TRANSACTION;');
  try {
    fn();
    database.run('COMMIT;');
    persistDatabase();
  } catch (err) {
    database.run('ROLLBACK;');
    throw err;
  }
}
