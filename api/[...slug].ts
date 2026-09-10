import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Connection Pool for Vercel Serverless Postgres / Supabase
let pgPool: pg.Pool | null = null;

function getPgPool(): pg.Pool | null {
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.SUPABASE_POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) return null;

  if (!pgPool) {
    pgPool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pgPool;
}

let isPgTableEnsured = false;
async function ensurePgTable(pool: pg.Pool) {
  if (isPgTableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS govtask_system_storage (
        id VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isPgTableEnsured = true;
  } catch (err) {
    console.warn('[Vercel Serverless] Lỗi tạo bảng PostgreSQL / Supabase:', err);
  }
}

// In-memory fallback and /tmp file fallback for Vercel Serverless
const VERCEL_DATA_FILE = path.join('/tmp', 'mttq_system_database.json');

let memoryDatabase: any = null;

function getInitialData() {
  // Thử các đường dẫn chứa cơ sở dữ liệu hệ thống
  const candidatePaths = [
    path.join(process.cwd(), 'data', 'system_database.json'),
    path.join(process.cwd(), 'api', 'database.json'),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.tasks)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[Vercel Serverless] Không thể tải từ ${p}:`, err);
    }
  }

  return {
    version: 1,
    systemName: 'Remix GovTask - Cơ Quan Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh',
    createdAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
    lastSavedBy: 'Hệ thống tự động khởi tạo',
    users: [],
    departments: [],
    tasks: [],
    taskMatrix: [],
    notifications: [],
    urgentDispatches: [],
    loginLogs: [],
  };
}

/**
 * Đọc dữ liệu từ Supabase / PostgreSQL (nếu kết nối), Vercel KV, /tmp hoặc RAM
 */
async function loadData() {
  // 1. Kiểm tra Supabase / PostgreSQL nếu Vercel đã gắn POSTGRES_URL
  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePgTable(pool);
      const res = await pool.query('SELECT data FROM govtask_system_storage WHERE id = $1', ['govtask_mttq_db']);
      if (res.rows && res.rows.length > 0 && res.rows[0].data) {
        memoryDatabase = res.rows[0].data;
        return memoryDatabase;
      }
    } catch (pgErr) {
      console.warn('[Vercel Serverless] Lỗi đọc từ PostgreSQL / Supabase, thử fallback tiếp theo:', pgErr);
    }
  }

  // 2. Kiểm tra Vercel KV / Upstash Redis nếu được cấu hình
  const kvUrl = process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const kvRes = await fetch(`${kvUrl}/get/govtask_mttq_db`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      if (kvRes.ok) {
        const kvJson = await kvRes.json();
        if (kvJson.result) {
          const parsed = typeof kvJson.result === 'string' ? JSON.parse(kvJson.result) : kvJson.result;
          memoryDatabase = parsed;
          return parsed;
        }
      }
    } catch (kvErr) {
      console.warn('[Vercel Serverless] Không thể tải từ Vercel KV, dùng bộ nhớ cục bộ:', kvErr);
    }
  }

  // 3. Kiểm tra bộ nhớ RAM
  if (memoryDatabase) return memoryDatabase;

  // 4. Kiểm tra file tạm /tmp trên máy chủ Vercel
  try {
    if (fs.existsSync(VERCEL_DATA_FILE)) {
      const raw = fs.readFileSync(VERCEL_DATA_FILE, 'utf-8');
      memoryDatabase = JSON.parse(raw);
      return memoryDatabase;
    }
  } catch (err) {
    console.warn('[Vercel Serverless] Không đọc được /tmp, khởi tạo từ dữ liệu gốc:', err);
  }

  memoryDatabase = getInitialData();

  // Khởi tạo dữ liệu ban đầu vào Postgres nếu bảng trống
  if (pool && memoryDatabase) {
    try {
      await ensurePgTable(pool);
      await pool.query(
        `INSERT INTO govtask_system_storage (id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`,
        ['govtask_mttq_db', JSON.stringify(memoryDatabase)]
      );
      console.log('[Vercel Serverless] Khởi tạo dữ liệu ban đầu vào PostgreSQL / Supabase thành công!');
    } catch (seedErr) {
      console.warn('[Vercel Serverless] Không thể lưu dữ liệu khởi tạo vào PostgreSQL:', seedErr);
    }
  }

  return memoryDatabase;
}

/**
 * Lưu dữ liệu vào PostgreSQL / Supabase, Vercel KV, RAM và /tmp
 */
async function saveData(payload: any) {
  const current = await loadData();
  const merged = {
    ...current,
    ...payload,
    lastSavedAt: new Date().toISOString(),
    lastSavedBy: payload.lastSavedBy || 'Người dùng hệ thống',
  };
  memoryDatabase = merged;

  // 1. Ghi vĩnh viễn vào PostgreSQL / Supabase
  const pool = getPgPool();
  if (pool) {
    try {
      await ensurePgTable(pool);
      await pool.query(
        `INSERT INTO govtask_system_storage (id, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        ['govtask_mttq_db', JSON.stringify(merged)]
      );
      console.log('[Vercel Serverless] ✅ Đã lưu dữ liệu thành công vào PostgreSQL / Supabase!');
    } catch (pgErr) {
      console.warn('[Vercel Serverless] ❌ Lỗi ghi vào PostgreSQL / Supabase:', pgErr);
    }
  }

  // 2. Ghi vào file /tmp trên Vercel Serverless
  try {
    fs.writeFileSync(VERCEL_DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Vercel Serverless] Không ghi được /tmp:', err);
  }

  // 3. Ghi vĩnh viễn vào Vercel KV / Upstash Redis nếu có
  const kvUrl = process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/govtask_mttq_db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(merged),
      });
      console.log('[Vercel Serverless] Đã đồng bộ thành công vào Vercel KV!');
    } catch (kvErr) {
      console.warn('[Vercel Serverless] Lỗi ghi Vercel KV:', kvErr);
    }
  }

  return merged;
}

export default async function handler(req: IncomingMessage & { query?: any; body?: any }, res: ServerResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = req.url || '';

  // Parse Body for POST
  let bodyData: any = req.body;
  if (req.method === 'POST' && !bodyData) {
    bodyData = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      });
    });
  }

  if (url.includes('/api/health')) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok', runtime: 'Vercel Serverless' }));
    return;
  }

  if (url.includes('/api/data/load') || (req.method === 'GET' && url.includes('/api/data'))) {
    const data = await loadData();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      message: 'Tải dữ liệu máy chủ Vercel thành công',
      data,
    }));
    return;
  }

  if (url.includes('/api/data/save') || url.includes('/api/data/signout-sync') || (req.method === 'POST' && url.includes('/api/data'))) {
    const saved = await saveData(bodyData);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      message: 'Toàn bộ dữ liệu đã được lưu trữ thành công vào máy chủ Vercel.',
      savedAt: saved.lastSavedAt,
      stats: {
        users: saved.users?.length || 0,
        departments: saved.departments?.length || 0,
        tasks: saved.tasks?.length || 0,
        matrixCount: saved.taskMatrix?.length || 0,
      },
    }));
    return;
  }

  if (url.includes('/api/system/status')) {
    const data = await loadData();
    const hasPg = Boolean(getPgPool());
    const hasKv = Boolean(process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL);

    let storageEngine = 'Vercel Serverless File/RAM Store';
    if (hasPg) storageEngine = 'Supabase / Vercel PostgreSQL Database';
    else if (hasKv) storageEngine = 'Vercel KV (Persistent Redis)';

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      storageEngine,
      hasPg,
      hasKv,
      tasksCount: data?.tasks?.length || 0,
      usersCount: data?.users?.length || 0,
      lastSavedAt: data?.lastSavedAt || null,
      serverTime: new Date().toISOString(),
    }));
    return;
  }

  // Fallback status
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ success: true, service: 'GovTask Vercel Serverless API' }));
}

