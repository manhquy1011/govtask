import { User, Department, Task, TaskMatrixItem, NotificationItem, UrgentDispatchReceipt, LoginAuditLog } from '../types';

export interface SystemDataPayload {
  users: User[];
  departments: Department[];
  tasks: Task[];
  taskMatrix: TaskMatrixItem[];
  notifications: NotificationItem[];
  urgentDispatches: UrgentDispatchReceipt[];
  loginLogs: LoginAuditLog[];
  lastSavedAt?: string;
  lastSavedBy?: string;
  actionNote?: string;
}

export interface ServerSaveResponse {
  success: boolean;
  message: string;
  savedAt?: string;
  stats?: {
    users?: number;
    departments?: number;
    tasks?: number;
  };
}

class ApiService {
  private isSaving = false;
  private pendingPayload: SystemDataPayload | null = null;
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Tải toàn bộ dữ liệu từ máy chủ (Vercel Serverless hoặc Express)
   */
  async loadServerData(): Promise<SystemDataPayload | null> {
    try {
      const response = await fetch('/api/data/load', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        console.warn(`[Vercel CSDL] Không thể tải dữ liệu từ máy chủ (HTTP ${response.status}). Dùng dữ liệu cục bộ.`);
        return null;
      }

      const res = await response.json();
      if (res.success && res.data) {
        console.log(`[Vercel CSDL] Đã nạp thành công dữ liệu máy chủ (${res.data.tasks?.length || 0} nhiệm vụ, ${res.data.users?.length || 0} cán bộ).`);
        return res.data as SystemDataPayload;
      }
      return null;
    } catch (err) {
      console.warn('[Vercel CSDL] Lỗi mạng khi kết nối máy chủ ban đầu:', err);
      return null;
    }
  }

  /**
   * Lưu toàn bộ dữ liệu vào máy chủ NGAY LẬP TỨC (Immediate Save)
   * Có cơ chế hàng đợi pendingPayload để nếu người dùng thao tác liên tục,
   * dữ liệu mới nhất luôn được gửi đi ngay sau khi yêu cầu hiện tại hoàn tất.
   */
  async saveServerData(data: SystemDataPayload): Promise<ServerSaveResponse> {
    if (this.isSaving) {
      // Đã có một yêu cầu đang gửi đi; lưu payload này vào hàng đợi để gửi ngay sau đó
      this.pendingPayload = data;
      return {
        success: true,
        message: 'Đang lưu vào hàng đợi đồng bộ Vercel...',
      };
    }

    this.isSaving = true;
    try {
      const response = await fetch('/api/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Máy chủ Vercel phản hồi mã lỗi: ${response.status}`);
      }

      const res: ServerSaveResponse = await response.json();
      console.log(`[Vercel CSDL] ✅ Đã lưu dữ liệu thành công lúc ${new Date().toLocaleTimeString('vi-VN')}: ${data.actionNote || 'Cập nhật thay đổi'}`);
      
      // Nếu trong lúc lưu có thêm thay đổi mới, tiếp tục gửi ngay
      if (this.pendingPayload) {
        const nextPayload = this.pendingPayload;
        this.pendingPayload = null;
        this.isSaving = false;
        return this.saveServerData(nextPayload);
      }

      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi lưu máy chủ';
      console.error('[Vercel CSDL] ❌ Lỗi khi lưu vào Vercel:', message);
      
      // Nếu có pendingPayload, reset cờ để lần sau vẫn tiếp tục lưu
      if (this.pendingPayload) {
        const nextPayload = this.pendingPayload;
        this.pendingPayload = null;
        this.isSaving = false;
        return this.saveServerData(nextPayload);
      }

      return {
        success: false,
        message,
      };
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Lưu dữ liệu với độ trễ cực ngắn (150ms debounce) cho các hành động nhập liệu liên tục (gõ văn bản)
   */
  saveServerDataDebounced(data: SystemDataPayload, callback?: (res: ServerSaveResponse) => void, delayMs = 150) {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(async () => {
      const res = await this.saveServerData(data);
      if (callback) callback(res);
    }, delayMs);
  }

  /**
   * Lưu toàn bộ dữ liệu khi người dùng Đăng xuất (Sign Out)
   * Sử dụng fetch với keepalive và fallback sang navigator.sendBeacon để đảm bảo 100% dữ liệu đến máy chủ
   */
  async syncOnSignOut(data: SystemDataPayload): Promise<boolean> {
    const payloadWithMeta: SystemDataPayload = {
      ...data,
      lastSavedAt: new Date().toISOString(),
      actionNote: 'Lưu toàn bộ cơ sở dữ liệu khi đăng xuất (Sign Out)',
    };

    const jsonString = JSON.stringify(payloadWithMeta);

    // 1. Thử gửi qua fetch với keepalive
    try {
      const fetchPromise = fetch('/api/data/signout-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        body: jsonString,
      });

      // 2. Đồng thời dùng sendBeacon làm chốt chặn an toàn nếu tab bị đóng đột ngột
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        navigator.sendBeacon('/api/data/save', blob);
      }

      const response = await fetchPromise;
      if (response.ok) {
        const res = await response.json();
        return res.success ?? true;
      }
      return true;
    } catch (err) {
      console.warn('[ApiService] Thử lưu máy chủ khi đăng xuất gặp sự cố, đã gửi qua Beacon:', err);
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        return navigator.sendBeacon('/api/data/save', blob);
      }
      return false;
    }
  }

  /**
   * Gửi dữ liệu khẩn cấp qua navigator.sendBeacon (cho beforeunload / visibilitychange)
   */
  sendBeaconSave(data: SystemDataPayload): boolean {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        return navigator.sendBeacon('/api/data/save', blob);
      } catch (err) {
        console.error('[ApiService] sendBeacon thất bại:', err);
        return false;
      }
    }
    return false;
  }
}

export const apiService = new ApiService();
