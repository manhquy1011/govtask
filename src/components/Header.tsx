import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  ChevronDown,
  Shield,
  Building2,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  Award,
  CreditCard,
  Lock,
  LogIn,
  LogOut,
  Phone,
  Key,
  Activity,
  Radio,
  Menu,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    departments,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    switchUser,
    setIsCreateModalOpen,
    setIsSmartAssignModalOpen,
    setIsLoginModalOpen,
    setIsChangePasswordModalOpen,
    setIsLoginStatsModalOpen,
    onlineUserIds,
    totalLoginCount,
    setSelectedTaskId,
    setActiveTab,
    activeTab,
    canCreateTask,
    canViewAllAgency,
    logout,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const currentDept = departments.find(d => d.id === currentUser.departmentId);

  const handleGoToLoginStatsSection = () => {
    const scrollToTarget = () => {
      const el = document.getElementById('online-personnel-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-50/40');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-50/40');
        }, 2000);
      }
    };

    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setTimeout(scrollToTarget, 150);
    } else {
      scrollToTarget();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Quản trị hệ thống (Admin)', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'AGENCY_LEAD':
        return { label: 'Thường trực UB MTTQ Tỉnh (Chủ tịch / Phó Chủ tịch)', bg: 'bg-red-100 text-red-800 border-red-300' };
      case 'DEPT_HEAD':
        return { label: 'Lãnh đạo Ban / Văn phòng (Trưởng Ban / Chánh VP)', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'OFFICER':
        return { label: 'Chuyên viên chuyên trách', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 border-b border-red-950 sticky top-0 z-30 shadow-md min-h-[64px] sm:h-[80px] w-full text-white">
      <div className="w-full max-w-[1997px] mx-auto px-2 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between min-h-[64px] sm:h-[80px] py-2 sm:py-0">
          
          {/* Brand Logo & Name + Mobile Drawer Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-950 border border-red-500/40 text-white md:hidden shrink-0 transition-colors"
              aria-label="Mở danh mục điều hành"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 shrink-0">
              <img
                src="/logo-mat-tran-to-quoc-viet-nam-png.png"
                alt="Biểu trưng Ủy ban Mặt trận Tổ quốc Việt Nam"
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-md transition-transform hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-xs sm:text-base tracking-tight uppercase max-w-[140px] xs:max-w-[200px] sm:max-w-[350px] truncate drop-shadow-xs">
                  UB MTTQ VIỆT NAM TỈNH BẮC NINH
                </span>
              </div>
              <p className="text-[11px] text-red-100 hidden sm:block font-medium">
                Hệ Thống Quản Lý & Điều Hành Công Việc
              </p>
              <div className="mt-0.5 hidden xs:block">
                <button
                  type="button"
                  className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-red-950/70 text-amber-200 font-bold border border-amber-400/40 inline-flex items-center hover:bg-red-950 transition-colors cursor-default shadow-xs"
                >
                  Cơ Quan Nhà Nước
                </button>
              </div>
            </div>
          </div>

          {/* Action Tools & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Live Online & Login Stats Badge Button */}
            <button
              id="btn-login-stats"
              onClick={handleGoToLoginStatsSection}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-950/70 text-white text-xs font-semibold hover:bg-red-950/90 border border-red-500/40 transition-all shadow-inner cursor-pointer active:scale-95"
              title="Đi tới phần Thống kê số lượt đăng nhập (Cán bộ đang trực tuyến trên hệ thống)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-bold text-emerald-300">
                {onlineUserIds.length} <span className="font-normal text-emerald-200 hidden sm:inline">Online</span>
              </span>
              <span className="text-red-400 hidden md:inline">•</span>
              <span className="text-[11px] text-amber-300 font-mono hidden md:inline">
                {totalLoginCount} lượt đăng nhập
              </span>
            </button>

            {/* Smart AI Assignment Button */}
            {canCreateTask && (
              <button
                id="btn-smart-assign"
                onClick={() => setIsSmartAssignModalOpen(true)}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-bold transition-all shadow-sm active:scale-95 border border-amber-300"
                title="Đề xuất phân công nhân sự thông minh theo tải công việc & chuyên môn"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-900 fill-red-900/30 animate-pulse" />
                <span>Phân công thông minh</span>
              </button>
            )}

            {/* Create Task Button */}
            {canCreateTask && (
              <button
                id="btn-create-task"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white text-red-800 text-xs font-bold hover:bg-amber-50 hover:text-red-900 active:scale-95 transition-all shadow-md border border-white/80"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Giao việc mới</span>
                <span className="sm:hidden">Giao việc</span>
              </button>
            )}

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                id="btn-notification-bell"
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className="relative p-2 rounded-lg text-red-100 hover:text-white hover:bg-red-900/70 border border-transparent hover:border-red-500/40 focus:outline-none transition-colors"
                aria-label="Thông báo và nhắc việc"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-red-950 ring-2 ring-red-800 animate-bounce">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white text-slate-900 shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden border border-slate-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3.5 bg-gradient-to-r from-red-800 to-red-900 border-b border-red-950 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-amber-300" />
                      <span className="font-semibold text-sm text-white">Trung tâm nhắc việc & Thông báo</span>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-amber-200 hover:text-amber-100 font-medium underline"
                      >
                        Đã đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Chưa có thông báo nào.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.taskId) {
                              setSelectedTaskId(notif.taskId);
                            }
                            setIsNotifMenuOpen(false);
                          }}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-red-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <div className="mt-0.5 shrink-0">
                              {notif.type === 'REMINDER' && <Clock className="w-4 h-4 text-red-500" />}
                              {notif.type === 'ASSIGNMENT' && <UserCheck className="w-4 h-4 text-blue-500" />}
                              {notif.type === 'REVIEW_REQUEST' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                              {notif.type === 'KPI_AWARD' && <Award className="w-4 h-4 text-emerald-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold leading-snug ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('reminders');
                        setIsNotifMenuOpen(false);
                      }}
                      className="text-xs font-semibold text-red-700 hover:text-red-900"
                    >
                      Xem toàn bộ lịch sử nhắc việc &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role & Account Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-between p-1 sm:p-1.5 px-1.5 sm:px-2.5 rounded-lg bg-red-950/70 border border-red-500/40 hover:bg-red-950/90 transition-colors w-auto sm:w-[200px] text-white shadow-inner"
                title="Xem thông tin tài khoản CCCD / Chuyển đổi vai trò kiểm thử"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-amber-300/70 shrink-0"
                  />
                  <div className="text-left min-w-0 hidden sm:block">
                    <div className="text-xs font-bold text-white leading-tight truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-amber-200 leading-tight font-mono truncate">
                      CCCD: {currentUser.citizenId}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-200 shrink-0 ml-1" />
              </button>

              {/* Role Switcher Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-84 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-50 border border-slate-200 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Hồ Sơ Đăng Nhập
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 font-semibold">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-sm font-bold mt-1 text-white">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-300">{currentUser.position} • {currentDept?.name}</p>
                    
                    <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <CreditCard className="w-3 h-3 text-amber-400" />
                          <span>Số CCCD:</span>
                        </span>
                        <span className="font-mono font-bold text-amber-300">{currentUser.citizenId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Số điện thoại:</span>
                        </span>
                        <span className="font-semibold text-slate-200">{currentUser.phone || 'Chưa cập nhật'}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-700/80 space-y-1.5">
                      <button
                        type="button"
                        id="btn-open-change-password"
                        onClick={() => {
                          setIsChangePasswordModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Đổi mật khẩu tài khoản</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('users');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Quản lý hồ sơ công chức</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5 text-amber-300" />
                        <span>Đăng nhập tài khoản khác (CCCD)</span>
                      </button>

                      <button
                        type="button"
                        id="btn-logout"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-800/80 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all mt-1 shadow-xs"
                        title="Đăng xuất và tự động lưu toàn bộ dữ liệu vào máy chủ hệ thống"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Đăng Xuất & Lưu Máy Chủ</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
