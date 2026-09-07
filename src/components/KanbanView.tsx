import React from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Paperclip,
  Users,
  Plus,
  Send,
  Sparkles
} from 'lucide-react';

const COLUMNS: { id: TaskStatus; title: string; color: string; bg: string; border: string }[] = [
  { id: 'PENDING', title: 'Chưa Bắt Đầu', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-300' },
  { id: 'IN_PROGRESS', title: 'Đang Thực Hiện', color: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-300' },
  { id: 'IN_REVIEW', title: 'Chờ Phê Duyệt', color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-300' },
  { id: 'COMPLETED', title: 'Đã Hoàn Thành', color: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-300' },
  { id: 'OVERDUE', title: 'Quá Hạn (Khẩn)', color: 'text-red-700', bg: 'bg-red-50/50', border: 'border-red-300' },
];

export const KanbanView: React.FC = () => {
  const {
    visibleTasks,
    departments,
    users,
    setSelectedTaskId,
    updateTask,
    sendUrgentReminder,
    canCreateTask,
    setIsCreateModalOpen
  } = useApp();

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bảng Tiến Độ Trực Quan (Kanban Board)</h1>
          <p className="text-xs text-slate-500">
            Theo dõi luồng xử lý công việc qua các giai đoạn phê duyệt
          </p>
        </div>
        {canCreateTask && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Giao Việc Mới</span>
          </button>
        )}
      </div>

      {/* 5 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {COLUMNS.map(col => {
          const colTasks = visibleTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.border} ${col.bg} p-3 min-h-[500px] flex flex-col`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </span>
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks in column */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
                {colTasks.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200/80 rounded-xl">
                    Trống
                  </div>
                ) : (
                  colTasks.map(task => {
                    const dept = departments.find(d => d.id === task.departmentId);
                    const leadUser = users.find(u => u.id === task.leadAssigneeId);
                    const completedMilestones = task.milestones?.filter(m => m.completed).length || 0;
                    const totalMilestones = task.milestones?.length || 0;

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-red-300 transition-all cursor-pointer space-y-2.5"
                      >
                        {/* Header: Code & Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {task.code}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === 'URGENT'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {task.priority === 'URGENT' ? 'Hỏa Tốc' : task.priority === 'HIGH' ? 'Khẩn' : 'Thường'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 hover:text-red-700">
                          {task.title}
                        </h4>

                        {/* Department tag */}
                        <p className="text-[10px] text-slate-500 font-medium">
                          {dept?.code} • {dept?.name}
                        </p>

                        {/* Milestone progress mini */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{completedMilestones}/{totalMilestones} giai đoạn</span>
                            <span className="font-bold text-slate-800">{task.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                col.id === 'COMPLETED' ? 'bg-emerald-500' : col.id === 'OVERDUE' ? 'bg-red-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer: User & Quick Move dropdown */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center space-x-1.5">
                            {leadUser && (
                              <img
                                src={leadUser.avatar}
                                alt={leadUser.fullName}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                                title={`Chủ trì: ${leadUser.fullName}`}
                              />
                            )}
                            <span className="text-[10px] text-slate-600 font-semibold truncate max-w-[80px]">
                              {leadUser?.fullName.split(' ').slice(-2).join(' ')}
                            </span>
                          </div>

                          <select
                            value={task.status}
                            onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none"
                          >
                            <option value="PENDING">Chưa bắt đầu</option>
                            <option value="IN_PROGRESS">Đang làm</option>
                            <option value="IN_REVIEW">Chờ duyệt</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="OVERDUE">Quá hạn</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
