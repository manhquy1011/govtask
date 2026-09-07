import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  TrendingUp,
  Building2,
  UserCheck,
  Send,
  Sparkles,
  ChevronRight,
  Calendar,
  Layers,
  FileText,
  Activity,
  Radio,
  Laptop,
  Users,
  Shield,
  Plus
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

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    userPermittedTasks,
    departments,
    users,
    setSelectedTaskId,
    setIsCreateModalOpen,
    setIsSmartAssignModalOpen,
    setIsLoginStatsModalOpen,
    loginLogs,
    onlineUserIds,
    totalLoginCount,
    getUserLoginCount,
    getUserLastLogin,
    isUserOnline,
    sendUrgentReminder,
    canCreateTask,
    setActiveTab,
    resetFilters,
    setFilterStatus
  } = useApp();

  const handleGoToAllTasks = () => {
    resetFilters();
    setActiveTab('tasks');
  };

  const handleGoToInProgressTasks = () => {
    resetFilters();
    setFilterStatus('IN_PROGRESS');
    setActiveTab('tasks');
  };

  const handleGoToCompletedTasks = () => {
    resetFilters();
    setFilterStatus('COMPLETED');
    setActiveTab('tasks');
  };

  const handleGoToOverdueTasks = () => {
    resetFilters();
    setFilterStatus('OVERDUE');
    setActiveTab('tasks');
  };

  const currentDept = departments.find(d => d.id === currentUser.departmentId);

  // Statistics calculation
  const totalTasks = userPermittedTasks.length;
  const inProgressTasks = userPermittedTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = userPermittedTasks.filter(t => t.status === 'IN_REVIEW').length;
  const completedTasks = userPermittedTasks.filter(t => t.status === 'COMPLETED').length;
  const overdueTasks = userPermittedTasks.filter(t => t.status === 'OVERDUE');
  const pendingTasks = userPermittedTasks.filter(t => t.status === 'PENDING').length;

  const ontimeRate = totalTasks > 0
    ? Math.round(((completedTasks + inProgressTasks) / totalTasks) * 100)
    : 100;

  const totalKPIEarned = userPermittedTasks
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.kpiPoints || 0), 0);

  const onlineCount = onlineUserIds.length;
  const onlinePercentage = users.length > 0 ? Math.round((onlineCount / users.length) * 100) : 0;

  // Status Chart Data
  const statusChartData = [
    { name: 'Đang làm', value: inProgressTasks, color: '#3B82F6' },
    { name: 'Chờ duyệt', value: inReviewTasks, color: '#F59E0B' },
    { name: 'Hoàn thành', value: completedTasks, color: '#10B981' },
    { name: 'Quá hạn', value: overdueTasks.length, color: '#EF4444' },
    { name: 'Chưa làm', value: pendingTasks, color: '#94A3B8' },
  ].filter(d => d.value > 0);

  // Department Workload Data for leadership
  const deptWorkloadData = departments.map(dept => {
    const deptTasks = userPermittedTasks.filter(t => t.departmentId === dept.id);
    return {
      name: dept.code,
      fullName: dept.name,
      'Hoàn thành': deptTasks.filter(t => t.status === 'COMPLETED').length,
      'Đang thực hiện': deptTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length,
      'Quá hạn': deptTasks.filter(t => t.status === 'OVERDUE').length,
    };
  });

  // Top Officers for KPI ranking in scope
  const topUsers = [...users]
    .filter(u => currentUser.role === 'AGENCY_LEAD' || currentUser.role === 'ADMIN' || u.departmentId === currentUser.departmentId)
    .sort((a, b) => (b.kpiScore || 0) - (a.kpiScore || 0))
    .slice(0, 5);

  // Online Users summary for quick access
  const activeOnlineUsers = users.filter(u => onlineUserIds.includes(u.id));

  const scrollToOnlineSection = () => {
    const el = document.getElementById('online-personnel-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-50/40');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-50/40');
      }, 2000);
    }
  };

  // Upcoming Milestones needing attention
  const upcomingMilestones: { taskTitle: string; taskId: string; title: string; dueDate: string; completed: boolean }[] = [];
  userPermittedTasks.forEach(task => {
    task.milestones?.forEach(ms => {
      if (!ms.completed) {
        upcomingMilestones.push({
          taskTitle: task.title,
          taskId: task.id,
          title: ms.title,
          dueDate: ms.dueDate,
          completed: ms.completed
        });
      }
    });
  });
  upcomingMilestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
      
      {/* Scope Greeting & Quick Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider">
                {currentUser.role === 'AGENCY_LEAD'
                  ? 'Ban Giám Đốc Cơ Quan'
                  : currentUser.role === 'ADMIN'
                  ? 'Quản Trị Hệ Thống'
                  : currentUser.role === 'DEPT_HEAD'
                  ? `Lãnh Đạo ${currentDept?.code}`
                  : 'Cán Bộ Chuyên Viên'}
              </span>
              <span className="text-slate-400 text-xs">
                Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2 text-white">
              Kính chào đồng chí {currentUser.fullName}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {currentUser.role === 'AGENCY_LEAD'
                ? 'Hệ thống đang theo dõi tổng thể toàn bộ nhiệm vụ của 5 phòng ban trực thuộc cơ quan.'
                : currentUser.role === 'DEPT_HEAD'
                ? `Bảng điều hành theo dõi tiến độ và phân công nhiệm vụ của ${currentDept?.name}.`
                : 'Bảng theo dõi các nhiệm vụ được giao chủ trì và tham gia phối hợp.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-dash-login-stats"
              onClick={scrollToOnlineSection}
              className="px-3.5 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 active:scale-95 text-white border border-emerald-400/40 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              title="Đi tới phần Thống kê số lượt đăng nhập (Cán bộ đang trực tuyến trên hệ thống)"
            >
              <Activity className="w-4 h-4 text-emerald-200" />
              <span>Thống Kê Đăng Nhập & Online</span>
            </button>

            {canCreateTask && (
              <button
                id="btn-dash-create"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Giao Nhiệm Vụ Mới</span>
              </button>
            )}
            <button
              id="btn-dash-smart-assign"
              onClick={() => setIsSmartAssignModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Phân Công Tự Động</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards: Added Login & Online Tracking */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div
            id="card-stat-total-tasks"
            onClick={handleGoToAllTasks}
            className="bg-slate-800/60 hover:bg-slate-800/90 p-4 rounded-xl border border-slate-700/60 hover:border-blue-400 cursor-pointer transition-all duration-200 group active:scale-95 shadow-xs hover:shadow-lg hover:shadow-blue-500/10"
            title="Nhấp để mở toàn bộ Danh sách nhiệm vụ"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs group-hover:text-blue-300 transition-colors">
              <span className="font-semibold">Tổng số nhiệm vụ</span>
              <div className="flex items-center space-x-1">
                <ListTodo className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <ChevronRight className="w-3.5 h-3.5 text-blue-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white group-hover:text-blue-200 mt-1.5 transition-colors">{totalTasks}</p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 group-hover:text-blue-300/80 mt-1 transition-colors">
              <span>Được phân quyền xem</span>
              <span className="text-[10px] font-bold text-blue-400 underline underline-offset-2">Xem danh sách</span>
            </div>
          </div>

          <div
            id="card-stat-in-progress"
            onClick={handleGoToInProgressTasks}
            className="bg-slate-800/60 hover:bg-slate-800/90 p-4 rounded-xl border border-slate-700/60 hover:border-amber-400 cursor-pointer transition-all duration-200 group active:scale-95 shadow-xs hover:shadow-lg hover:shadow-amber-500/10"
            title="Nhấp để xem danh sách nhiệm vụ đang thực hiện"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs group-hover:text-amber-300 transition-colors">
              <span className="font-semibold">Đang thực hiện</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-400 group-hover:text-amber-300 mt-1.5 transition-colors">{inProgressTasks}</p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 group-hover:text-amber-300/80 mt-1 transition-colors">
              <span>{inReviewTasks} việc chờ phê duyệt</span>
              <span className="text-[10px] font-bold text-amber-400 underline underline-offset-2">Chi tiết</span>
            </div>
          </div>

          <div
            id="card-stat-completed"
            onClick={handleGoToCompletedTasks}
            className="bg-slate-800/60 hover:bg-slate-800/90 p-4 rounded-xl border border-slate-700/60 hover:border-emerald-400 cursor-pointer transition-all duration-200 group active:scale-95 shadow-xs hover:shadow-lg hover:shadow-emerald-500/10"
            title="Nhấp để xem danh sách nhiệm vụ đã hoàn thành"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs group-hover:text-emerald-300 transition-colors">
              <span className="font-semibold">Đã hoàn thành</span>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300 mt-1.5 transition-colors">{completedTasks}</p>
            <div className="flex items-center justify-between text-[11px] text-emerald-400/80 group-hover:text-emerald-300 mt-1 transition-colors">
              <span>{ontimeRate}% tiến độ chung</span>
              <span className="text-[10px] font-bold text-emerald-400 underline underline-offset-2">Chi tiết</span>
            </div>
          </div>

          <div
            id="card-stat-overdue"
            onClick={handleGoToOverdueTasks}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group active:scale-95 shadow-xs ${
              overdueTasks.length > 0
                ? 'bg-red-950/70 border-red-700/80 hover:bg-red-950/90 hover:border-red-400 text-red-100 hover:shadow-lg hover:shadow-red-500/20'
                : 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/60 hover:border-slate-500'
            }`}
            title="Nhấp để xem danh sách nhiệm vụ quá hạn khẩn cấp"
          >
            <div className="flex items-center justify-between text-xs">
              <span className={overdueTasks.length > 0 ? 'text-red-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'}>
                Nhiệm vụ quá hạn
              </span>
              <div className="flex items-center space-x-1">
                <AlertTriangle className={`w-4 h-4 ${overdueTasks.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                <ChevronRight className="w-3.5 h-3.5 text-red-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
            <p className={`text-2xl font-bold mt-1.5 transition-colors ${overdueTasks.length > 0 ? 'text-red-400 group-hover:text-red-300' : 'text-slate-300'}`}>
              {overdueTasks.length}
            </p>
            <div className="flex items-center justify-between text-[11px] mt-1">
              <span className={overdueTasks.length > 0 ? 'text-red-300' : 'text-slate-400'}>
                {overdueTasks.length > 0 ? 'Cần xử lý khẩn cấp' : 'Không có việc trễ hạn'}
              </span>
              {overdueTasks.length > 0 && (
                <span className="text-[10px] font-bold text-red-300 underline underline-offset-2">Xử lý ngay</span>
              )}
            </div>
          </div>

          {/* New Live Online & Login Count Card */}
          <div 
            onClick={scrollToOnlineSection}
            className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-950/70 to-slate-800/80 p-4 rounded-xl border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all group shadow-inner"
            title="Đi tới phần Thống kê số lượt đăng nhập (Cán bộ đang trực tuyến trên hệ thống)"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-semibold flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Đang Trực Tuyến</span>
              </span>
              <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-300 mt-1.5 flex items-baseline space-x-1.5">
              <span>{onlineCount}</span>
              <span className="text-xs font-medium text-emerald-400/70">/ {users.length} tài khoản</span>
            </p>
            <div className="flex items-center justify-between text-[11px] text-emerald-200/80 mt-1 pt-1 border-t border-emerald-800/40 font-mono">
              <span>Tổng: {totalLoginCount} lượt login</span>
              <span className="text-[10px] text-emerald-300 group-hover:underline">Chi tiết &rarr;</span>
            </div>
          </div>

        </div>
      </div>

      {/* Urgent Overdue Alert Banner if any */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-red-900">
                  Cảnh Báo: Có {overdueTasks.length} nhiệm vụ đang bị chậm tiến độ!
                </h3>
                <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  Nhắc việc tự động đã kích hoạt
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {overdueTasks.map(task => {
                  const leadUser = users.find(u => u.id === task.leadAssigneeId);
                  return (
                    <div
                      key={task.id}
                      className="bg-white p-3 rounded-xl border border-red-200 flex items-center justify-between flex-wrap gap-2 hover:shadow-xs transition-shadow"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-red-700">{task.code}</span>
                          <span className="text-xs font-semibold text-slate-800">{task.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Chủ trì: <span className="font-semibold text-slate-700">{leadUser?.fullName}</span> ({leadUser?.position}) • Hạn chót: <span className="text-red-600 font-bold">{task.dueDate}</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => sendUrgentReminder(task.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
                          title="Gửi thông báo đôn đốc khẩn đến nhân viên"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Đôn Đốc Ngay</span>
                        </button>
                        <button
                          onClick={() => setSelectedTaskId(task.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Workload Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tiến Độ & Phân Bổ Nhiệm Vụ Các Phòng Ban
              </h2>
              <p className="text-xs text-slate-500">
                Thống kê tình hình thực hiện theo đơn vị trực thuộc
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              5 Phòng / Đơn vị
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Hoàn thành" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Đang thực hiện" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Quá hạn" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Trạng Thái Công Việc
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Cơ cấu tình trạng hoàn thành
            </p>

            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {statusChartData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Two Column Section: Upcoming Milestone Deadlines & Top KPI Officers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Milestones / Stages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <h2 className="text-base font-bold text-slate-900">
                Giai Đoạn Đầu Mục Cần Hoàn Thành Sắp Tới
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingMilestones.slice(0, 5).map((ms, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTaskId(ms.taskId)}
                className="p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1 pr-3">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">
                    {ms.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>Nhiệm vụ: {ms.taskTitle}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 block">
                    {ms.dueDate}
                  </span>
                  <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                    Đang tiến hành
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top KPI Staff Ranking */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Bảng Điểm KPI & Hiệu Suất Cán Bộ
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('kpi')}
              className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <span>Xem chi tiết KPI</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topUsers.map((user, index) => {
              const dept = departments.find(d => d.id === user.departmentId);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200'
                        : index === 1
                        ? 'bg-slate-300 text-slate-800'
                        : index === 2
                        ? 'bg-amber-700/30 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500">{user.position} • {dept?.code}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-600 flex items-center justify-end space-x-1">
                      <span>{user.kpiScore}</span>
                      <span className="text-[10px] text-slate-400">điểm</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {user.activeTaskCount} việc đang phụ trách
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Online Personnel Live Section */}
      <div
        id="online-personnel-section"
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs scroll-mt-6 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>Thống Kê Số Lượt Đăng Nhập (Cán Bộ Đang Trực Tuyến Trên Hệ Thống)</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {onlineCount} / {users.length} tài khoản ({onlinePercentage}%)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Theo dõi số lượt đăng nhập và phiên làm việc theo thời gian thực để hỗ trợ giao việc và trao đổi tức thời
              </p>
            </div>
          </div>

          <button
            id="btn-view-detailed-logins"
            onClick={() => setIsLoginStatsModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 self-start sm:self-auto border border-slate-300/80 shadow-2xs hover:border-red-300 cursor-pointer active:scale-95"
            title="Mở bảng thống kê chi tiết lượt đăng nhập, thời gian và bộ lọc tài khoản"
          >
            <Activity className="w-3.5 h-3.5 text-red-600" />
            <span>Xem Chi Tiết Lượt Đăng Nhập &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {users.map(user => {
            const isOnline = isUserOnline(user.id);
            const userDept = departments.find(d => d.id === user.departmentId);
            const loginCount = getUserLoginCount(user.id);
            const lastLogin = getUserLastLogin(user.id);

            return (
              <div
                key={user.id}
                className={`p-3 rounded-xl border transition-all ${
                  isOnline
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                    : 'bg-slate-50/50 border-slate-200/70 opacity-75'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                    {isOnline ? (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-slate-300 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.fullName}
                      </p>
                      {isOnline ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">
                          Online
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Offline</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {user.position} • {userDept?.code}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-200/60 font-mono">
                      <span>{loginCount} lượt login</span>
                      <span>
                        {lastLogin ? new Date(lastLogin.loginAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
