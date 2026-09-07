import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus, TaskGroup } from '../types';
import {
  Search,
  Filter,
  Layers,
  Calendar,
  UserCheck,
  Users,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  Plus,
  Send,
  Eye,
  FileSpreadsheet,
  Grid,
  List,
  Sparkles,
  Paperclip,
  Trash2,
  Edit3
} from 'lucide-react';

export const TaskListView: React.FC = () => {
  const {
    visibleTasks,
    userPermittedTasks,
    departments,
    users,
    currentUser,
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
    setSelectedTaskId,
    setIsCreateModalOpen,
    setIsSmartAssignModalOpen,
    sendUrgentReminder,
    openUrgentDispatchModal,
    deleteTask,
    canCreateTask,
    canViewAllAgency
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'kpi' | 'progress'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return { label: 'Hỏa Tốc', bg: 'bg-red-100 text-red-700 border-red-200' };
      case 'HIGH':
        return { label: 'Thượng Khẩn', bg: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'MEDIUM':
        return { label: 'Bình Thường', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'LOW':
        return { label: 'Thấp', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: priority, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chưa bắt đầu', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'IN_PROGRESS':
        return { label: 'Đang thực hiện', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'IN_REVIEW':
        return { label: 'Chờ duyệt', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'OVERDUE':
        return { label: 'Quá hạn', bg: 'bg-red-100 text-red-800 border-red-300' };
      case 'ON_HOLD':
        return { label: 'Tạm hoãn', bg: 'bg-gray-100 text-gray-700 border-gray-300' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getGroupBadge = (group: TaskGroup) => {
    switch (group) {
      case 'FOCUS':
        return { label: 'Trọng tâm', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'REGULAR':
        return { label: 'Thường xuyên', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'URGENT_AD_HOC':
        return { label: 'Đột xuất', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'PROJECT':
        return { label: 'Đề án / Dự án', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'ADMINISTRATIVE':
        return { label: 'Hành chính', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
      default:
        return { label: group, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Sort tasks
  const sortedTasks = [...visibleTasks].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'dueDate') {
      diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === 'kpi') {
      diff = (b.kpiPoints || 0) - (a.kpiPoints || 0);
    } else if (sortBy === 'progress') {
      diff = b.progressPercent - a.progressPercent;
    } else if (sortBy === 'priority') {
      const pWeights = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      diff = (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  const handleExportCSV = () => {
    const headers = ['Mã NV', 'Tên nhiệm vụ', 'Phòng ban', 'Người chủ trì', 'Hạn chót', 'Tiến độ (%)', 'Điểm KPI', 'Trạng thái'];
    const rows = sortedTasks.map(t => {
      const dept = departments.find(d => d.id === t.departmentId)?.name || '';
      const lead = users.find(u => u.id === t.leadAssigneeId)?.fullName || '';
      return [
        t.code,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${dept}"`,
        `"${lead}"`,
        t.dueDate,
        t.progressPercent,
        t.kpiPoints,
        getStatusBadge(t.status).label
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GovTask_Bao_Cao_Nhiem_Vu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Danh sách nhiệm vụ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {sortedTasks.length} nhiệm vụ
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý, đôn đốc tiến độ giai đoạn và điểm KPI theo thời gian thực
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-2xs transition-colors"
            title="Xuất bảng báo cáo nhiệm vụ định dạng Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Báo Cáo</span>
          </button>

          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Xem dạng bảng chi tiết"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Xem dạng thẻ trực quan"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {canCreateTask && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Việc</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        
        {/* Search input & Quick Clear */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã số, tên nhiệm vụ, nội dung chỉ đạo..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900"
            />
          </div>

          {(filterSearch || filterDepartment !== 'ALL' || filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterGroup !== 'ALL' || filterAssignee !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors shrink-0"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
          
          {/* Department Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Phòng ban</label>
            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              disabled={currentUser.role === 'OFFICER'}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 text-slate-800"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 text-slate-800"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="IN_REVIEW">Chờ phê duyệt</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="OVERDUE">Quá hạn (Khẩn)</option>
              <option value="PENDING">Chưa bắt đầu</option>
              <option value="ON_HOLD">Tạm dừng</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Mức độ khẩn</label>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 text-slate-800"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="URGENT">Hỏa Tốc</option>
              <option value="HIGH">Thượng Khẩn</option>
              <option value="MEDIUM">Bình Thường</option>
              <option value="LOW">Thấp</option>
            </select>
          </div>

          {/* Task Group Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Nhóm nhiệm vụ</label>
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 text-slate-800"
            >
              <option value="ALL">Tất cả nhóm</option>
              <option value="FOCUS">Nhiệm vụ Trọng tâm</option>
              <option value="REGULAR">Thường xuyên</option>
              <option value="URGENT_AD_HOC">Đột xuất</option>
              <option value="PROJECT">Đề án / Dự án</option>
              <option value="ADMINISTRATIVE">Hành chính</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Người phụ trách</label>
            <select
              value={filterAssignee}
              onChange={e => setFilterAssignee(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 text-slate-800"
            >
              <option value="ALL">Tất cả cán bộ</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.position})</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Task Content: Table or Grid */}
      {sortedTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy nhiệm vụ nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không có nhiệm vụ nào khớp với bộ lọc hiện tại hoặc trong phạm vi phân quyền của bạn.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      ) : viewMode === 'table' ? (
        
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã & Nhiệm vụ</th>
                  <th className="py-3 px-3">Phòng ban</th>
                  <th className="py-3 px-3">Người chủ trì & Phối hợp</th>
                  <th className="py-3 px-3">Giai đoạn & Tiến độ</th>
                  <th className="py-3 px-3">Hạn chót</th>
                  <th className="py-3 px-3 text-center">Điểm KPI</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedTasks.map(task => {
                  const dept = departments.find(d => d.id === task.departmentId);
                  const leadUser = users.find(u => u.id === task.leadAssigneeId);
                  const collabUsers = users.filter(u => task.collaboratorIds?.includes(u.id));
                  const priorityInfo = getPriorityBadge(task.priority);
                  const statusInfo = getStatusBadge(task.status);
                  const groupInfo = getGroupBadge(task.group);
                  const completedMilestones = task.milestones?.filter(m => m.completed).length || 0;
                  const totalMilestones = task.milestones?.length || 0;

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      {/* Code & Title & Group */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {task.code}
                          </span>
                          {task.matrixGroup && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300" title={`Ma trận: Nhóm ${task.matrixGroup} - ${task.matrixPoints || 5} điểm`}>
                              Ma trận: {task.matrixGroup} ({task.matrixPoints || 5}đ)
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.bg}`}>
                            {priorityInfo.label}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${groupInfo.bg}`}>
                            {groupInfo.label}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 mt-1 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">
                          {task.title}
                        </p>
                        {task.attachments?.length > 0 && (
                          <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{task.attachments.length} tài liệu</span>
                          </span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 block">
                          {dept?.code}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                          {dept?.name}
                        </span>
                      </td>

                      {/* Assignees (Lead + Collaborators) */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          {leadUser && (
                            <img
                              src={leadUser.avatar}
                              alt={leadUser.fullName}
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-red-500"
                              title={`Chủ trì: ${leadUser.fullName} (${leadUser.position})`}
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-800 text-xs truncate max-w-[110px]">
                              {leadUser?.fullName}
                            </p>
                            {collabUsers.length > 0 && (
                              <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                                <Users className="w-2.5 h-2.5" />
                                <span>+{collabUsers.length} phối hợp</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Milestones & Progress bar */}
                      <td className="py-3.5 px-3 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">
                            {completedMilestones}/{totalMilestones} mốc
                          </span>
                          <span className="font-bold text-slate-800">
                            {task.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              task.status === 'COMPLETED'
                                ? 'bg-emerald-500'
                                : task.status === 'OVERDUE'
                                ? 'bg-red-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${task.progressPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>
                        {task.status === 'OVERDUE' && (
                          <span className="text-[10px] font-bold text-red-600 block mt-0.5">
                            Đã quá hạn
                          </span>
                        )}
                      </td>

                      {/* KPI Points */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>+{task.kpiPoints}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openUrgentDispatchModal(task)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Gửi đôn đốc ngay (Đồng thời hiển thị khi đăng nhập và gửi Email cá nhân)"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết giai đoạn và báo cáo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD') && (
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa nhiệm vụ ${task.code}?`)) {
                                  deleteTask(task.id);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa nhiệm vụ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTasks.map(task => {
            const dept = departments.find(d => d.id === task.departmentId);
            const leadUser = users.find(u => u.id === task.leadAssigneeId);
            const priorityInfo = getPriorityBadge(task.priority);
            const statusInfo = getStatusBadge(task.status);
            const groupInfo = getGroupBadge(task.group);
            const completedMilestones = task.milestones?.filter(m => m.completed).length || 0;
            const totalMilestones = task.milestones?.length || 0;

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Code, Priority, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {task.code}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityInfo.bg}`}>
                        {priorityInfo.label}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Title & Group */}
                  <h3 className="text-sm font-bold text-slate-900 mt-2.5 line-clamp-2 leading-snug hover:text-red-700">
                    {task.title}
                  </h3>

                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${groupInfo.bg}`}>
                      {groupInfo.label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {dept?.name}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">
                        {completedMilestones}/{totalMilestones} giai đoạn hoàn thành
                      </span>
                      <span className="font-bold text-slate-900">{task.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : task.status === 'OVERDUE'
                            ? 'bg-red-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${task.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer: Assignee & Deadline & KPI */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {leadUser && (
                      <img
                        src={leadUser.avatar}
                        alt={leadUser.fullName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {leadUser?.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Hạn: {task.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>+{task.kpiPoints} KPI</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
