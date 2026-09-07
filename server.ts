import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_TASKS,
  INITIAL_TASK_MATRIX,
  INITIAL_NOTIFICATIONS,
  INITIAL_LOGIN_LOGS,
} from './src/data/mockData';

const app = express();
const PORT = 3000;

// Configuration paths for persistent database
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'system_database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'system_database.backup.json');

// Middleware for parsing JSON & raw text (used by navigator.sendBeacon)
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: ['text/plain', 'application/json'] }));

/**
 * Initialize persistent database file if not present
 */
function initializeDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const seedData = {
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
        urgentDispatches: [
          {
            id: 'dispatch-demo-01',
            taskId: 'task-001',
            taskCode: 'NV-2026-001',
            taskTitle: 'Tổ chức Hội nghị Phản biện xã hội đối với Dự thảo Quy hoạch phát triển kinh tế - xã hội tỉnh Bắc Ninh',
            senderId: 'user-14',
            senderName: 'Nguyễn Thị Hà',
            senderPosition: 'Chủ tịch',
            recipientId: 'user-02',
            recipientName: 'Nguyễn Thị Thanh Hoài',
            recipientEmail: 'hoaintt981@bacninh.gov.vn',
            recipientDepartment: 'Ban Dân chủ, Giám sát và Phản biện xã hội',
            urgentMessage: 'Yêu cầu đồng chí hoàn thiện hồ sơ đề cương phản biện trước 16h30 ngày mai để phục vụ Hội nghị Ban Thường trực.',
            dispatchedAt: new Date().toISOString(),
            emailDeliveryStatus: 'DELIVERED',
            isAcknowledgedOnLogin: false,
          }
        ],
        loginLogs: INITIAL_LOGIN_LOGS,
      };

      fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
      console.log(`[Máy Chủ] Cơ sở dữ liệu hệ thống đã được khởi tạo thành công tại: ${DB_FILE}`);
    } else {
      console.log(`[Máy Chủ] Đã nạp thành công cơ sở dữ liệu hệ thống từ: ${DB_FILE}`);
    }
  } catch (error) {
    console.error('[Máy Chủ] Lỗi khi khởi tạo cơ sở dữ liệu:', error);
  }
}

/**
 * Helper to safely read database
 */
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initializeDatabase();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('[Máy Chủ] Lỗi khi đọc file CSDL, thử nạp từ file dự phòng:', error);
    if (fs.existsSync(BACKUP_FILE)) {
      const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf-8');
      return JSON.parse(rawBackup);
    }
    throw error;
  }
}

/**
 * Helper to safely write database (with backup)
 */
function writeDatabase(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const payloadWithMeta = {
      ...data,
      version: 1,
      lastSavedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(payloadWithMeta, null, 2);

    // Save backup first if existing file is valid
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch (backupErr) {
        console.warn('[Máy Chủ] Không thể tạo file backup:', backupErr);
      }
    }

    // Atomic write using temporary file
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, jsonString, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);

    return payloadWithMeta;
  } catch (error) {
    console.error('[Máy Chủ] Lỗi khi ghi CSDL vào đĩa:', error);
    throw error;
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GovTask MTTQ Bắc Ninh API Server'
  });
});

// 2. Load system data
app.get('/api/data/load', (_req, res) => {
  try {
    const data = readDatabase();
    res.json({
      success: true,
      message: 'Tải dữ liệu từ máy chủ thành công',
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu từ máy chủ: ' + error.message,
    });
  }
});

// 3. Save system data (General Save / Auto-sync)
app.post('/api/data/save', (req, res) => {
  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        return res.status(400).json({ success: false, message: 'Dữ liệu JSON không hợp lệ' });
      }
    }

    if (!payload || (!payload.users && !payload.tasks)) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu hệ thống cơ bản' });
    }

    const currentData = readDatabase();
    const mergedData = {
      ...currentData,
      ...payload,
      lastSavedAt: new Date().toISOString(),
      lastSavedBy: payload.lastSavedBy || currentData.lastSavedBy || 'Người dùng hệ thống',
    };

    const saved = writeDatabase(mergedData);

    console.log(`[Máy Chủ] Đã lưu dữ liệu từ: ${saved.lastSavedBy} (${payload.tasks?.length || 0} nhiệm vụ, ${payload.users?.length || 0} tài khoản).`);

    res.json({
      success: true,
      message: 'Toàn bộ dữ liệu đã được lưu trữ an toàn vào máy chủ hệ thống.',
      savedAt: saved.lastSavedAt,
      stats: {
        users: saved.users?.length || 0,
        departments: saved.departments?.length || 0,
        tasks: saved.tasks?.length || 0,
        matrixCount: saved.taskMatrix?.length || 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi ghi dữ liệu máy chủ: ' + error.message,
    });
  }
});

// 4. Sign Out Sync (Dedicated Endpoint for User Logout)
app.post('/api/data/signout-sync', (req, res) => {
  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = {};
      }
    }

    const currentData = readDatabase();
    const mergedData = {
      ...currentData,
      ...payload,
      lastSavedAt: new Date().toISOString(),
      lastSavedBy: payload.lastSavedBy || 'Đăng xuất tài khoản',
      lastLogoutSyncAt: new Date().toISOString(),
    };

    const saved = writeDatabase(mergedData);

    console.log(`[Máy Chủ - ĐĂNG XUẤT] Người dùng đã đăng xuất. Toàn bộ dữ liệu phiên làm việc đã được lưu vĩnh viễn vào máy chủ vào lúc ${saved.lastSavedAt}.`);

    res.json({
      success: true,
      message: 'Toàn bộ dữ liệu phiên làm việc đã được lưu trữ vĩnh viễn vào máy chủ thành công khi đăng xuất.',
      savedAt: saved.lastSavedAt,
    });
  } catch (error: any) {
    console.error('[Máy Chủ - ĐĂNG XUẤT] Lỗi khi lưu dữ liệu lúc đăng xuất:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu trữ dữ liệu đăng xuất: ' + error.message,
    });
  }
});

// 5. System Status & Storage stats
app.get('/api/system/status', (_req, res) => {
  try {
    const exists = fs.existsSync(DB_FILE);
    let sizeBytes = 0;
    if (exists) {
      const stat = fs.statSync(DB_FILE);
      sizeBytes = stat.size;
    }
    const data = exists ? readDatabase() : null;

    res.json({
      success: true,
      storage: {
        databaseFile: DB_FILE,
        exists,
        sizeKB: Math.round(sizeBytes / 1024),
        usersCount: data?.users?.length || 0,
        departmentsCount: data?.departments?.length || 0,
        tasksCount: data?.tasks?.length || 0,
        lastSavedAt: data?.lastSavedAt || null,
        lastSavedBy: data?.lastSavedBy || null,
      },
      serverTime: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// VITE SPA MIDDLEWARE SETUP
// ----------------------------------------------------
async function startServer() {
  initializeDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GovTask MTTQ Bắc Ninh] Máy chủ đang hoạt động tại cổng http://0.0.0.0:${PORT}`);
  });
}

startServer();
