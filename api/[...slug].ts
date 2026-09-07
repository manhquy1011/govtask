import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_TASKS,
  INITIAL_TASK_MATRIX,
  INITIAL_NOTIFICATIONS,
  INITIAL_LOGIN_LOGS,
} from '../src/data/mockData';

// In-memory fallback and /tmp file fallback for Vercel Serverless
const VERCEL_DATA_FILE = path.join('/tmp', 'mttq_system_database.json');

let memoryDatabase: any = null;

function getInitialData() {
  try {
    const localDbPath = path.join(process.cwd(), 'data', 'system_database.json');
    if (fs.existsSync(localDbPath)) {
      const parsed = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      if (parsed && parsed.users && parsed.tasks) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Vercel Serverless] Không tải được data/system_database.json:', err);
  }

  return {
    version: 1,
    systemName: 'Remix GovTask - Cơ Quan Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh',
    createdAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
    lastSavedBy: 'Hệ thống tự động khởi tạo',
    users: INITIAL_USERS,
    departments: INITIAL_DEPARTMENTS,
    tasks: INITIAL_TASKS,
    taskMatrix: INITIAL_TASK_MATRIX,
    notifications: INITIAL_NOTIFICATIONS,
    urgentDispatches: [],
    loginLogs: INITIAL_LOGIN_LOGS,
  };
}

/**
 * Đọc dữ liệu từ Vercel KV (nếu được kết nối) hoặc /tmp hoặc RAM
 */
async function loadData() {
  // 1. Kiểm tra Vercel KV / Upstash Redis nếu được cấu hình
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

  // 2. Kiểm tra bộ nhớ RAM
  if (memoryDatabase) return memoryDatabase;

  // 3. Kiểm tra file tạm /tmp trên máy chủ Vercel
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
  return memoryDatabase;
}

/**
 * Lưu dữ liệu vào Vercel KV (nếu có), đồng thời ghi vào RAM và /tmp
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

  // 1. Ghi vào file /tmp trên Vercel Serverless
  try {
    fs.writeFileSync(VERCEL_DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Vercel Serverless] Không ghi được /tmp:', err);
  }

  // 2. Ghi vĩnh viễn vào Vercel KV / Upstash Redis nếu có
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
    const hasKv = Boolean(process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      storageEngine: hasKv ? 'Vercel KV (Persistent Redis)' : 'Vercel Serverless File/RAM Store',
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
