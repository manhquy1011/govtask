import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  Award,
  Users2,
  Clock,
  AlertCircle,
  Building2,
  Sparkles,
  HelpCircle,
  Table2,
  LogOut,
  RefreshCw,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    departments,
    userPermittedTasks,
    taskMatrix,
    notifications,
    unreadNotificationCount,
    canManageUsers,
    canViewAllAgency,
    logout,
    isServerSyncing,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const overdueCount = userPermittedTasks.filter(t => t.status === 'OVERDUE').length;
  const inReviewCount = userPermittedTasks.filter(t => t.status === 'IN_REVIEW').length;
  const currentDept = departments.find(d => d.id === currentUser.departmentId);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng Quan Điều Hành',
      icon: LayoutDashboard,
      badge: overdueCount > 0 ? `${overdueCount} khẩn` : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'tasks',
      label: 'Danh Sách Nhiệm Vụ',
      icon: ListTodo,
      badge: `${userPermittedTasks.length}`,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'reminders',
      label: 'Trung Tâm Nhắc Việc',
      icon: Clock,
      badge: unreadNotificationCount > 0 ? `${unreadNotificationCount}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'kanban',
      label: 'Bảng Tiến Độ (Dashboard)',
      icon: Kanban,
    },
    {
      id: 'kpi',
      label: 'Đánh Giá & Điểm KPI',
      icon: Award,
    },
    {
      id: 'matrix',
      label: 'Ma Trận Nhiệm Vụ',
      icon: Table2,
      badge: `${taskMatrix?.length || 0}`,
      badgeColor: 'bg-red-900/80 text-red-200 border border-red-700',
    },
    {
      id: 'users',
      label: 'Quản Lý Người Dùng & Phân Quyền',
      icon: Users2,
      adminOnly: true,
      tag: currentUser.role === 'ADMIN' ? 'Toàn quyền' : 'Phân cấp',
    },
  ];

  const renderSidebarInner = (isMobile: boolean) => (
    <>
      {/* Current Scope Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          <Building2 className="w-3.5 h-3.5 text-red-400" />
          <span>Phạm vi điều hành</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <p className="text-xs font-bold text-white leading-tight">
            {currentUser.role === 'AGENCY_LEAD'
              ? 'Thường Trực UB MTTQ Tỉnh (Toàn cơ quan)'
              : currentUser.role === 'ADMIN'
              ? 'Quản Trị Hệ Thống (Toàn cơ quan)'
              : currentUser.role === 'DEPT_HEAD'
              ? `Đơn vị: ${currentDept?.name}`
              : 'Nhiệm vụ cá nhân phụ trách'}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Nhiệm vụ kiểm soát:</span>
            <span className="font-bold text-emerald-400">{userPermittedTasks.length} việc</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-500 uppercase px-3 mb-2 tracking-wider">
          Chức Năng Chính
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={isMobile ? `mobile-nav-${item.id}` : `nav-${item.id}`}
              onClick={() => {
                setActiveTab(item.id as any);
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
                {item.tag && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.tag}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Status Summary & Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        {overdueCount > 0 && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300">Có {overdueCount} việc quá hạn</p>
              <p className="text-[11px] text-red-400 mt-0.5">Cần đôn đốc xử lý gấp</p>
            </div>
          </div>
        )}

        {/* Quick Logout Button */}
        <button
          id={isMobile ? 'btn-mobile-sidebar-logout' : 'btn-sidebar-logout'}
          onClick={() => {
            if (isMobile) setIsMobileMenuOpen(false);
            logout();
          }}
          disabled={isServerSyncing}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-rose-950 hover:text-rose-200 text-slate-200 text-xs font-bold border border-slate-700 hover:border-rose-700 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          title="Đăng xuất và tự động lưu toàn bộ dữ liệu vào máy chủ"
        >
          {isServerSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-300">Đang lưu máy chủ & đăng xuất...</span>
            </>
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Đăng xuất & Lưu máy chủ</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-in Mobile Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-200 flex flex-col h-full z-10 shadow-2xl">
            <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Danh Mục Điều Hành</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarInner(true)}
          </aside>
        </div>
      )}

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-200 flex-col shrink-0 min-h-[calc(100vh-4rem)]">
        {renderSidebarInner(false)}
      </aside>
    </>
  );
};

