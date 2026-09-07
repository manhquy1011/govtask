import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskMilestone, TaskStatus, TaskPriority, TaskGroup } from '../types';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Paperclip,
  Upload,
  UserCheck,
  Users,
  Send,
  Plus,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Sparkles,
  Building2,
  ShieldAlert,
  Star,
  CheckSquare,
  MessageSquare,
  Table2
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    departments,
    users,
    currentUser,
    updateTask,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    addAttachment,
    removeAttachment,
    sendUrgentReminder,
    openUrgentDispatchModal,
    approveTaskReview,
    canReviewTask,
    canEditTask
  } = useApp();

  const task = tasks.find(t => t.id === selectedTaskId);

  const [activeTab, setActiveTab] = useState<'milestones' | 'attachments' | 'review' | 'info'>('milestones');
  
  // New Milestone Form State
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsDueDate, setNewMsDueDate] = useState(task?.dueDate || new Date().toISOString().split('T')[0]);
  const [newMsWeight, setNewMsWeight] = useState(25);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(95);
  const [reviewComment, setReviewComment] = useState('');
  
  // Urgent Reminder state
  const [customReminderMsg, setCustomReminderMsg] = useState('');
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  if (!task) return null;

  const dept = departments.find(d => d.id === task.departmentId);
  const leadUser = users.find(u => u.id === task.leadAssigneeId);
  const collabUsers = users.filter(u => task.collaboratorIds?.includes(u.id));
  const creatorUser = users.find(u => u.id === task.creatorId);

  const completedMilestones = task.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = task.milestones?.length || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addAttachment(task.id, {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: '#',
      uploadedBy: currentUser.fullName
    });
    e.target.value = '';
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsTitle.trim()) return;

    addMilestone(task.id, {
      title: newMsTitle.trim(),
      dueDate: newMsDueDate,
      weightPercent: Number(newMsWeight) || 20,
    });

    setNewMsTitle('');
    setIsAddingMilestone(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between border-b border-slate-700">
          <div className="space-y-1.5 flex-1 pr-4">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {task.code}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                task.priority === 'URGENT' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {task.priority === 'URGENT' ? 'HỎA TỐC' : 'THƯỜNG'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                {dept?.name}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {task.title}
            </h2>
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Stats Ribbon */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Progress bar */}
          <div className="flex-1 min-w-[200px] space-y-1">
            <div className="flex items-center justify-between text-slate-600 font-semibold">
              <span>Tiến độ giai đoạn ({completedMilestones}/{totalMilestones} mốc)</span>
              <span className="text-slate-900 font-bold">{task.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  task.status === 'COMPLETED' ? 'bg-emerald-500' : task.status === 'OVERDUE' ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{ width: `${task.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Key metrics */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Hạn chót: <strong>{task.dueDate}</strong></span>
            </div>
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{task.kpiPoints} Điểm KPI</span>
            </div>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 px-5 bg-white space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'milestones'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Giai Đoạn Thực Hiện ({totalMilestones})</span>
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'attachments'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Tài Liệu Đính Kèm ({task.attachments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'info'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Nhân Sự & Phân Công</span>
          </button>

          {canReviewTask(task) && (
            <button
              onClick={() => setActiveTab('review')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'review'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span>Phê Duyệt & Chấm KPI</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: MILESTONES / GIAI ĐOẠN */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Chi tiết các giai đoạn & hạn hoàn thành từng đầu việc
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tích chọn để cập nhật tiến độ tự động theo thời gian thực
                  </p>
                </div>
                {canEditTask(task) && !isAddingMilestone && (
                  <button
                    onClick={() => setIsAddingMilestone(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm giai đoạn</span>
                  </button>
                )}
              </div>

              {/* Add Milestone Inline Form */}
              {isAddingMilestone && (
                <form onSubmit={handleAddMilestoneSubmit} className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-900">Thêm giai đoạn / đầu việc mới:</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingMilestone(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Hủy
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tên đầu mục công việc cụ thể..."
                    value={newMsTitle}
                    onChange={e => setNewMsTitle(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Hạn hoàn thành mốc</label>
                      <input
                        type="date"
                        value={newMsDueDate}
                        onChange={e => setNewMsDueDate(e.target.value)}
                        required
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Tỷ trọng tiến độ (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newMsWeight}
                        onChange={e => setNewMsWeight(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Lưu Giai Đoạn
                  </button>
                </form>
              )}

              {/* Milestones List */}
              <div className="space-y-2.5">
                {task.milestones?.map((ms, index) => (
                  <div
                    key={ms.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      ms.completed
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={ms.completed}
                        onChange={() => toggleMilestone(task.id, ms.id)}
                        className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                      <div>
                        <p className={`text-xs font-bold ${ms.completed ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                          {index + 1}. {ms.title}
                        </p>
                        <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Hạn: <strong>{ms.dueDate}</strong></span>
                          </span>
                          <span>• Tỷ trọng: {ms.weightPercent || 25}%</span>
                          {ms.completed && ms.completedAt && (
                            <span className="text-emerald-700 font-semibold">
                              (Xong ngày {ms.completedAt})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {canEditTask(task) && task.milestones.length > 1 && (
                      <button
                        onClick={() => deleteMilestone(task.id, ms.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        title="Xóa giai đoạn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ATTACHMENTS / TỆP TIN ĐÍNH KÈM */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Văn bản chỉ đạo & Tệp tin kết quả thực hiện
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ tệp tin PDF, DOCX, XLSX, Scan tờ trình, hình ảnh hiện trường
                  </p>
                </div>
              </div>

              {/* Upload Drop Area */}
              <label className="border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50/30 transition-all rounded-xl p-5 text-center block cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-slate-800 block">
                  Nhấn để chọn tệp tin hoặc kéo thả tệp vào đây
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Dung lượng tối đa 50MB/tệp
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Attachments List */}
              <div className="space-y-2">
                {task.attachments?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Chưa có tài liệu nào được đính kèm.
                  </p>
                ) : (
                  task.attachments?.map(att => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{att.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {(att.size / 1024 / 1024).toFixed(2)} MB • Tải bởi {att.uploadedBy} ngày {att.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          href={att.url}
                          download={att.name}
                          onClick={e => {
                            if (att.url === '#') {
                              e.preventDefault();
                              alert(`Đang mở tài liệu: ${att.name}`);
                            }
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Tải về
                        </a>
                        {canEditTask(task) && (
                          <button
                            onClick={() => removeAttachment(task.id, att.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Xóa tệp đính kèm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PERSONNEL & ASSIGNMENT INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Lead Assignee Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cán Bộ Chủ Trì Chính
                  </span>
                  {leadUser ? (
                    <div className="flex items-center space-x-3">
                      <img
                        src={leadUser.avatar}
                        alt={leadUser.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{leadUser.fullName}</p>
                        <p className="text-xs text-slate-600">{leadUser.position}</p>
                        <p className="text-[11px] text-slate-500">{leadUser.email} • {leadUser.phone}</p>
                        <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          KPI Tích Lũy: {leadUser.kpiScore} điểm
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Chưa phân công</p>
                  )}
                </div>

                {/* Collaborators Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cán Bộ Phối Hợp Thực Hiện ({collabUsers.length})
                  </span>
                  {collabUsers.length === 0 ? (
                    <p className="text-slate-400 italic">Không có cán bộ phối hợp</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {collabUsers.map(collab => (
                        <div key={collab.id} className="flex items-center space-x-2.5">
                          <img
                            src={collab.avatar}
                            alt={collab.fullName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{collab.fullName}</p>
                            <p className="text-[10px] text-slate-500">{collab.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Task Matrix Specification */}
              <div className="p-4 bg-red-50/70 rounded-xl border border-red-200/80 space-y-2">
                <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
                  <Table2 className="w-4 h-4 text-red-600" />
                  <span>Quy Chuẩn Ma Trận Nhiệm Vụ Cơ Quan (4 Tiêu Chí)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-red-100">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Phạm vi thực hiện:</span>
                    <span className="font-bold text-slate-800">
                      {task.matrixDepartmentScope === 'ALL' || !task.matrixDepartmentScope ? '🏛️ Toàn cơ quan' : `🏢 ${dept?.name || task.matrixDepartmentScope}`}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-red-100">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Nhóm nhiệm vụ:</span>
                    <span className="font-bold text-red-700">
                      {task.matrixGroup ? `⭐ Nhóm ${task.matrixGroup}` : 'Nhóm chuẩn cơ quan'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-red-100">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Điểm phân loại ma trận:</span>
                    <span className="font-extrabold text-amber-700">
                      🌟 {task.matrixPoints || Math.round(task.kpiPoints / 20) || 5} / 5 Điểm
                    </span>
                  </div>
                </div>
              </div>

              {/* Task Description */}
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Nội Dung Chỉ Đạo & Thuyết Minh Nhiệm Vụ
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {task.description || 'Không có mô tả chi tiết.'}
                </p>
              </div>

              {/* Reminder Log */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-slate-700 text-xs">
                    Đã đôn đốc nhắc việc: <strong>{task.reminderCount} lần</strong>
                    {task.remindedAt && ` (Gần nhất: ${task.remindedAt})`}
                  </span>
                </div>
                {(currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD' || currentUser.role === 'DEPT_HEAD') && (
                  <button
                    id="btn-open-urgent-dispatch"
                    onClick={() => openUrgentDispatchModal(task)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all self-start sm:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Đôn Đốc Ngay (Hệ Thống + Email)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEW & KPI APPROVAL (LEADERS ONLY) */}
          {activeTab === 'review' && canReviewTask(task) && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <h3 className="text-sm font-bold text-emerald-900">
                  Hội Đồng Đánh Giá & Nghiệm Thu Kết Quả Nhiệm Vụ
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Khi nghiệm thu hoàn thành, điểm KPI sẽ được cộng trực tiếp vào hồ sơ cán bộ chủ trì.
                </p>
              </div>

              {task.status === 'COMPLETED' ? (
                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Nhiệm vụ đã được nghiệm thu hoàn thành</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Điểm đánh giá thực tế: <strong className="text-emerald-700 text-sm">{task.ratingScore || 100}%</strong> (+{task.kpiPoints} KPI)
                  </p>
                  <p className="text-xs text-slate-600">
                    Ý kiến nhận xét của Lãnh đạo: <em className="text-slate-800 font-medium">"{task.reviewNote || 'Hoàn thành xuất sắc'}"</em>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Chấm điểm đánh giá chất lượng hoàn thành (0 - 100%):
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={reviewRating}
                        onChange={e => setReviewRating(Number(e.target.value))}
                        className="flex-1 accent-red-600 cursor-pointer"
                      />
                      <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-sm min-w-[60px] text-center border border-amber-200">
                        {reviewRating}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Ý kiến chỉ đạo / Nhận xét của Lãnh đạo:
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Ghi nhận xét về chất lượng hồ sơ, thời gian hoàn thành, tinh thần trách nhiệm..."
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-slate-800"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => approveTaskReview(task.id, reviewRating, reviewComment)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Phê Duyệt Nghiệm Thu & Ghi Nhận KPI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Urgent Reminder Drawer if triggered */}
        {isReminderOpen && (
          <div className="p-4 bg-amber-100 border-t border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900">Nội dung đôn đốc khẩn cấp gửi đến cán bộ:</span>
              <button onClick={() => setIsReminderOpen(false)} className="text-amber-800 hover:text-amber-950">Đóng</button>
            </div>
            <input
              type="text"
              value={customReminderMsg}
              onChange={e => setCustomReminderMsg(e.target.value)}
              placeholder="VD: Yêu cầu khẩn trương hoàn thành báo cáo số liệu trước 16h30 chiều nay..."
              className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-900"
            />
            <button
              onClick={() => {
                sendUrgentReminder(task.id, customReminderMsg);
                setIsReminderOpen(false);
                setCustomReminderMsg('');
                alert('Đã gửi thông báo đôn đốc khẩn cấp tới cán bộ chủ trì!');
              }}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
            >
              Gửi Thông Báo Ngay
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Tạo bởi: <strong>{creatorUser?.fullName}</strong> ngày {new Date(task.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <button
            onClick={() => setSelectedTaskId(null)}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
