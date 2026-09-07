import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import {
  User,
  Department,
  Task,
  NotificationItem,
  UserRole,
  TaskStatus,
  AutoAssignSuggestion,
  TaskMilestone,
  TaskAttachment,
  TaskMatrixItem,
  TaskMatrixGroup,
  TaskMatrixPoints,
  UrgentDispatchReceipt,
  LoginAuditLog
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TASK_MATRIX,
  INITIAL_LOGIN_LOGS
} from '../data/mockData';
import { apiService, SystemDataPayload } from '../services/apiService';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User;
  users: User[];
  departments: Department[];
  tasks: Task[];
  taskMatrix: TaskMatrixItem[];
  notifications: NotificationItem[];
  activeTab: 'dashboard' | 'tasks' | 'matrix' | 'kanban' | 'kpi' | 'users' | 'reminders';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'matrix' | 'kanban' | 'kpi' | 'users' | 'reminders') => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isSmartAssignModalOpen: boolean;
  setIsSmartAssignModalOpen: (open: boolean) => void;
  
  // Filters
  filterSearch: string;
  setFilterSearch: (s: string) => void;
  filterDepartment: string;
  setFilterDepartment: (d: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterPriority: string;
  setFilterPriority: (p: string) => void;
  filterGroup: string;
  setFilterGroup: (g: string) => void;
  filterAssignee: string;
  setFilterAssignee: (a: string) => void;
  resetFilters: () => void;

  // Visible filtered tasks based on user role & active filters
  visibleTasks: Task[];
  userPermittedTasks: Task[];

  // Actions
  switchUser: (userId: string) => void;
  createTask: (task: Omit<Task, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'reminderCount'>) => Task;
  updateTask: (taskId: string, data: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleMilestone: (taskId: string, milestoneId: string) => void;
  addMilestone: (taskId: string, milestone: Omit<TaskMilestone, 'id' | 'completed'>) => void;
  deleteMilestone: (taskId: string, milestoneId: string) => void;
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'uploadedAt'>) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
  sendUrgentReminder: (
    taskId: string,
    customMessage?: string,
    options?: { sendEmail?: boolean; recipientEmailOverride?: string; senderEmailOverride?: string; targetRecipientId?: string }
  ) => { success: boolean; receipt: UrgentDispatchReceipt; message: string };
  urgentDispatches: UrgentDispatchReceipt[];
  pendingUrgentAlert: UrgentDispatchReceipt | null;
  setPendingUrgentAlert: (alert: UrgentDispatchReceipt | null) => void;
  dismissUrgentAlert: (receiptId: string, openTaskModal?: boolean) => void;
  isDispatchModalOpen: boolean;
  setIsDispatchModalOpen: (open: boolean) => void;
  taskToDispatch: Task | null;
  setTaskToDispatch: (task: Task | null) => void;
  openUrgentDispatchModal: (task: Task) => void;
  approveTaskReview: (taskId: string, ratingScore: number, reviewNote: string) => void;
  
  // Task Matrix Actions
  createTaskMatrixItem: (item: Omit<TaskMatrixItem, 'id' | 'createdAt' | 'updatedAt' | 'createdTasksCount'>) => TaskMatrixItem;
  updateTaskMatrixItem: (id: string, data: Partial<TaskMatrixItem>) => void;
  deleteTaskMatrixItem: (id: string) => void;
  prefillTaskData: Partial<Task> | null;
  setPrefillTaskData: (data: Partial<Task> | null) => void;
  createTaskFromMatrix: (matrixItem: TaskMatrixItem) => void;

  // User Management Actions
  createUser: (user: Omit<User, 'id' | 'activeTaskCount' | 'kpiScore'>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, customNewPassword?: string) => { success: boolean; newPassword?: string; message: string };
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => { success: boolean; message: string };
  loginWithCitizenId: (citizenId: string, password: string) => { success: boolean; message: string; user?: User };
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  quickLoginAsUser: (userId: string) => void;
  logout: () => void;
  
  // Department Management
  createDepartment: (dept: Omit<Department, 'id' | 'order'> & { order?: number }) => Department;
  updateDepartment: (deptId: string, data: Partial<Department>) => void;
  deleteDepartment: (deptId: string, targetFallbackDeptId?: string) => { success: boolean; message: string };

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationCount: number;

  // Login Statistics & Online Tracking
  loginLogs: LoginAuditLog[];
  onlineUserIds: string[];
  totalLoginCount: number;
  getUserLoginCount: (userId: string) => number;
  getUserLastLogin: (userId: string) => LoginAuditLog | undefined;
  isUserOnline: (userId: string) => boolean;
  clearLoginLogs: () => void;
  isLoginStatsModalOpen: boolean;
  setIsLoginStatsModalOpen: (open: boolean) => void;

  // Smart AI Assignment
  getSmartAssignmentSuggestions: (
    title: string,
    description: string,
    departmentId: string,
    priority: string
  ) => AutoAssignSuggestion[];

  // Helper permission checks
  canCreateTask: boolean;
  canManageUsers: boolean;
  canViewAllAgency: boolean;
  canReviewTask: (task: Task) => boolean;
  canEditTask: (task: Task) => boolean;

  // Server Persistence & Sync
  isServerSyncing: boolean;
  lastServerSyncAt: string | null;
  serverSyncStatus: 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR';
  saveToServer: (customNote?: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'mttq_bacninh_users_v4',
  DEPTS: 'mttq_bacninh_depts_v4',
  TASKS: 'mttq_bacninh_tasks_v4',
  TASK_MATRIX: 'mttq_bacninh_task_matrix_v4',
  NOTIFS: 'mttq_bacninh_notifs_v4',
  URGENT_DISPATCHES: 'mttq_bacninh_urgent_dispatches_v4',
  CURRENT_USER_ID: 'mttq_bacninh_current_user_id_v4',
  LOGIN_LOGS: 'mttq_bacninh_login_logs_v4',
  IS_AUTHENTICATED: 'mttq_bacninh_is_authenticated_v4',
};

const INITIAL_URGENT_DISPATCHES: UrgentDispatchReceipt[] = [
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
    dispatchedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    emailDeliveryStatus: 'DELIVERED',
    isAcknowledgedOnLogin: false,
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from LocalStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEPTS);
      return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [taskMatrix, setTaskMatrix] = useState<TaskMatrixItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASK_MATRIX);
      return saved ? JSON.parse(saved) : INITIAL_TASK_MATRIX;
    } catch {
      return INITIAL_TASK_MATRIX;
    }
  });

  const [urgentDispatches, setUrgentDispatches] = useState<UrgentDispatchReceipt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.URGENT_DISPATCHES);
      return saved ? JSON.parse(saved) : INITIAL_URGENT_DISPATCHES;
    } catch {
      return INITIAL_URGENT_DISPATCHES;
    }
  });

  const [loginLogs, setLoginLogs] = useState<LoginAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGIN_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_LOGIN_LOGS;
    } catch {
      return INITIAL_LOGIN_LOGS;
    }
  });

  const [isLoginStatsModalOpen, setIsLoginStatsModalOpen] = useState(false);

  const [pendingUrgentAlert, setPendingUrgentAlert] = useState<UrgentDispatchReceipt | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [taskToDispatch, setTaskToDispatch] = useState<Task | null>(null);

  const [prefillTaskData, setPrefillTaskData] = useState<Partial<Task> | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (saved && users.some(u => u.id === saved)) return saved;
      return 'user-14'; // Default to Chủ tịch Nguyễn Thị Hà
    } catch {
      return 'user-14';
    }
  });

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'matrix' | 'kanban' | 'kpi' | 'users' | 'reminders'>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSmartAssignModalOpen, setIsSmartAssignModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Server persistence & sync state
  const [isServerSyncing, setIsServerSyncing] = useState<boolean>(false);
  const [lastServerSyncAt, setLastServerSyncAt] = useState<string | null>(null);
  const [serverSyncStatus, setServerSyncStatus] = useState<'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR'>('SYNCED');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadedRef = useRef<boolean>(false);

  // Filters state
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');

  // Initial load from server
  useEffect(() => {
    let isMounted = true;
    async function loadInitialServerData() {
      try {
        setIsServerSyncing(true);
        setServerSyncStatus('SYNCING');
        const serverData = await apiService.loadServerData();
        if (serverData && isMounted) {
          // Kiểm tra xem dữ liệu cục bộ (localStorage) có mới hơn dữ liệu server không
          const localSavedAtStr = localStorage.getItem('MTTQ_LAST_SAVED_AT');
          const localSavedTime = localSavedAtStr ? new Date(localSavedAtStr).getTime() : 0;
          const serverSavedTime = serverData.lastSavedAt ? new Date(serverData.lastSavedAt).getTime() : 0;

          // Nếu server mới hơn hoặc bằng local, nạp dữ liệu server vào ứng dụng
          if (serverSavedTime >= localSavedTime || !localSavedAtStr) {
            if (Array.isArray(serverData.users) && serverData.users.length > 0) {
              setUsers(serverData.users);
            }
            if (Array.isArray(serverData.departments) && serverData.departments.length > 0) {
              setDepartments(serverData.departments);
            }
            if (Array.isArray(serverData.tasks)) {
              setTasks(serverData.tasks);
            }
            if (Array.isArray(serverData.taskMatrix)) {
              setTaskMatrix(serverData.taskMatrix);
            }
            if (Array.isArray(serverData.notifications)) {
              setNotifications(serverData.notifications);
            }
            if (Array.isArray(serverData.urgentDispatches)) {
              setUrgentDispatches(serverData.urgentDispatches);
            }
            if (Array.isArray(serverData.loginLogs)) {
              setLoginLogs(serverData.loginLogs);
            }
            setLastServerSyncAt(serverData.lastSavedAt || new Date().toISOString());
            if (serverData.lastSavedAt) {
              localStorage.setItem('MTTQ_LAST_SAVED_AT', serverData.lastSavedAt);
            }
          } else {
            // Dữ liệu cục bộ mới hơn (do vừa thực hiện thay đổi ngoại tuyến): đồng bộ ngay lên máy chủ
            console.log('[AppContext] Phát hiện dữ liệu cục bộ mới hơn máy chủ Vercel, tiến hành đồng bộ lên Vercel ngay...');
            const now = new Date().toISOString();
            apiService.saveServerData({
              users,
              departments,
              tasks,
              taskMatrix,
              notifications,
              urgentDispatches,
              loginLogs,
              lastSavedAt: now,
              lastSavedBy: 'Hệ thống tự động đồng bộ bù',
              actionNote: 'Đồng bộ dữ liệu cục bộ mới nhất lên máy chủ Vercel',
            });
            setLastServerSyncAt(now);
          }

          setServerSyncStatus('SYNCED');
        } else if (isMounted) {
          setServerSyncStatus('SYNCED');
        }
      } catch (err) {
        console.warn('[AppContext] Không thể kết nối máy chủ ban đầu, dùng bộ nhớ cục bộ:', err);
        if (isMounted) setServerSyncStatus('OFFLINE');
      } finally {
        if (isMounted) {
          setIsServerSyncing(false);
          isInitialLoadedRef.current = true;
        }
      }
    }

    loadInitialServerData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tự động lưu tức thì vào máy chủ Vercel sau mỗi thao tác nhập/thay đổi
  useEffect(() => {
    if (!isInitialLoadedRef.current) return;

    // Bật ngay đèn báo hiệu đang đồng bộ
    setIsServerSyncing(true);
    setServerSyncStatus('SYNCING');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce 150ms: lưu ngay lập tức sau mỗi lần gõ phím/chuyển đổi trạng thái/phân công
    saveTimeoutRef.current = setTimeout(async () => {
      const now = new Date().toISOString();
      const payload: SystemDataPayload = {
        users,
        departments,
        tasks,
        taskMatrix,
        notifications,
        urgentDispatches,
        loginLogs,
        lastSavedAt: now,
        lastSavedBy: currentUser ? `${currentUser.fullName} (${currentUser.position})` : 'Hệ thống tự động',
        actionNote: 'Lưu tức thì vào máy chủ Vercel sau thay đổi dữ liệu',
      };

      try {
        const res = await apiService.saveServerData(payload);
        if (res.success) {
          setLastServerSyncAt(now);
          localStorage.setItem('MTTQ_LAST_SAVED_AT', now);
          setServerSyncStatus('SYNCED');
        } else {
          setServerSyncStatus('OFFLINE');
        }
      } catch {
        setServerSyncStatus('OFFLINE');
      } finally {
        setIsServerSyncing(false);
      }
    }, 150);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [users, departments, tasks, taskMatrix, notifications, urgentDispatches, loginLogs, currentUser]);

  // Lưu an toàn qua Beacon khi đóng tab hoặc chuyển tab (visibilitychange & beforeunload)
  useEffect(() => {
    const handleSaveEmergency = () => {
      const payload: SystemDataPayload = {
        users,
        departments,
        tasks,
        taskMatrix,
        notifications,
        urgentDispatches,
        loginLogs,
        lastSavedAt: new Date().toISOString(),
        lastSavedBy: currentUser ? currentUser.fullName : 'Trình duyệt chuyển trạng thái',
        actionNote: 'Lưu an toàn khi người dùng ẩn/đóng tab',
      };
      apiService.sendBeaconSave(payload);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSaveEmergency();
      }
    };

    window.addEventListener('beforeunload', handleSaveEmergency);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleSaveEmergency);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [users, departments, tasks, taskMatrix, notifications, urgentDispatches, loginLogs, currentUser]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASK_MATRIX, JSON.stringify(taskMatrix));
  }, [taskMatrix]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.URGENT_DISPATCHES, JSON.stringify(urgentDispatches));
  }, [urgentDispatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(loginLogs));
  }, [loginLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  // Check for unacknowledged urgent dispatches whenever user logs in or switches
  useEffect(() => {
    if (currentUserId) {
      const unacknowledged = urgentDispatches.find(
        d => d.recipientId === currentUserId && !d.isAcknowledgedOnLogin
      );
      if (unacknowledged) {
        setPendingUrgentAlert(unacknowledged);
      }
    }
  }, [currentUserId, urgentDispatches]);

  // Recalculate user active tasks whenever tasks change
  useEffect(() => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        const activeCount = tasks.filter(
          t => (t.leadAssigneeId === user.id || t.collaboratorIds.includes(user.id)) &&
               t.status !== 'COMPLETED'
        ).length;
        return { ...user, activeTaskCount: activeCount };
      })
    );
  }, [tasks]);

  // Automated Reminder Engine: Check overdue & upcoming deadlines
  useEffect(() => {
    const checkDeadlinesAndRemind = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const newNotifs: NotificationItem[] = [];

      tasks.forEach(task => {
        if (task.status === 'COMPLETED') return;

        const dueDate = new Date(task.dueDate);
        const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Check Overdue
        if (diffHours < 0 && task.status !== 'OVERDUE') {
          // Auto update status to OVERDUE if not already
          updateTask(task.id, { status: 'OVERDUE' });
          
          const notifExists = notifications.some(
            n => n.taskId === task.id && n.type === 'REMINDER' && n.title.includes('QUÁ HẠN')
          );
          if (!notifExists) {
            newNotifs.push({
              id: `notif-overdue-${task.id}-${Date.now()}`,
              userId: task.leadAssigneeId,
              taskId: task.id,
              title: `🚨 Nhiệm vụ quá hạn: ${task.code}`,
              message: `Nhiệm vụ "${task.title}" đã quá hạn vào ngày ${task.dueDate}. Vui lòng khẩn trương hoàn thành báo cáo!`,
              type: 'REMINDER',
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          }
        } 
        // Check Upcoming Deadline (within 48 hours)
        else if (diffHours > 0 && diffHours <= 48) {
          const notifExists = notifications.some(
            n => n.taskId === task.id && n.type === 'REMINDER' && n.message.includes('sắp đến hạn')
          );
          if (!notifExists) {
            newNotifs.push({
              id: `notif-upcoming-${task.id}-${Date.now()}`,
              userId: task.leadAssigneeId,
              taskId: task.id,
              title: `⏰ Nhắc nhở hạn chót: ${task.code}`,
              message: `Nhiệm vụ "${task.title}" sắp đến hạn hoàn thành (còn ${(diffHours / 24).toFixed(1)} ngày). Hãy rà soát các giai đoạn!`,
              type: 'REMINDER',
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      });

      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev]);
      }
    };

    checkDeadlinesAndRemind();
    const interval = setInterval(checkDeadlinesAndRemind, 60000); // scan every minute
    return () => clearInterval(interval);
  }, [tasks]);

  // Permission Logic
  const canViewAllAgency = currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD';
  const canManageUsers = currentUser.role === 'ADMIN';
  const canCreateTask = currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD' || currentUser.role === 'DEPT_HEAD';

  const canReviewTask = (task: Task): boolean => {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD') return true;
    if (currentUser.role === 'DEPT_HEAD' && currentUser.departmentId === task.departmentId) return true;
    return false;
  };

  const canEditTask = (task: Task): boolean => {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD') return true;
    if (currentUser.role === 'DEPT_HEAD' && currentUser.departmentId === task.departmentId) return true;
    if (task.leadAssigneeId === currentUser.id) return true;
    return false;
  };

  // Base permission tasks filter
  const userPermittedTasks = useMemo(() => {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD') {
      return tasks;
    }
    if (currentUser.role === 'DEPT_HEAD') {
      return tasks.filter(
        t => t.departmentId === currentUser.departmentId ||
             t.leadAssigneeId === currentUser.id ||
             t.collaboratorIds.includes(currentUser.id)
      );
    }
    // OFFICER role: strictly only tasks assigned to them as lead or collaborator
    return tasks.filter(
      t => t.leadAssigneeId === currentUser.id || t.collaboratorIds.includes(currentUser.id)
    );
  }, [currentUser, tasks]);

  // Apply UI Filters on top of permitted tasks
  const visibleTasks = useMemo(() => {
    return userPermittedTasks.filter(task => {
      // Search
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchCode = task.code.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDesc) return false;
      }
      // Department
      if (filterDepartment !== 'ALL' && task.departmentId !== filterDepartment) {
        return false;
      }
      // Status
      if (filterStatus !== 'ALL' && task.status !== filterStatus) {
        return false;
      }
      // Priority
      if (filterPriority !== 'ALL' && task.priority !== filterPriority) {
        return false;
      }
      // Group
      if (filterGroup !== 'ALL' && task.group !== filterGroup) {
        return false;
      }
      // Assignee
      if (filterAssignee !== 'ALL') {
        if (task.leadAssigneeId !== filterAssignee && !task.collaboratorIds.includes(filterAssignee)) {
          return false;
        }
      }
      return true;
    });
  }, [userPermittedTasks, filterSearch, filterDepartment, filterStatus, filterPriority, filterGroup, filterAssignee]);

  const resetFilters = () => {
    setFilterSearch('');
    setFilterDepartment('ALL');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
    setFilterGroup('ALL');
    setFilterAssignee('ALL');
  };

  const switchUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const dept = departments.find(d => d.id === targetUser.departmentId);
      const newLog: LoginAuditLog = {
        id: `log-${Date.now()}`,
        userId: targetUser.id,
        userName: targetUser.fullName,
        userPosition: targetUser.position,
        departmentId: targetUser.departmentId,
        departmentName: dept?.name || 'Cơ quan',
        citizenId: targetUser.citizenId,
        ipAddress: `113.190.${Math.floor(200 + Math.random() * 50)}.${Math.floor(10 + Math.random() * 80)}`,
        deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
        browser: 'Trình duyệt hệ thống',
        loginMethod: 'SWITCHER',
        status: 'SUCCESS',
        loginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        sessionDurationMinutes: Math.floor(15 + Math.random() * 90)
      };
      setLoginLogs(prev => [newLog, ...prev.slice(0, 100)]);
    }
    setCurrentUserId(userId);
  };

  const createTask = (taskData: Omit<Task, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'reminderCount'>): Task => {
    const nextNum = (tasks.length + 1).toString().padStart(3, '0');
    const code = `NV-2026-${nextNum}`;
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      code,
      reminderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    // Send assignment notification to leadAssignee and collaborators
    const newNotifications: NotificationItem[] = [
      {
        id: `notif-assign-${newTask.id}-${Date.now()}`,
        userId: newTask.leadAssigneeId,
        taskId: newTask.id,
        title: `📌 Bạn được giao chủ trì nhiệm vụ mới: ${code}`,
        message: `${currentUser.fullName} (${currentUser.position}) đã giao nhiệm vụ: "${newTask.title}". Hạn hoàn thành: ${newTask.dueDate}.`,
        type: 'ASSIGNMENT',
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    ];

    newTask.collaboratorIds.forEach(collabId => {
      if (collabId !== newTask.leadAssigneeId) {
        newNotifications.push({
          id: `notif-collab-${newTask.id}-${collabId}-${Date.now()}`,
          userId: collabId,
          taskId: newTask.id,
          title: `👥 Phối hợp thực hiện nhiệm vụ: ${code}`,
          message: `Bạn được phân công phối hợp thực hiện nhiệm vụ: "${newTask.title}".`,
          type: 'ASSIGNMENT',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setNotifications(prev => [...newNotifications, ...prev]);

    return newTask;
  };

  const updateTask = (taskId: string, data: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;

        const updated = {
          ...t,
          ...data,
          updatedAt: new Date().toISOString()
        };

        // Recalculate progress if milestones were updated
        if (data.milestones) {
          const totalWeight = data.milestones.reduce((acc, m) => acc + (m.weightPercent || 1), 0);
          const completedWeight = data.milestones
            .filter(m => m.completed)
            .reduce((acc, m) => acc + (m.weightPercent || 1), 0);
          
          const newProgress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
          updated.progressPercent = newProgress;

          if (newProgress === 100 && updated.status !== 'COMPLETED' && updated.status !== 'IN_REVIEW') {
            updated.status = 'IN_REVIEW';
          }
        }

        return updated;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setNotifications(prev => prev.filter(n => n.taskId !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const toggleMilestone = (taskId: string, milestoneId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedMilestones = task.milestones.map(m => {
      if (m.id === milestoneId) {
        const isNowCompleted = !m.completed;
        return {
          ...m,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return m;
    });

    updateTask(taskId, { milestones: updatedMilestones });
  };

  const addMilestone = (taskId: string, milestone: Omit<TaskMilestone, 'id' | 'completed'>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newMs: TaskMilestone = {
      ...milestone,
      id: `ms-${Date.now()}`,
      completed: false,
    };

    updateTask(taskId, { milestones: [...task.milestones, newMs] });
  };

  const deleteMilestone = (taskId: string, milestoneId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    updateTask(taskId, {
      milestones: task.milestones.filter(m => m.id !== milestoneId)
    });
  };

  const addAttachment = (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'uploadedAt'>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newAtt: TaskAttachment = {
      ...attachment,
      id: `att-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    updateTask(taskId, { attachments: [...(task.attachments || []), newAtt] });
  };

  const removeAttachment = (taskId: string, attachmentId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    updateTask(taskId, {
      attachments: (task.attachments || []).filter(a => a.id !== attachmentId)
    });
  };

  const openUrgentDispatchModal = (task: Task) => {
    setTaskToDispatch(task);
    setIsDispatchModalOpen(true);
  };

  const dismissUrgentAlert = (receiptId: string, openTaskModal = false) => {
    const receipt = urgentDispatches.find(d => d.id === receiptId);
    setUrgentDispatches(prev =>
      prev.map(d =>
        d.id === receiptId
          ? { ...d, isAcknowledgedOnLogin: true, acknowledgedAt: new Date().toISOString() }
          : d
      )
    );
    setPendingUrgentAlert(null);
    if (openTaskModal && receipt) {
      setSelectedTaskId(receipt.taskId);
    }
  };

  const sendUrgentReminder = (
    taskId: string,
    customMessage?: string,
    options?: { sendEmail?: boolean; recipientEmailOverride?: string; senderEmailOverride?: string; targetRecipientId?: string }
  ) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return {
        success: false,
        receipt: {} as UrgentDispatchReceipt,
        message: 'Không tìm thấy thông tin nhiệm vụ để đôn đốc.'
      };
    }

    const recipientUser = (options?.targetRecipientId ? users.find(u => u.id === options.targetRecipientId) : null) || users.find(u => u.id === task.leadAssigneeId);
    const recipientDept = departments.find(d => d.id === (recipientUser?.departmentId || task.departmentId));
    const targetEmail = options?.recipientEmailOverride?.trim() || recipientUser?.email || 'canbo.mttq@bacninh.gov.vn';
    const officialSenderEmail = options?.senderEmailOverride?.trim() || 'ubmttq@bacninh.gov.vn';
    const reminderMsg = customMessage?.trim() || `Lãnh đạo cơ quan yêu cầu khẩn trương đẩy nhanh tiến độ hoàn thành nhiệm vụ "${task.title}" (Hạn chót: ${task.dueDate}). Báo cáo kết quả xử lý ngay khi hoàn thành.`;

    updateTask(taskId, {
      reminderCount: (task.reminderCount || 0) + 1,
      remindedAt: new Date().toISOString().split('T')[0]
    });

    const receiptId = `dispatch-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const receipt: UrgentDispatchReceipt = {
      id: receiptId,
      taskId: task.id,
      taskCode: task.code,
      taskTitle: task.title,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderPosition: currentUser.position,
      senderEmail: officialSenderEmail,
      recipientId: recipientUser?.id || 'unknown',
      recipientName: recipientUser?.fullName || 'Cán bộ phụ trách',
      recipientEmail: targetEmail,
      recipientDepartment: recipientDept?.name || 'Cơ quan Ủy ban MTTQ Tỉnh',
      urgentMessage: reminderMsg,
      dispatchedAt: nowIso,
      emailDeliveryStatus: 'DELIVERED',
      isAcknowledgedOnLogin: false,
    };

    setUrgentDispatches(prev => [receipt, ...prev]);

    const targetUserId = recipientUser?.id || task.leadAssigneeId;
    const newNotif: NotificationItem = {
      id: `notif-urgent-${task.id}-${Date.now()}`,
      userId: targetUserId,
      taskId: task.id,
      title: `⚡ ĐÔN ĐỐC NHẮC VIỆC KHẨN TỪ LÃNH ĐẠO: ${task.code}`,
      message: reminderMsg,
      type: 'REMINDER',
      isRead: false,
      createdAt: nowIso,
      isUrgentAlert: true,
      sendEmail: options?.sendEmail !== false,
      senderEmail: officialSenderEmail,
      recipientEmail: targetEmail,
      recipientName: recipientUser?.fullName,
      senderName: currentUser.fullName,
      senderPosition: currentUser.position,
      emailSentAt: nowIso,
    };

    setNotifications(prev => [newNotif, ...prev]);

    // If active user is the recipient, immediately show the alert
    if (currentUserId === targetUserId) {
      setPendingUrgentAlert(receipt);
    }

    return {
      success: true,
      receipt,
      message: `Đã phát hành lệnh đôn đốc khẩn thành công! Đã gửi thông báo cảnh báo khi đăng nhập và gửi email từ ${officialSenderEmail} đến cán bộ: ${targetEmail}.`
    };
  };

  const approveTaskReview = (taskId: string, ratingScore: number, reviewNote: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    updateTask(taskId, {
      status: 'COMPLETED',
      progressPercent: 100,
      completedAt: new Date().toISOString().split('T')[0],
      ratingScore,
      reviewNote
    });

    // Add KPI score points to Lead Assignee
    setUsers(prev =>
      prev.map(u => {
        if (u.id === task.leadAssigneeId) {
          const earned = Math.round((task.kpiPoints || 20) * (ratingScore / 100));
          return { ...u, kpiScore: (u.kpiScore || 0) + earned };
        }
        return u;
      })
    );

    // Notify assignee
    const notif: NotificationItem = {
      id: `notif-complete-${taskId}-${Date.now()}`,
      userId: task.leadAssigneeId,
      taskId: task.id,
      title: `🎉 Nhiệm vụ đã được nghiệm thu hoàn thành: ${task.code}`,
      message: `Lãnh đạo đã đánh giá ${ratingScore} điểm cho nhiệm vụ "${task.title}". Nhận xét: "${reviewNote || 'Hoàn thành tốt'}"`,
      type: 'KPI_AWARD',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  // Task Matrix Actions
  const createTaskMatrixItem = (itemData: Omit<TaskMatrixItem, 'id' | 'createdAt' | 'updatedAt' | 'createdTasksCount'>): TaskMatrixItem => {
    const timestamp = new Date().toISOString();
    const prefix = itemData.departmentId === 'ALL' ? 'ALL' : (departments.find(d => d.id === itemData.departmentId)?.code || 'MT');
    const countInGroup = taskMatrix.filter(m => m.taskGroup === itemData.taskGroup).length + 1;
    const generatedCode = itemData.code?.trim() || `MT-${prefix}-${itemData.taskGroup}-${String(countInGroup).padStart(2, '0')}`;

    const newItem: TaskMatrixItem = {
      ...itemData,
      id: `tm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: generatedCode,
      createdTasksCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTaskMatrix(prev => [newItem, ...prev]);

    // Add notification
    const matrixNotif: NotificationItem = {
      id: `notif-tm-${Date.now()}`,
      userId: 'all',
      title: '📋 Cập nhật Ma Trận Nhiệm Vụ cơ quan',
      message: `Đã bổ sung nhiệm vụ "${newItem.name}" (${newItem.taskGroup} - ${newItem.points} điểm) vào Ma trận công tác.`,
      type: 'ASSIGNMENT',
      isRead: false,
      createdAt: timestamp,
    };
    setNotifications(prev => [matrixNotif, ...prev]);

    return newItem;
  };

  const updateTaskMatrixItem = (id: string, data: Partial<TaskMatrixItem>) => {
    const timestamp = new Date().toISOString();
    setTaskMatrix(prev =>
      prev.map(item => (item.id === id ? { ...item, ...data, updatedAt: timestamp } : item))
    );
  };

  const deleteTaskMatrixItem = (id: string) => {
    setTaskMatrix(prev => prev.filter(item => item.id !== id));
  };

  const createTaskFromMatrix = (matrixItem: TaskMatrixItem) => {
    // Determine mapped task group
    let mappedTaskGroup: any = 'REGULAR';
    if (matrixItem.taskGroup === 'N1') mappedTaskGroup = 'FOCUS';
    else if (matrixItem.taskGroup === 'N2') mappedTaskGroup = 'REGULAR';
    else if (matrixItem.taskGroup === 'N3') mappedTaskGroup = 'PROJECT';
    else if (matrixItem.taskGroup === 'N4') mappedTaskGroup = 'URGENT_AD_HOC';
    else if (matrixItem.taskGroup === 'N5') mappedTaskGroup = 'ADMINISTRATIVE';

    // Target department: if 'ALL', default to current user's dept or 'dept-van-phong'
    const targetDeptId = matrixItem.departmentId === 'ALL'
      ? (currentUser.departmentId || 'dept-van-phong')
      : matrixItem.departmentId;

    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);

    setPrefillTaskData({
      title: matrixItem.name,
      description: matrixItem.description || `Nhiệm vụ theo Ma trận chuẩn: Nhóm ${matrixItem.taskGroup} - Điểm đánh giá: ${matrixItem.points} điểm.`,
      departmentId: targetDeptId,
      group: mappedTaskGroup,
      taskMatrixId: matrixItem.id,
      matrixGroup: matrixItem.taskGroup,
      matrixPoints: matrixItem.points,
      matrixDepartmentScope: matrixItem.departmentId,
      kpiPoints: matrixItem.points * 20, // scale 1-5 to 20-100 pts
      priority: matrixItem.points >= 4 ? 'URGENT' : matrixItem.points >= 3 ? 'HIGH' : 'MEDIUM',
      dueDate: defaultDueDate.toISOString().split('T')[0],
    });

    // Update count in matrix
    setTaskMatrix(prev =>
      prev.map(m => (m.id === matrixItem.id ? { ...m, createdTasksCount: (m.createdTasksCount || 0) + 1 } : m))
    );

    setIsCreateModalOpen(true);
  };

  // User Management
  const createUser = (userData: Omit<User, 'id' | 'activeTaskCount' | 'kpiScore'>) => {
    if (currentUser.role !== 'ADMIN') {
      return;
    }
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      activeTaskCount: 0,
      kpiScore: 70,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    if (currentUser.role !== 'ADMIN') {
      return;
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)));
  };

  const deleteUser = (userId: string) => {
    if (currentUser.role !== 'ADMIN') {
      return;
    }
    if (users.length <= 1) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUserId === userId) {
      setCurrentUserId(users.find(u => u.id !== userId)?.id || 'user-01');
    }
  };

  const resetUserPassword = (userId: string, customNewPassword?: string) => {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Chỉ Quản trị viên (Admin) mới có quyền cấp lại mật khẩu.' };
    }
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Không tìm thấy người dùng trong hệ thống.' };
    }

    const generatedPassword = customNewPassword?.trim() || `MTTQ@${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedTime = new Date().toISOString();

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: generatedPassword, lastPasswordResetAt: updatedTime } : u))
    );

    // Add security notification
    const resetNotif: NotificationItem = {
      id: `notif-pwd-${Date.now()}`,
      userId: user.id,
      title: '🔐 Mật khẩu tài khoản đã được Quản trị viên cấp lại',
      message: `Quản trị viên đã cấp lại mật khẩu đăng nhập cho đồng chí. Mật khẩu mới: "${generatedPassword}". Vui lòng bảo mật thông tin.`,
      type: 'STATUS_CHANGE',
      isRead: false,
      createdAt: updatedTime,
    };
    setNotifications(prev => [resetNotif, ...prev]);

    return {
      success: true,
      newPassword: generatedPassword,
      message: `Đã cấp lại mật khẩu cho đồng chí ${user.fullName} thành công! Mật khẩu mới: ${generatedPassword}`
    };
  };

  const changePassword = (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!currentUser) {
      return { success: false, message: 'Vui lòng đăng nhập vào hệ thống để đổi mật khẩu.' };
    }

    if (!cleanCurrent) {
      return { success: false, message: 'Vui lòng nhập mật khẩu hiện tại của đồng chí.' };
    }

    const expectedPassword = currentUser.password || '123';
    if (cleanCurrent !== expectedPassword) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.' };
    }

    if (!cleanNew) {
      return { success: false, message: 'Vui lòng nhập mật khẩu mới.' };
    }

    if (cleanNew.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn thông tin.' };
    }

    if (cleanNew === cleanCurrent) {
      return { success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' };
    }

    if (cleanNew !== cleanConfirm) {
      return { success: false, message: 'Xác nhận mật khẩu mới không trùng khớp. Vui lòng nhập lại.' };
    }

    const updatedTime = new Date().toISOString();

    // Update in users list
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, password: cleanNew, lastPasswordResetAt: updatedTime } : u))
    );

    // Add security notification
    const pwdNotif: NotificationItem = {
      id: `notif-pwd-change-${Date.now()}`,
      userId: currentUser.id,
      title: '🔐 Đổi mật khẩu tài khoản thành công',
      message: `Đồng chí vừa đổi mật khẩu đăng nhập thành công vào lúc ${new Date().toLocaleTimeString('vi-VN')} ngày ${new Date().toLocaleDateString('vi-VN')}. Mật khẩu mới đã có hiệu lực trên toàn hệ thống.`,
      type: 'STATUS_CHANGE',
      isRead: false,
      createdAt: updatedTime,
    };
    setNotifications(prev => [pwdNotif, ...prev]);

    return {
      success: true,
      message: `Đổi mật khẩu thành công! Mật khẩu mới của đồng chí đã có hiệu lực.`
    };
  };

  const loginWithCitizenId = (citizenIdInput: string, passwordInput: string) => {
    const cleanCccd = citizenIdInput.trim();
    const cleanPwd = passwordInput.trim();

    if (!cleanCccd) {
      return { success: false, message: 'Vui lòng nhập số Căn cước công dân (12 chữ số).' };
    }
    if (!cleanPwd) {
      return { success: false, message: 'Vui lòng nhập mật khẩu đăng nhập.' };
    }

    const matchedUser = users.find(
      u => u.citizenId === cleanCccd || u.username.toLowerCase() === cleanCccd.toLowerCase()
    );

    if (!matchedUser) {
      return {
        success: false,
        message: 'Số Căn cước công dân hoặc tên đăng nhập không tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc liên hệ Quản trị viên.'
      };
    }

    if (matchedUser.status === 'inactive') {
      return {
        success: false,
        message: 'Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Quản trị viên cơ quan để kích hoạt.'
      };
    }

    const userPassword = matchedUser.password || '123456';
    if (userPassword !== cleanPwd) {
      return {
        success: false,
        message: 'Mật khẩu đăng nhập không chính xác! Quên mật khẩu? Vui lòng yêu cầu Quản trị viên reset mật khẩu.'
      };
    }

    // Success login
    const targetDept = departments.find(d => d.id === matchedUser.departmentId);
    const newLog: LoginAuditLog = {
      id: `log-${Date.now()}`,
      userId: matchedUser.id,
      userName: matchedUser.fullName,
      userPosition: matchedUser.position,
      departmentId: matchedUser.departmentId,
      departmentName: targetDept?.name || 'Cơ quan',
      citizenId: matchedUser.citizenId,
      ipAddress: `113.190.${Math.floor(200 + Math.random() * 50)}.${Math.floor(10 + Math.random() * 80)}`,
      deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
      browser: 'Xác thực CCCD (Bảo mật công vụ)',
      loginMethod: 'CCCD',
      status: 'SUCCESS',
      loginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      sessionDurationMinutes: Math.floor(20 + Math.random() * 80)
    };
    setLoginLogs(prev => [newLog, ...prev.slice(0, 100)]);

    setCurrentUserId(matchedUser.id);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    setIsLoginModalOpen(false);

    return {
      success: true,
      message: `Đăng nhập thành công! Xin chào đồng chí ${matchedUser.fullName} (${matchedUser.position}).`,
      user: matchedUser
    };
  };

  const quickLoginAsUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const dept = departments.find(d => d.id === targetUser.departmentId);
      const newLog: LoginAuditLog = {
        id: `log-${Date.now()}`,
        userId: targetUser.id,
        userName: targetUser.fullName,
        userPosition: targetUser.position,
        departmentId: targetUser.departmentId,
        departmentName: dept?.name || 'Cơ quan',
        citizenId: targetUser.citizenId,
        ipAddress: `113.190.${Math.floor(200 + Math.random() * 50)}.${Math.floor(10 + Math.random() * 80)}`,
        deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
        browser: 'Đăng nhập nhanh kiểm thử',
        loginMethod: 'QUICK_LOGIN',
        status: 'SUCCESS',
        loginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        sessionDurationMinutes: Math.floor(15 + Math.random() * 90)
      };
      setLoginLogs(prev => [newLog, ...prev.slice(0, 100)]);
    }
    setCurrentUserId(userId);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    setIsLoginModalOpen(false);
  };

  const logout = async () => {
    setIsServerSyncing(true);
    setServerSyncStatus('SYNCING');

    const logoutTime = new Date().toISOString();
    const updatedLogs: LoginAuditLog[] = [
      {
        id: `log-logout-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.fullName,
        citizenId: currentUser.citizenId,
        departmentName: departments.find(d => d.id === currentUser.departmentId)?.name || 'Cơ quan MTTQ',
        role: currentUser.role,
        action: 'LOGOUT',
        status: 'SUCCESS',
        ipAddress: '10.26.11.88',
        device: `${navigator.platform || 'Máy tính công vụ'} (Trình duyệt)`,
        loginAt: logoutTime,
        lastActiveAt: logoutTime,
        sessionDurationMinutes: 1,
      },
      ...loginLogs.slice(0, 99),
    ];
    setLoginLogs(updatedLogs);

    const payload: SystemDataPayload = {
      users,
      departments,
      tasks,
      taskMatrix,
      notifications,
      urgentDispatches,
      loginLogs: updatedLogs,
      lastSavedAt: logoutTime,
      lastSavedBy: `${currentUser.fullName} (${currentUser.position})`,
      actionNote: 'Người dùng đăng xuất - Toàn bộ dữ liệu hệ thống được đồng bộ an toàn vào máy chủ',
    };

    try {
      console.log('[GovTask] Đang lưu toàn bộ dữ liệu vào máy chủ khi đăng xuất...');
      await apiService.syncOnSignOut(payload);
      setLastServerSyncAt(logoutTime);
      setServerSyncStatus('SYNCED');
    } catch (err) {
      console.error('[GovTask] Lỗi khi lưu dữ liệu lên máy chủ lúc đăng xuất:', err);
    } finally {
      setIsServerSyncing(false);
      setIsAuthenticated(false);
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'false');
      setIsLoginModalOpen(false);
    }
  };

  const createDepartment = (deptData: Omit<Department, 'id' | 'order'> & { order?: number }): Department => {
    const newDept: Department = {
      ...deptData,
      id: `dept-${Date.now()}`,
      order: deptData.order ?? (departments.length + 1),
    };
    setDepartments(prev => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = (deptId: string, data: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === deptId ? { ...d, ...data } : d)));
  };

  const deleteDepartment = (deptId: string, targetFallbackDeptId?: string): { success: boolean; message: string } => {
    if (departments.length <= 1) {
      return {
        success: false,
        message: 'Không thể xóa phòng/ban cuối cùng của cơ quan! Hệ thống cần duy trì ít nhất 1 phòng ban/văn phòng.',
      };
    }

    const deptToDelete = departments.find(d => d.id === deptId);
    if (!deptToDelete) {
      return { success: false, message: 'Không tìm thấy phòng/ban cần xóa.' };
    }

    const remainingDepts = departments.filter(d => d.id !== deptId);
    const fallbackDept = remainingDepts.find(d => d.id === targetFallbackDeptId) || remainingDepts[0];

    // Reassign any users belonging to the deleted department
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.departmentId === deptId) {
          return { ...u, departmentId: fallbackDept.id };
        }
        return u;
      })
    );

    // Reassign any tasks belonging to this department
    setTasks(prevTasks =>
      prevTasks.map(t => {
        if (t.departmentId === deptId) {
          return { ...t, departmentId: fallbackDept.id };
        }
        return t;
      })
    );

    // Reassign any matrix items
    setTaskMatrix(prevMatrix =>
      prevMatrix.map(m => {
        if (m.departmentId === deptId) {
          return { ...m, departmentId: fallbackDept.id };
        }
        return m;
      })
    );

    // Remove department
    setDepartments(prev => prev.filter(d => d.id !== deptId));

    return {
      success: true,
      message: `Đã xóa phòng/ban "${deptToDelete.name}" thành công. Cán bộ và công việc trực thuộc đã được chuyển giao sang "${fallbackDept.name}".`,
    };
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(
      n => (n.userId === currentUser.id || n.userId === 'all') && !n.isRead
    ).length;
  }, [notifications, currentUser]);

  // Smart Auto-Assignment Suggestion Engine
  const getSmartAssignmentSuggestions = (
    title: string,
    description: string,
    departmentId: string,
    priority: string
  ): AutoAssignSuggestion[] => {
    const targetDeptUsers = users.filter(
      u => (departmentId === 'ALL' || u.departmentId === departmentId) && u.status === 'active'
    );

    const candidates = targetDeptUsers.length > 0 ? targetDeptUsers : users.filter(u => u.status === 'active');

    // Score candidates based on:
    // 1. Workload (fewer active tasks = higher score)
    // 2. KPI performance history
    // 3. Keyword/skill matching
    const query = `${title} ${description}`.toLowerCase();

    const scored = candidates.map(user => {
      let score = 50; // base score

      // Workload penalty: minus 10 pts per active task
      score -= user.activeTaskCount * 12;

      // KPI bonus: up to +25 pts
      score += Math.min(25, (user.kpiScore - 70) * 0.8);

      // Skill / keyword match bonus
      const matchedSkills = user.skills.filter(s =>
        query.includes(s.toLowerCase()) || query.includes(s.split(' ')[0].toLowerCase())
      );
      score += matchedSkills.length * 15;

      // Role appropriateness
      if (priority === 'URGENT' && (user.role === 'DEPT_HEAD' || user.position.includes('chính'))) {
        score += 10;
      }
      if (user.role === 'OFFICER') {
        score += 5; // Officers are primary implementers
      }

      let workloadStatus: 'LIGHT' | 'MODERATE' | 'HEAVY' = 'MODERATE';
      if (user.activeTaskCount <= 1) workloadStatus = 'LIGHT';
      else if (user.activeTaskCount >= 4) workloadStatus = 'HEAVY';

      let reason = '';
      if (matchedSkills.length > 0) {
        reason = `Phù hợp chuyên môn (${matchedSkills.join(', ')}). `;
      }
      if (workloadStatus === 'LIGHT') {
        reason += `Đang có tải công việc thấp (${user.activeTaskCount} việc).`;
      } else {
        reason += `Hiệu suất KPI cao (${user.kpiScore} điểm).`;
      }

      return {
        user,
        score: Math.max(10, Math.round(score)),
        reason,
        workloadStatus
      };
    });

    scored.sort((a, b) => b.score - a.score);

    // Pick top candidate and secondary collaborators
    return scored.map((item, idx) => {
      const otherTopCandidates = scored
        .filter(c => c.user.id !== item.user.id)
        .slice(0, 2)
        .map(c => c.user.id);

      return {
        recommendedUserId: item.user.id,
        recommendedCollaboratorIds: otherTopCandidates,
        reason: item.reason,
        score: item.score,
        departmentId: item.user.departmentId,
        workloadStatus: item.workloadStatus
      };
    });
  };

  // Login Statistics & Online User Calculations
  const onlineUserIds = useMemo(() => {
    // Current user is always online
    const onlineSet = new Set<string>([currentUserId]);
    
    // Check users who logged in or were active within the last 30 minutes in logs
    const now = Date.now();
    const thresholdMs = 30 * 60 * 1000;

    loginLogs.forEach(log => {
      if (log.status === 'SUCCESS') {
        const logTime = new Date(log.lastActiveAt || log.loginAt).getTime();
        if (now - logTime <= thresholdMs) {
          onlineSet.add(log.userId);
        }
      }
    });

    return Array.from(onlineSet);
  }, [currentUserId, loginLogs]);

  const totalLoginCount = useMemo(() => {
    return loginLogs.filter(l => l.status === 'SUCCESS').length;
  }, [loginLogs]);

  const getUserLoginCount = (userId: string): number => {
    return loginLogs.filter(l => l.userId === userId && l.status === 'SUCCESS').length;
  };

  const getUserLastLogin = (userId: string): LoginAuditLog | undefined => {
    return loginLogs.find(l => l.userId === userId && l.status === 'SUCCESS');
  };

  const isUserOnline = (userId: string): boolean => {
    return onlineUserIds.includes(userId);
  };

  const clearLoginLogs = () => {
    setLoginLogs([]);
  };

  const saveToServer = async (customNote?: string): Promise<boolean> => {
    setIsServerSyncing(true);
    setServerSyncStatus('SYNCING');
    try {
      const now = new Date().toISOString();
      const payload: SystemDataPayload = {
        users,
        departments,
        tasks,
        taskMatrix,
        notifications,
        urgentDispatches,
        loginLogs,
        lastSavedAt: now,
        lastSavedBy: currentUser ? `${currentUser.fullName} (${currentUser.position})` : 'Quản trị viên',
        actionNote: customNote || 'Chủ động lưu toàn bộ dữ liệu vào máy chủ CSDL',
      };
      const res = await apiService.saveServerData(payload);
      if (res.success) {
        setLastServerSyncAt(now);
        localStorage.setItem('MTTQ_LAST_SAVED_AT', now);
        setServerSyncStatus('SYNCED');
        return true;
      } else {
        setServerSyncStatus('ERROR');
        return false;
      }
    } catch {
      setServerSyncStatus('ERROR');
      return false;
    } finally {
      setIsServerSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        departments,
        tasks,
        taskMatrix,
        notifications,
        activeTab,
        setActiveTab,
        selectedTaskId,
        setSelectedTaskId,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isSmartAssignModalOpen,
        setIsSmartAssignModalOpen,
        filterSearch,
        setFilterSearch,
        filterDepartment,
        setFilterDepartment,
        filterStatus,
        setFilterStatus,
        filterPriority,
        setFilterPriority,
        filterGroup,
        setFilterGroup,
        filterAssignee,
        setFilterAssignee,
        resetFilters,
        visibleTasks,
        userPermittedTasks,
        switchUser,
        createTask,
        updateTask,
        deleteTask,
        toggleMilestone,
        addMilestone,
        deleteMilestone,
        addAttachment,
        removeAttachment,
        sendUrgentReminder,
        urgentDispatches,
        pendingUrgentAlert,
        setPendingUrgentAlert,
        dismissUrgentAlert,
        isDispatchModalOpen,
        setIsDispatchModalOpen,
        taskToDispatch,
        setTaskToDispatch,
        openUrgentDispatchModal,
        approveTaskReview,
        createTaskMatrixItem,
        updateTaskMatrixItem,
        deleteTaskMatrixItem,
        prefillTaskData,
        setPrefillTaskData,
        createTaskFromMatrix,
        createUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        changePassword,
        loginWithCitizenId,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        isAuthenticated,
        quickLoginAsUser,
        logout,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationCount,
        getSmartAssignmentSuggestions,
        loginLogs,
        onlineUserIds,
        totalLoginCount,
        getUserLoginCount,
        getUserLastLogin,
        isUserOnline,
        clearLoginLogs,
        isLoginStatsModalOpen,
        setIsLoginStatsModalOpen,
        canCreateTask,
        canManageUsers,
        canViewAllAgency,
        canReviewTask,
        canEditTask,
        isServerSyncing,
        lastServerSyncAt,
        serverSyncStatus,
        saveToServer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
