import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { User, LoginAuditLog } from '../types';
import {
  Activity,
  Users,
  Shield,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  CreditCard,
  Radio,
  FileSpreadsheet,
  Download,
  Trash2,
  X,
  Eye,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  Phone,
  Mail,
  Info,
  Check,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const LoginStatsModal: React.FC = () => {
  const {
    isLoginStatsModalOpen,
    setIsLoginStatsModalOpen,
    users,
    departments,
    loginLogs,
    onlineUserIds,
    totalLoginCount,
    getUserLoginCount,
    getUserLastLogin,
    isUserOnline,
    clearLoginLogs
  } = useApp();

  // Active tab: Default to 'users' for immediate individual login inspection
  const [activeTab, setActiveTab] = useState<'users' | 'overview' | 'logs'>('users');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'NEVER' | 'FREQUENT'>('ALL');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'ALL' | 'TODAY' | '3DAYS' | '7DAYS' | '30DAYS' | 'NEVER'>('ALL');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<'ALL' | 'DESKTOP' | 'MOBILE' | 'TABLET'>('ALL');
  const [sortBy, setSortBy] = useState<'LOGINS_DESC' | 'LOGINS_ASC' | 'RECENT_LOGIN' | 'OLDEST_LOGIN' | 'NAME_ASC'>('RECENT_LOGIN');

  // Selected User for Detailed Session Inspection Modal
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);

  // Helper for relative time in Vietnamese
  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Chưa có dữ liệu';
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'Chưa có dữ liệu';
    const diff = Date.now() - time;
    if (diff < 0) return 'Vừa xong';
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    const days = Math.floor(diff / 86400000);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  // Department login summary
  const deptStats = departments.map(dept => {
    const deptUsers = users.filter(u => u.departmentId === dept.id);
    const deptOnlineCount = deptUsers.filter(u => onlineUserIds.includes(u.id)).length;
    const deptTotalLogins = deptUsers.reduce((sum, u) => sum + getUserLoginCount(u.id), 0);
    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      totalUsers: deptUsers.length,
      onlineCount: deptOnlineCount,
      totalLogins: deptTotalLogins,
      onlineRate: deptUsers.length > 0 ? Math.round((deptOnlineCount / deptUsers.length) * 100) : 0
    };
  });

  // Device type breakdown
  const deviceCounts = {
    DESKTOP: loginLogs.filter(l => l.deviceType === 'DESKTOP').length,
    MOBILE: loginLogs.filter(l => l.deviceType === 'MOBILE').length,
    TABLET: loginLogs.filter(l => l.deviceType === 'TABLET').length,
  };

  const deviceChartData = [
    { name: 'Máy tính để bàn/Laptop', value: deviceCounts.DESKTOP, color: '#3B82F6' },
    { name: 'Điện thoại di động', value: deviceCounts.MOBILE, color: '#10B981' },
    { name: 'Máy tính bảng', value: deviceCounts.TABLET, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  // User Stats List
  const userStatsList = users.map(user => {
    const isOnline = onlineUserIds.includes(user.id);
    const count = getUserLoginCount(user.id);
    const lastLogin = getUserLastLogin(user.id);
    const dept = departments.find(d => d.id === user.departmentId);
    
    // User specific logs
    const userLogs = loginLogs.filter(l => l.userId === user.id || l.citizenId === user.citizenId);

    return {
      user,
      deptName: dept?.name || 'Văn phòng',
      deptCode: dept?.code || 'VP',
      isOnline,
      loginCount: count,
      lastLogin,
      userLogs
    };
  });

  // Filtered Users based on comprehensive leadership criteria
  const filteredUsers = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return userStatsList.filter(item => {
      // 1. Department Filter
      if (selectedDeptFilter !== 'ALL' && item.user.departmentId !== selectedDeptFilter) return false;

      // 2. Role Filter
      if (selectedRoleFilter !== 'ALL') {
        if (selectedRoleFilter === 'AGENCY_LEAD' && item.user.role !== 'AGENCY_LEAD' && item.user.role !== 'ADMIN') return false;
        if (selectedRoleFilter === 'DEPT_HEAD' && item.user.role !== 'DEPT_HEAD') return false;
        if (selectedRoleFilter === 'OFFICER' && item.user.role !== 'OFFICER') return false;
        if (selectedRoleFilter === 'ADMIN' && item.user.role !== 'ADMIN') return false;
      }

      // 3. Status Filter
      if (selectedStatusFilter === 'ONLINE' && !item.isOnline) return false;
      if (selectedStatusFilter === 'OFFLINE' && item.isOnline) return false;
      if (selectedStatusFilter === 'NEVER' && item.loginCount > 0) return false;
      if (selectedStatusFilter === 'FREQUENT' && item.loginCount < 5) return false;

      // 4. Time Filter (Last login time)
      if (selectedTimeFilter !== 'ALL') {
        if (selectedTimeFilter === 'NEVER') {
          if (item.lastLogin) return false;
        } else if (!item.lastLogin) {
          return false;
        } else {
          const lastTime = new Date(item.lastLogin.loginAt).getTime();
          const diffDays = (now - lastTime) / oneDay;
          if (selectedTimeFilter === 'TODAY' && diffDays > 1) return false;
          if (selectedTimeFilter === '3DAYS' && diffDays > 3) return false;
          if (selectedTimeFilter === '7DAYS' && diffDays > 7) return false;
          if (selectedTimeFilter === '30DAYS' && diffDays > 30) return false;
        }
      }

      // 5. Device Filter
      if (selectedDeviceFilter !== 'ALL') {
        if (!item.lastLogin || item.lastLogin.deviceType !== selectedDeviceFilter) return false;
      }

      // 6. Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = item.user.fullName.toLowerCase().includes(q);
        const matchCccd = item.user.citizenId?.toLowerCase().includes(q);
        const matchPos = item.user.position.toLowerCase().includes(q);
        const matchDept = item.deptName.toLowerCase().includes(q);
        const matchPhone = item.user.phone?.toLowerCase().includes(q);
        const matchEmail = item.user.email?.toLowerCase().includes(q);
        const matchIp = item.lastLogin?.ipAddress.toLowerCase().includes(q);
        if (!matchName && !matchCccd && !matchPos && !matchDept && !matchPhone && !matchEmail && !matchIp) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'LOGINS_DESC') return b.loginCount - a.loginCount;
      if (sortBy === 'LOGINS_ASC') return a.loginCount - b.loginCount;
      if (sortBy === 'RECENT_LOGIN') {
        const timeA = a.lastLogin ? new Date(a.lastLogin.loginAt).getTime() : 0;
        const timeB = b.lastLogin ? new Date(b.lastLogin.loginAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'OLDEST_LOGIN') {
        const timeA = a.lastLogin ? new Date(a.lastLogin.loginAt).getTime() : 0;
        const timeB = b.lastLogin ? new Date(b.lastLogin.loginAt).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === 'NAME_ASC') {
        return a.user.fullName.localeCompare(b.user.fullName, 'vi');
      }
      return 0;
    });
  }, [userStatsList, selectedDeptFilter, selectedRoleFilter, selectedStatusFilter, selectedTimeFilter, selectedDeviceFilter, searchTerm, sortBy]);

  // Filtered Logs for Tab 3
  const filteredLogs = useMemo(() => {
    return loginLogs.filter(log => {
      if (selectedDeptFilter !== 'ALL' && log.departmentId !== selectedDeptFilter) return false;
      if (selectedDeviceFilter !== 'ALL' && log.deviceType !== selectedDeviceFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = log.userName.toLowerCase().includes(q);
        const matchCccd = log.citizenId.toLowerCase().includes(q);
        const matchIp = log.ipAddress.toLowerCase().includes(q);
        const matchDept = log.departmentName.toLowerCase().includes(q);
        if (!matchName && !matchCccd && !matchIp && !matchDept) return false;
      }
      return true;
    });
  }, [loginLogs, selectedDeptFilter, selectedDeviceFilter, searchTerm]);

  const onlineTotalCount = onlineUserIds.length;
  const onlineRate = users.length > 0 ? Math.round((onlineTotalCount / users.length) * 100) : 0;

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDeptFilter('ALL');
    setSelectedRoleFilter('ALL');
    setSelectedStatusFilter('ALL');
    setSelectedTimeFilter('ALL');
    setSelectedDeviceFilter('ALL');
    setSortBy('RECENT_LOGIN');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Họ và tên', 'Số CCCD', 'Chức vụ', 'Phòng ban / Đơn vị', 'Trạng thái', 'Tổng lượt đăng nhập', 'Thời gian đăng nhập cuối', 'Thiết bị', 'Địa chỉ IP', 'Số điện thoại', 'Email'];
    const rows = filteredUsers.map(u => [
      `"${u.user.fullName}"`,
      `"${u.user.citizenId}"`,
      `"${u.user.position}"`,
      `"${u.deptName}"`,
      `"${u.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}"`,
      u.loginCount,
      `"${u.lastLogin ? new Date(u.lastLogin.loginAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}"`,
      `"${u.lastLogin?.deviceType || '-'}"`,
      `"${u.lastLogin?.ipAddress || '-'}"`,
      `"${u.user.phone || '-'}"`,
      `"${u.user.email || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thong_ke_dang_nhap_chi_tiet_mttq_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // User inspection details
  const inspectingUserData = useMemo(() => {
    if (!inspectingUser) return null;
    return userStatsList.find(item => item.user.id === inspectingUser.id);
  }, [inspectingUser, userStatsList]);

  if (!isLoginStatsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4 max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 via-slate-900 to-slate-900 text-white relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Trung Tâm Giám Sát Truy Cập & Quản Lý Cán Bộ
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Thời Gian Thực</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Bảng Thống Kê Chi Tiết Lượt Đăng Nhập & Cán Bộ Trực Tuyến
              </h2>
              <p className="text-xs text-slate-300">
                Ủy ban MTTQ Việt Nam tỉnh Bắc Ninh • Theo dõi thời gian đăng nhập, thiết bị và lịch sử truy cập của từng tài khoản
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              title="Xuất báo cáo danh sách và thời gian đăng nhập ra file Excel/CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo CSV</span>
            </button>

            <button 
              onClick={() => setIsLoginStatsModalOpen(false)}
              className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Tổng Lượt Đăng Nhập</span>
              <Activity className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalLoginCount}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Ghi nhận trên toàn hệ thống</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
              <span className="font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Đang Trực Tuyến</span>
              </span>
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {onlineTotalCount} <span className="text-xs font-normal text-slate-500">/ {users.length} cán bộ</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Tỷ lệ trực tuyến: {onlineRate}%</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Cán Bộ Phù Hợp Lọc</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-700">
              {filteredUsers.length} <span className="text-xs font-normal text-slate-500">/ {users.length} tài khoản</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{departments.length} Ban & Văn phòng</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Cơ Cấu Thiết Bị</span>
              <Laptop className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-sm font-bold text-slate-800 flex items-center space-x-2 mt-1">
              <span className="inline-flex items-center text-[11px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {deviceCounts.DESKTOP} PC
              </span>
              <span className="inline-flex items-center text-[11px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                {deviceCounts.MOBILE} Mobile
              </span>
              <span className="inline-flex items-center text-[11px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                {deviceCounts.TABLET} Tablet
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Bảo mật chuẩn Căn cước công dân</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-5 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-red-600 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Thống Kê Từng Tài Khoản & Thời Gian Đăng Nhập ({filteredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-red-600 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Biểu Đồ Đơn Vị & Thiết Bị</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'border-red-600 text-red-700 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Nhật Ký Phiên Truy Cập ({filteredLogs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: INDIVIDUAL USERS WITH ADVANCED FILTERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              {/* COMPREHENSIVE FILTER BAR FOR ADMIN & LEADERSHIP */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
                    <SlidersHorizontal className="w-4 h-4 text-red-600" />
                    <span>Bộ Lọc Chi Tiết Theo Dõi Tài Khoản (Dành Cho Lãnh Đạo & Quản Trị Viên)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500">
                      Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} cán bộ
                    </span>
                    <button
                      onClick={handleResetFilters}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Xóa tất cả điều kiện lọc về mặc định"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      <span>Đặt lại bộ lọc</span>
                    </button>
                  </div>
                </div>

                {/* Filter Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Search */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tìm kiếm cán bộ
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tên, CCCD, chức vụ, SĐT, IP..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Phòng ban / Đơn vị
                    </label>
                    <select
                      value={selectedDeptFilter}
                      onChange={e => setSelectedDeptFilter(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="ALL">-- Tất cả ban / văn phòng --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Role / Leadership level */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cấp bậc / Vai trò
                    </label>
                    <select
                      value={selectedRoleFilter}
                      onChange={e => setSelectedRoleFilter(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="ALL">-- Tất cả cấp bậc --</option>
                      <option value="AGENCY_LEAD">⭐ Lãnh đạo Cơ quan (Chủ tịch / Phó Chủ tịch)</option>
                      <option value="DEPT_HEAD">👔 Trưởng ban / Phó ban chuyên môn</option>
                      <option value="OFFICER">👤 Chuyên viên / Công chức</option>
                      <option value="ADMIN">🛡️ Quản trị viên hệ thống (Admin)</option>
                    </select>
                  </div>

                  {/* Online Status */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Trạng thái hoạt động
                    </label>
                    <select
                      value={selectedStatusFilter}
                      onChange={e => setSelectedStatusFilter(e.target.value as any)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="ALL">-- Tất cả trạng thái --</option>
                      <option value="ONLINE">🟢 Đang trực tuyến (Online)</option>
                      <option value="OFFLINE">⚪ Ngoại tuyến (Offline)</option>
                      <option value="FREQUENT">🔥 Đăng nhập nhiều (≥ 5 lượt)</option>
                      <option value="NEVER">⚠️ Chưa từng đăng nhập (0 lượt)</option>
                    </select>
                  </div>

                  {/* Login Time Period */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Thời gian đăng nhập cuối
                    </label>
                    <select
                      value={selectedTimeFilter}
                      onChange={e => setSelectedTimeFilter(e.target.value as any)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="ALL">-- Mọi thời điểm --</option>
                      <option value="TODAY">📅 Hôm nay (Trong 24h)</option>
                      <option value="3DAYS">📅 Trong 3 ngày qua</option>
                      <option value="7DAYS">📅 Trong 7 ngày qua</option>
                      <option value="30DAYS">📅 Trong 30 ngày qua</option>
                      <option value="NEVER">⚠️ Chưa có phiên đăng nhập</option>
                    </select>
                  </div>

                  {/* Device Filter */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Thiết bị truy cập cuối
                    </label>
                    <select
                      value={selectedDeviceFilter}
                      onChange={e => setSelectedDeviceFilter(e.target.value as any)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="ALL">-- Tất cả thiết bị --</option>
                      <option value="DESKTOP">💻 Máy tính để bàn / Laptop</option>
                      <option value="MOBILE">📱 Điện thoại thông minh (Mobile)</option>
                      <option value="TABLET">📟 Máy tính bảng (Tablet)</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      <span>Sắp xếp dữ liệu</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSortBy(sortBy === 'RECENT_LOGIN' ? 'OLDEST_LOGIN' : 'RECENT_LOGIN')}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                          sortBy === 'RECENT_LOGIN' || sortBy === 'OLDEST_LOGIN'
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Thời gian đăng nhập:</span>
                        <span className="font-bold">{sortBy === 'RECENT_LOGIN' ? 'Mới nhất ↓' : 'Cũ nhất ↑'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSortBy(sortBy === 'LOGINS_DESC' ? 'LOGINS_ASC' : 'LOGINS_DESC')}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
                          sortBy === 'LOGINS_DESC' || sortBy === 'LOGINS_ASC'
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Số lượt đăng nhập:</span>
                        <span className="font-bold">{sortBy === 'LOGINS_DESC' ? 'Nhiều nhất ↓' : 'Ít nhất ↑'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILED USERS TABLE */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-slate-800 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Danh Sách Thống Kê Tài Khoản & Thời Gian Đăng Nhập Cán Bộ</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{filteredUsers.filter(u => u.isOnline).length} đang online</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>{filteredUsers.filter(u => !u.isOnline).length} ngoại tuyến</span>
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Cán Bộ / Chức Vụ</th>
                        <th className="p-3">Căn Cước CD</th>
                        <th className="p-3">Ban / Phòng</th>
                        <th className="p-3 text-center">Trạng Thái</th>
                        <th className="p-3 text-center">Tổng Đăng Nhập</th>
                        <th className="p-3">Lần Đăng Nhập Gần Nhất</th>
                        <th className="p-3">Thiết Bị & IP</th>
                        <th className="p-3 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            <div className="max-w-sm mx-auto space-y-2">
                              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                              <p className="font-semibold text-slate-700">Không tìm thấy tài khoản cán bộ phù hợp</p>
                              <p className="text-[11px] text-slate-500">
                                Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Đặt lại bộ lọc" để hiển thị toàn bộ tài khoản.
                              </p>
                              <button
                                onClick={handleResetFilters}
                                className="mt-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 transition-colors"
                              >
                                Đặt lại bộ lọc
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(item => (
                          <tr 
                            key={item.user.id} 
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                            onClick={() => setInspectingUser(item.user)}
                          >
                            <td className="p-3">
                              <div className="flex items-center space-x-2.5">
                                <div className="relative shrink-0">
                                  <img
                                    src={item.user.avatar}
                                    alt={item.user.fullName}
                                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                                  />
                                  {item.isOnline ? (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                                  ) : (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-white" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 leading-tight group-hover:text-red-700 transition-colors flex items-center space-x-1.5">
                                    <span>{item.user.fullName}</span>
                                    {item.user.role === 'ADMIN' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 text-red-800 font-bold border border-red-200">Admin</span>
                                    )}
                                    {item.user.role === 'AGENCY_LEAD' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-bold border border-amber-200">Lãnh đạo</span>
                                    )}
                                  </p>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    {item.user.position}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {item.user.phone || item.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 font-mono text-slate-700 font-bold whitespace-nowrap">
                              {item.user.citizenId}
                            </td>

                            <td className="p-3">
                              <span className="text-[11px] font-semibold text-slate-800 block">
                                {item.deptName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.deptCode}
                              </span>
                            </td>

                            <td className="p-3 text-center whitespace-nowrap">
                              {item.isOnline ? (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  <span>Đang trực tuyến</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  <span>Ngoại tuyến</span>
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                                item.loginCount > 0 
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200'
                              }`}>
                                {item.loginCount} lượt
                              </span>
                            </td>

                            <td className="p-3 text-slate-700 whitespace-nowrap">
                              {item.lastLogin ? (
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{new Date(item.lastLogin.loginAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {new Date(item.lastLogin.loginAt).toLocaleDateString('vi-VN')}
                                  </div>
                                  <div className="text-[10px] text-emerald-600 font-medium">
                                    ({formatRelativeTime(item.lastLogin.loginAt)})
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                                  Chưa từng đăng nhập
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-slate-600 text-[11px] whitespace-nowrap">
                              {item.lastLogin ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-1">
                                    {item.lastLogin.deviceType === 'MOBILE' ? (
                                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : item.lastLogin.deviceType === 'TABLET' ? (
                                      <Tablet className="w-3.5 h-3.5 text-amber-600" />
                                    ) : (
                                      <Laptop className="w-3.5 h-3.5 text-blue-600" />
                                    )}
                                    <span className="font-medium text-slate-800">{item.lastLogin.browser}</span>
                                  </div>
                                  <div className="font-mono text-[10px] text-slate-500">
                                    IP: {item.lastLogin.ipAddress}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="p-3 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => setInspectingUser(item.user)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 mx-auto transition-colors border border-slate-200"
                                title="Xem toàn bộ lịch sử các phiên đăng nhập của cán bộ này"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Nhật ký</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: OVERVIEW CHARTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Department breakdown chart & stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-red-600" />
                    <span>Lưu Lượng Đăng Nhập & Tỷ Lệ Trực Tuyến Theo Ban / Phòng</span>
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          formatter={(val, name) => [val, name === 'totalLogins' ? 'Tổng lượt đăng nhập' : 'Đang trực tuyến']}
                          labelFormatter={(code) => deptStats.find(d => d.code === code)?.name || code}
                        />
                        <Legend />
                        <Bar dataKey="totalLogins" name="Tổng lượt đăng nhập" fill="#DC2626" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="onlineCount" name="Đang trực tuyến" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <span>Cơ Cấu Thiết Bị Đăng Nhập Hệ Thống</span>
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceChartData}
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {deviceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-100">
                    {deviceChartData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center space-x-1.5 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name}</span>
                        </span>
                        <span className="font-bold font-mono text-slate-800">{d.value} lượt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Statistics Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-3 bg-slate-100/80 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                  <span>Bảng Tổng Hợp Chi Tiết Theo Đơn Vị Công Tác</span>
                  <span className="text-[11px] font-normal text-slate-500">Cập nhật tự động</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Mã</th>
                        <th className="p-3">Tên Ban / Văn Phòng</th>
                        <th className="p-3 text-center">Tổng Cán Bộ</th>
                        <th className="p-3 text-center">Đang Trực Tuyến</th>
                        <th className="p-3 text-center">Tỷ Lệ Online</th>
                        <th className="p-3 text-right">Tổng Lượt Đăng Nhập</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deptStats.map(dept => (
                        <tr key={dept.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-red-700">{dept.code}</td>
                          <td className="p-3 font-semibold text-slate-900">{dept.name}</td>
                          <td className="p-3 text-center text-slate-700">{dept.totalUsers}</td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>{dept.onlineCount}</span>
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="w-24 bg-slate-200 rounded-full h-2 mx-auto overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full" 
                                style={{ width: `${dept.onlineRate}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">{dept.onlineRate}%</span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 font-mono">
                            {dept.totalLogins} lượt
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên cán bộ, CCCD, IP, đơn vị..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <select
                    value={selectedDeptFilter}
                    onChange={e => setSelectedDeptFilter(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="ALL">-- Tất cả ban/văn phòng --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedDeviceFilter}
                    onChange={e => setSelectedDeviceFilter(e.target.value as any)}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="ALL">-- Mọi thiết bị --</option>
                    <option value="DESKTOP">Máy tính/PC</option>
                    <option value="MOBILE">Mobile</option>
                    <option value="TABLET">Tablet</option>
                  </select>
                </div>

                <div className="text-[11px] text-slate-500">
                  Hiển thị <strong>{filteredLogs.length}</strong> / {loginLogs.length} sự kiện đăng nhập
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Thời Gian Đăng Nhập</th>
                        <th className="p-3">Cán Bộ Truy Cập</th>
                        <th className="p-3">CCCD</th>
                        <th className="p-3">Phòng Ban</th>
                        <th className="p-3">Phương Thức</th>
                        <th className="p-3">Thiết Bị / Trình Duyệt</th>
                        <th className="p-3">Địa Chỉ IP</th>
                        <th className="p-3 text-center">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            Chưa có sự kiện đăng nhập nào phù hợp với bộ lọc hiện tại.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 text-slate-700 whitespace-nowrap">
                              <div className="font-semibold text-slate-900">{new Date(log.loginAt).toLocaleTimeString('vi-VN')}</div>
                              <div className="text-[10px] text-slate-400">{new Date(log.loginAt).toLocaleDateString('vi-VN')}</div>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{log.userName}</p>
                              <span className="text-[10px] text-slate-500">{log.userPosition}</span>
                            </td>
                            <td className="p-3 font-mono text-slate-700">{log.citizenId}</td>
                            <td className="p-3 text-slate-700">{log.departmentName}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200">
                                {log.loginMethod === 'CCCD' ? 'Xác thực CCCD' : 'Chuyển tài khoản'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">
                              <div className="flex items-center space-x-1.5">
                                {log.deviceType === 'MOBILE' ? (
                                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                ) : log.deviceType === 'TABLET' ? (
                                  <Tablet className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <Laptop className="w-3.5 h-3.5 text-blue-600" />
                                )}
                                <span>{log.browser}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-600">{log.ipAddress}</td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Thành công</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Hệ thống ghi vết và giám sát truy cập bảo mật Cơ quan Ủy ban MTTQ Việt Nam tỉnh Bắc Ninh</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLoginStatsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL USER SESSION DETAIL INSPECTION MODAL */}
      {inspectingUser && inspectingUserData && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src={inspectingUser.avatar}
                  alt={inspectingUser.fullName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{inspectingUser.fullName}</h3>
                    {inspectingUserData.isOnline ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Trực tuyến</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                        Ngoại tuyến
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    {inspectingUser.position} • {inspectingUserData.deptName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingUser(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Summary */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Số Căn Cước CD</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{inspectingUser.citizenId}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Tổng Lượt Đăng Nhập</span>
                <span className="font-mono font-bold text-red-700 text-sm">{inspectingUserData.loginCount} lượt</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Số Điện Thoại</span>
                <span className="font-mono text-slate-800">{inspectingUser.phone || 'Chưa cập nhật'}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Đăng Nhập Cuối</span>
                <span className="font-bold text-emerald-700 text-[11px]">
                  {formatRelativeTime(inspectingUserData.lastLogin?.loginAt)}
                </span>
              </div>
            </div>

            {/* Session History List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                <span>Lịch Sử Các Phiên Đăng Nhập Của Cán Bộ</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {inspectingUserData.userLogs.length} phiên đã lưu vết
                </span>
              </h4>

              {inspectingUserData.userLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Chưa ghi nhận phiên đăng nhập nào</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cán bộ chưa thực hiện phiên làm việc nào trên cổng điều hành.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inspectingUserData.userLogs.map((log, idx) => (
                    <div 
                      key={log.id || idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                          #{inspectingUserData.userLogs.length - idx}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-2">
                            <span>{new Date(log.loginAt).toLocaleTimeString('vi-VN')}</span>
                            <span className="text-slate-400 font-normal">|</span>
                            <span className="text-slate-600 font-medium">{new Date(log.loginAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center space-x-1">
                              {log.deviceType === 'MOBILE' ? (
                                <Smartphone className="w-3 h-3 text-emerald-600" />
                              ) : log.deviceType === 'TABLET' ? (
                                <Tablet className="w-3 h-3 text-amber-600" />
                              ) : (
                                <Laptop className="w-3 h-3 text-blue-600" />
                              )}
                              <span>{log.browser}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono">IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>Thành công</span>
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {log.loginMethod === 'CCCD' ? 'Căn cước CD' : 'Phiên tự động'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setInspectingUser(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
