import initSqlJs, { Database } from 'sql.js';
import { AppStorageState, MigrationStatus } from '../types';

let dbInstance: Database | null = null;
let SQL: any = null;

export async function getSqliteDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  try {
    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
    }
    const db: Database = new SQL.Database();
    initSchema(db);
    dbInstance = db;
    return dbInstance;
  } catch (err) {
    console.warn('sql.js wasm init error, falling back to simulated memory SQLite:', err);
    throw err;
  }
}

export function initSchema(db: Database) {
  const schema = `
    CREATE TABLE IF NOT EXISTS negocios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      categoria TEXT,
      telefono TEXT,
      whatsapp TEXT,
      correo TEXT,
      direccion TEXT,
      provincia TEXT,
      lat REAL,
      lng REAL,
      calificacion REAL
    );

    CREATE TABLE IF NOT EXISTS inventario (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      sku TEXT,
      categoria TEXT,
      precio_cup REAL,
      precio_usd REAL,
      stock INTEGER,
      unidad TEXT,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS transacciones (
      id TEXT PRIMARY KEY,
      fecha TEXT,
      tipo TEXT,
      concepto TEXT,
      monto REAL,
      moneda TEXT,
      pasarela TEXT,
      estado TEXT,
      referencia TEXT
    );

    CREATE TABLE IF NOT EXISTS microcreditos (
      id TEXT PRIMARY KEY,
      cliente TEXT,
      telefono TEXT,
      monto REAL,
      moneda TEXT,
      fecha_inicio TEXT,
      fecha_vencimiento TEXT,
      estado TEXT
    );

    CREATE TABLE IF NOT EXISTS blockchain_ledger (
      indice INTEGER PRIMARY KEY,
      timestamp TEXT,
      prev_hash TEXT,
      hash TEXT,
      nonce INTEGER,
      operacion TEXT,
      datos TEXT
    );
  `;
  db.run(schema);
}

export async function syncStateToSqlite(state: AppStorageState): Promise<{
  success: boolean;
  itemCount: number;
  dbBytes?: Uint8Array;
}> {
  try {
    const db = await getSqliteDatabase();

    // Populate or update tables
    db.run('BEGIN TRANSACTION;');

    for (const b of state.businesses) {
      db.run(
        `INSERT OR REPLACE INTO negocios VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [b.id, b.name, b.category, b.phone, b.whatsapp, b.email, b.address, b.province, b.lat, b.lng, b.rating]
      );
    }

    for (const p of state.products) {
      db.run(
        `INSERT OR REPLACE INTO inventario VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [p.id, p.name, p.sku, p.category, p.priceCup, p.priceUsd, p.stock, p.unit, p.description]
      );
    }

    for (const t of state.transactions) {
      db.run(
        `INSERT OR REPLACE INTO transacciones VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [t.id, t.date, t.type, t.concept, t.amount, t.currency, t.gateway, t.status, t.reference || '']
      );
    }

    for (const c of state.credits) {
      db.run(
        `INSERT OR REPLACE INTO microcreditos VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [c.id, c.clientName, c.phone, c.amount, c.currency, c.startDate, c.dueDate, c.status]
      );
    }

    for (const blk of state.blockchain) {
      db.run(
        `INSERT OR REPLACE INTO blockchain_ledger VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [blk.index, blk.timestamp, blk.previousHash, blk.hash, blk.nonce, blk.data.operation, JSON.stringify(blk.data.payload)]
      );
    }

    db.run('COMMIT;');

    const binaryArray = db.export();
    const itemCount =
      state.businesses.length +
      state.products.length +
      state.transactions.length +
      state.credits.length +
      state.blockchain.length;

    return {
      success: true,
      itemCount,
      dbBytes: binaryArray,
    };
  } catch (e) {
    console.error('SQLite synchronization error:', e);
    return {
      success: false,
      itemCount: 0,
    };
  }
}

export function generateSqlDumpScript(state: AppStorageState): string {
  let dump = `-- KuvaPlus SQLite Migration Dump: kba_mas.db
-- Exported on: ${new Date().toISOString()}
-- Architecture: Low-Bandwidth Dual Engine (JSON -> SQLite)

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS negocios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT,
  telefono TEXT,
  whatsapp TEXT,
  correo TEXT,
  direccion TEXT,
  provincia TEXT,
  lat REAL,
  lng REAL,
  calificacion REAL
);

CREATE TABLE IF NOT EXISTS inventario (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  sku TEXT,
  categoria TEXT,
  precio_cup REAL,
  precio_usd REAL,
  stock INTEGER,
  unidad TEXT,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS transacciones (
  id TEXT PRIMARY KEY,
  fecha TEXT,
  tipo TEXT,
  concepto TEXT,
  monto REAL,
  moneda TEXT,
  pasarela TEXT,
  estado TEXT,
  referencia TEXT
);

CREATE TABLE IF NOT EXISTS microcreditos (
  id TEXT PRIMARY KEY,
  cliente TEXT,
  telefono TEXT,
  monto REAL,
  moneda TEXT,
  fecha_inicio TEXT,
  fecha_vencimiento TEXT,
  estado TEXT
);

CREATE TABLE IF NOT EXISTS blockchain_ledger (
  indice INTEGER PRIMARY KEY,
  timestamp TEXT,
  prev_hash TEXT,
  hash TEXT,
  nonce INTEGER,
  operacion TEXT,
  datos TEXT
);
\n`;

  for (const b of state.businesses) {
    dump += `INSERT OR REPLACE INTO negocios VALUES ('${b.id}', '${escapeSql(b.name)}', '${escapeSql(b.category)}', '${escapeSql(b.phone)}', '${escapeSql(b.whatsapp)}', '${escapeSql(b.email)}', '${escapeSql(b.address)}', '${escapeSql(b.province)}', ${b.lat}, ${b.lng}, ${b.rating});\n`;
  }

  for (const p of state.products) {
    dump += `INSERT OR REPLACE INTO inventario VALUES ('${p.id}', '${escapeSql(p.name)}', '${escapeSql(p.sku)}', '${escapeSql(p.category)}', ${p.priceCup}, ${p.priceUsd}, ${p.stock}, '${escapeSql(p.unit)}', '${escapeSql(p.description)}');\n`;
  }

  for (const t of state.transactions) {
    dump += `INSERT OR REPLACE INTO transacciones VALUES ('${t.id}', '${t.date}', '${escapeSql(t.type)}', '${escapeSql(t.concept)}', ${t.amount}, '${t.currency}', '${escapeSql(t.gateway)}', '${escapeSql(t.status)}', '${escapeSql(t.reference || '')}');\n`;
  }

  for (const c of state.credits) {
    dump += `INSERT OR REPLACE INTO microcreditos VALUES ('${c.id}', '${escapeSql(c.clientName)}', '${escapeSql(c.phone)}', ${c.amount}, '${c.currency}', '${c.startDate}', '${c.dueDate}', '${escapeSql(c.status)}');\n`;
  }

  for (const blk of state.blockchain) {
    dump += `INSERT OR REPLACE INTO blockchain_ledger VALUES (${blk.index}, '${blk.timestamp}', '${blk.previousHash}', '${blk.hash}', ${blk.nonce}, '${escapeSql(blk.data.operation)}', '${escapeSql(JSON.stringify(blk.data.payload))}');\n`;
  }

  dump += `\nCOMMIT;\n`;
  return dump;
}

function escapeSql(str: string = ''): string {
  return str.replace(/'/g, "''");
}

export const sqliteManager = {
  async init() {
    return getSqliteDatabase();
  },
  async migrateFromJson(state: AppStorageState) {
    return syncStateToSqlite(state);
  },
  generateSqlDump(state: AppStorageState) {
    return generateSqlDumpScript(state);
  },
  async exportDatabaseFile(filename: string = 'kba_mas.db') {
    const db = await getSqliteDatabase();
    const data = db.export();
    const blob = new Blob([data as unknown as BlobPart], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
