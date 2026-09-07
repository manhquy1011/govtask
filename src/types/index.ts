export type UserRole = 'ADMIN' | 'AGENCY_LEAD' | 'DEPT_HEAD' | 'OFFICER';

export type Gender = 'NAM' | 'NU' | 'KHAC';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headUserId?: string;
  order: number;
}

export interface User {
  id: string;
  username: string;
  citizenId: string; // Số Căn cước công dân (12 chữ số) dùng để đăng nhập
  password?: string; // Mật khẩu đăng nhập hệ thống
  fullName: string;
  dateOfBirth?: string; // Ngày sinh (YYYY-MM-DD)
  gender?: Gender | string; // Giới tính (Nam, Nữ, Khác)
  email: string;
  phone: string; // Số điện thoại liên hệ
  avatar: string;
  departmentId: string;
  role: UserRole;
  position: string; // e.g. Giám đốc, Trưởng phòng, Chuyên viên chính...
  skills: string[];
  activeTaskCount: number;
  kpiScore: number;
  status: 'active' | 'inactive';
  lastPasswordResetAt?: string;
}

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 
  | 'PENDING'       // Chưa bắt đầu
  | 'IN_PROGRESS'   // Đang thực hiện
  | 'IN_REVIEW'     // Chờ phê duyệt / Báo cáo
  | 'COMPLETED'     // Đã hoàn thành
  | 'OVERDUE'       // Quá hạn
  | 'ON_HOLD';      // Tạm dừng

export type TaskGroup = 
  | 'FOCUS'         // Trọng tâm
  | 'REGULAR'       // Thường xuyên
  | 'URGENT_AD_HOC' // Đột xuất
  | 'PROJECT'       // Đề án / Dự án
  | 'ADMINISTRATIVE';// Hành chính quản trị

export type TaskMatrixGroup = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type TaskMatrixPoints = 1 | 2 | 3 | 4 | 5;

export interface TaskMatrixItem {
  id: string;
  code: string; // Mã danh mục ma trận (ví dụ: MT-N1-01)
  name: string; // 1. Tên nhiệm vụ
  departmentId: string; // 2. Phòng/ban thực hiện: 'ALL' (Cả cơ quan) hoặc ID phòng ban cụ thể
  taskGroup: TaskMatrixGroup; // 3. Nhóm nhiệm vụ: N1, N2, N3, N4, N5
  points: TaskMatrixPoints; // 4. Điểm nhiệm vụ: 1, 2, 3, 4, 5
  description?: string; // Diễn giải yêu cầu tiêu chuẩn
  standardCycle?: 'THUONG_XUYEN' | 'THANG' | 'QUY' | 'NAM' | 'DOT_XUAT';
  createdTasksCount?: number; // Số lượng nhiệm vụ đã giao từ mẫu ma trận này
  createdAt: string;
  updatedAt: string;
}

export interface TaskMilestone {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  weightPercent: number; // Tỷ trọng % của giai đoạn này trong tổng nhiệm vụ
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskActivityLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface Task {
  id: string;
  code: string; // Mã công việc / Văn bản (ví dụ: NV-2026-089)
  title: string;
  description: string;
  departmentId: string;
  creatorId: string;
  leadAssigneeId: string; // Người chủ trì chính
  collaboratorIds: string[]; // Danh sách người phối hợp thực hiện
  priority: TaskPriority;
  status: TaskStatus;
  group: TaskGroup;
  taskMatrixId?: string; // Liên kết tới mục trong Ma Trận Nhiệm Vụ
  matrixGroup?: TaskMatrixGroup; // Nhóm ma trận: N1, N2, N3, N4, N5
  matrixPoints?: TaskMatrixPoints; // Điểm ma trận: 1, 2, 3, 4, 5
  matrixDepartmentScope?: string; // 'ALL' hoặc ID phòng ban
  kpiPoints: number; // Điểm KPI thưởng/đánh giá (ví dụ: 10, 25, 50, 100)
  startDate: string;
  dueDate: string;
  completedAt?: string;
  progressPercent: number; // 0 - 100%
  milestones: TaskMilestone[];
  attachments: TaskAttachment[];
  reviewNote?: string;
  ratingScore?: number; // Đánh giá thực tế của Lãnh đạo khi duyệt (0-100%)
  remindedAt?: string;
  reminderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // Gửi đến ai ('all' hoặc userId)
  taskId?: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'ASSIGNMENT' | 'STATUS_CHANGE' | 'REVIEW_REQUEST' | 'KPI_AWARD';
  isRead: boolean;
  createdAt: string;
  isUrgentAlert?: boolean; // Khẩn cấp, hiển thị modal cảnh báo khi đăng nhập
  sendEmail?: boolean;
  senderEmail?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  senderPosition?: string;
  emailSentAt?: string;
  isAcknowledged?: boolean;
  acknowledgedAt?: string;
}

export interface UrgentDispatchReceipt {
  id: string;
  taskId: string;
  taskCode: string;
  taskTitle: string;
  senderId: string;
  senderName: string;
  senderPosition: string;
  senderEmail?: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientDepartment: string;
  urgentMessage: string;
  dispatchedAt: string;
  emailDeliveryStatus: 'SENT' | 'DELIVERED';
  isAcknowledgedOnLogin: boolean;
  acknowledgedAt?: string;
}

export interface LoginAuditLog {
  id: string;
  userId: string;
  userName: string;
  userPosition: string;
  departmentId: string;
  departmentName: string;
  citizenId: string;
  ipAddress: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  browser: string;
  loginMethod: 'CCCD' | 'SWITCHER' | 'AUTO_SESSION' | 'QUICK_LOGIN';
  status: 'SUCCESS' | 'FAILED';
  loginAt: string;
  lastActiveAt: string;
  sessionDurationMinutes?: number;
}

export interface UserOnlineStatus {
  userId: string;
  isOnline: boolean;
  lastActiveAt: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  ipAddress: string;
  loginCount: number;
}

export interface KPIRanking {
  userId: string;
  userName: string;
  userAvatar: string;
  departmentName: string;
  position: string;
  totalPoints: number;
  completedTasks: number;
  ontimeRate: number;
  overdueTasks: number;
}

export interface AutoAssignSuggestion {
  recommendedUserId: string;
  recommendedCollaboratorIds: string[];
  reason: string;
  score: number;
  departmentId: string;
  workloadStatus: 'LIGHT' | 'MODERATE' | 'HEAVY';
}
