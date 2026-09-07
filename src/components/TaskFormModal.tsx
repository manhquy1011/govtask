import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TaskGroup, TaskPriority, TaskStatus, TaskMilestone, TaskMatrixGroup, TaskMatrixPoints } from '../types';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Calendar,
  Layers,
  Paperclip,
  CheckCircle2,
  UserCheck,
  Building2,
  AlertCircle,
  Table2,
  Star,
  Zap
} from 'lucide-react';

export const TaskFormModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTask,
    departments,
    users,
    currentUser,
    taskMatrix,
    prefillTaskData,
    setPrefillTaskData,
    getSmartAssignmentSuggestions
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState(
    currentUser.role === 'DEPT_HEAD' ? currentUser.departmentId : departments[0]?.id || 'dept-van-phong'
  );
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [group, setGroup] = useState<TaskGroup>('FOCUS');
  const [kpiPoints, setKpiPoints] = useState<number>(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Matrix Fields requested by user:
  const [matrixGroup, setMatrixGroup] = useState<TaskMatrixGroup>('N1');
  const [matrixPoints, setMatrixPoints] = useState<TaskMatrixPoints>(5);
  const [matrixDepartmentScope, setMatrixDepartmentScope] = useState<string>('ALL');
  const [selectedMatrixTemplateId, setSelectedMatrixTemplateId] = useState<string>('');

  // Default due date: 10 days ahead
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 10);
  const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split('T')[0]);

  const [leadAssigneeId, setLeadAssigneeId] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  
  // Initial Milestones list
  const [milestones, setMilestones] = useState<{ title: string; dueDate: string; weightPercent: number }[]>([
    { title: 'Khảo sát hiện trạng & Thu thập dữ liệu yêu cầu', dueDate: new Date().toISOString().split('T')[0], weightPercent: 30 },
    { title: 'Thực hiện nội dung chuyên môn và tổng hợp hồ sơ', dueDate: defaultDueDate.toISOString().split('T')[0], weightPercent: 40 },
    { title: 'Báo cáo nghiệm thu và trình Lãnh đạo ký duyệt', dueDate: defaultDueDate.toISOString().split('T')[0], weightPercent: 30 },
  ]);

  const [aiSuggestionNotice, setAiSuggestionNotice] = useState<string | null>(null);

  // Sync prefilled data if launched from Task Matrix
  useEffect(() => {
    if (isCreateModalOpen && prefillTaskData) {
      if (prefillTaskData.title) setTitle(prefillTaskData.title);
      if (prefillTaskData.description) setDescription(prefillTaskData.description);
      if (prefillTaskData.departmentId) setDepartmentId(prefillTaskData.departmentId);
      if (prefillTaskData.priority) setPriority(prefillTaskData.priority);
      if (prefillTaskData.group) setGroup(prefillTaskData.group);
      if (prefillTaskData.kpiPoints) setKpiPoints(prefillTaskData.kpiPoints);
      if (prefillTaskData.matrixGroup) setMatrixGroup(prefillTaskData.matrixGroup);
      if (prefillTaskData.matrixPoints) setMatrixPoints(prefillTaskData.matrixPoints);
      if (prefillTaskData.matrixDepartmentScope) setMatrixDepartmentScope(prefillTaskData.matrixDepartmentScope);
      if (prefillTaskData.taskMatrixId) setSelectedMatrixTemplateId(prefillTaskData.taskMatrixId);
      if (prefillTaskData.dueDate) setDueDate(prefillTaskData.dueDate);
    } else if (isCreateModalOpen && !prefillTaskData) {
      // Reset form to defaults
      setTitle('');
      setDescription('');
      setSelectedMatrixTemplateId('');
      setAiSuggestionNotice(null);
      setMatrixGroup('N1');
      setMatrixPoints(5);
      setMatrixDepartmentScope(currentUser.role === 'DEPT_HEAD' ? currentUser.departmentId : 'ALL');
      setDepartmentId(currentUser.role === 'DEPT_HEAD' ? currentUser.departmentId : departments[0]?.id || 'dept-van-phong');
    }
  }, [isCreateModalOpen, prefillTaskData]);

  if (!isCreateModalOpen) return null;

  // Filter candidates based on selected department
  const deptUsers = users.filter(u => (departmentId === 'ALL' || u.departmentId === departmentId) && u.status === 'active');
  const availableUsers = deptUsers.length > 0 ? deptUsers : users.filter(u => u.status === 'active');

  // Trigger Smart Assignment Suggestions
  const handleAutoAssign = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên hoặc chủ đề nhiệm vụ trước để hệ thống phân tích từ khóa và chuyên môn!');
      return;
    }

    const suggestions = getSmartAssignmentSuggestions(title, description, departmentId, priority);
    if (suggestions.length > 0) {
      const top = suggestions[0];
      setLeadAssigneeId(top.recommendedUserId);
      setCollaboratorIds(top.recommendedCollaboratorIds);
      if (top.departmentId && top.departmentId !== 'ALL') {
        setDepartmentId(top.departmentId);
      }

      const recUser = users.find(u => u.id === top.recommendedUserId);
      setAiSuggestionNotice(
        `⚡ Đã phân công tự động cho ${recUser?.fullName} (${recUser?.position}) - Lý do: ${top.reason}`
      );
    }
  };

  // When selecting a template from the Task Matrix dropdown
  const handleSelectMatrixTemplate = (templateId: string) => {
    setSelectedMatrixTemplateId(templateId);
    if (!templateId) return;

    const matched = taskMatrix.find(m => m.id === templateId);
    if (matched) {
      setTitle(matched.name);
      setDescription(matched.description || `Nhiệm vụ theo danh mục chuẩn Ma trận: Nhóm ${matched.taskGroup} (${matched.points} điểm).`);
      setMatrixGroup(matched.taskGroup);
      setMatrixPoints(matched.points);
      setMatrixDepartmentScope(matched.departmentId);
      setKpiPoints(matched.points * 20); // 1->20, 5->100
      
      if (matched.departmentId !== 'ALL') {
        setDepartmentId(matched.departmentId);
      }
      
      if (matched.taskGroup === 'N1') setGroup('FOCUS');
      else if (matched.taskGroup === 'N2') setGroup('REGULAR');
      else if (matched.taskGroup === 'N3') setGroup('PROJECT');
      else if (matched.taskGroup === 'N4') setGroup('URGENT_AD_HOC');
      else if (matched.taskGroup === 'N5') setGroup('ADMINISTRATIVE');
      
      setPriority(matched.points >= 4 ? 'URGENT' : matched.points >= 3 ? 'HIGH' : 'MEDIUM');
    }
  };

  const handleAddMilestoneField = () => {
    setMilestones(prev => [
      ...prev,
      { title: '', dueDate: dueDate, weightPercent: 20 }
    ]);
  };

  const handleRemoveMilestoneField = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    setMilestones(prev =>
      prev.map((m, idx) => (idx === index ? { ...m, [field]: value } : m))
    );
  };

  const toggleCollaborator = (userId: string) => {
    if (collaboratorIds.includes(userId)) {
      setCollaboratorIds(collaboratorIds.filter(id => id !== userId));
    } else {
      setCollaboratorIds([...collaboratorIds, userId]);
    }
  };

  const handleClose = () => {
    setPrefillTaskData(null);
    setIsCreateModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên nhiệm vụ');
      return;
    }
    if (!leadAssigneeId) {
      alert('Vui lòng chọn hoặc dùng đề xuất tự động người chủ trì nhiệm vụ!');
      return;
    }

    // Format milestones with ids
    const formattedMilestones: TaskMilestone[] = milestones.map((m, idx) => ({
      id: `ms-new-${Date.now()}-${idx}`,
      title: m.title.trim() || `Giai đoạn ${idx + 1}`,
      dueDate: m.dueDate || dueDate,
      weightPercent: Number(m.weightPercent) || 25,
      completed: false,
    }));

    createTask({
      title: title.trim(),
      description: description.trim(),
      departmentId,
      creatorId: currentUser.id,
      leadAssigneeId,
      collaboratorIds,
      priority,
      status: 'IN_PROGRESS',
      group,
      taskMatrixId: selectedMatrixTemplateId || undefined,
      matrixGroup,
      matrixPoints,
      matrixDepartmentScope,
      kpiPoints: Number(kpiPoints) || 25,
      startDate,
      dueDate,
      progressPercent: 0,
      milestones: formattedMilestones,
      attachments: [],
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-700 to-red-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Giao Nhiệm Vụ Mới Của Cơ Quan</h2>
              <p className="text-xs text-red-100">
                Phân công cán bộ, gắn ma trận nhiệm vụ (N1-N5), điểm số và chia giai đoạn
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Quick Select From Task Matrix (Ma Trận Nhiệm Vụ) */}
          <div className="p-3 bg-red-50/80 rounded-xl border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <Table2 className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Mẫu từ Ma Trận Nhiệm Vụ:</span>
                <span className="text-[11px] text-slate-600 ml-1.5 hidden sm:inline">Chọn để tự động điền tiêu chuẩn</span>
              </div>
            </div>

            <select
              value={selectedMatrixTemplateId}
              onChange={e => handleSelectMatrixTemplate(e.target.value)}
              className="p-2 bg-white border border-red-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 max-w-full sm:max-w-xs"
            >
              <option value="">-- Chọn mẫu từ Ma trận ({taskMatrix.length} nhiệm vụ) --</option>
              {taskMatrix.map(m => {
                const scopeName = m.departmentId === 'ALL' ? 'Cả cơ quan' : (departments.find(d => d.id === m.departmentId)?.code || m.departmentId);
                return (
                  <option key={m.id} value={m.id}>
                    [{m.taskGroup} • {m.points}đ] {m.name.slice(0, 45)}... ({scopeName})
                  </option>
                );
              })}
            </select>
          </div>

          {/* AI / Smart Assign Quick Trigger Banner */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Tính năng phân công nhân sự tự động (AI Engine)</p>
                <p className="text-[11px] text-slate-600">
                  Tự động phân tích chuyên môn, KPI và tải công việc hiện tại để đề xuất người chủ trì tối ưu.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoAssign}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 shadow-xs transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gợi Ý Ngay</span>
            </button>
          </div>

          {aiSuggestionNotice && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{aiSuggestionNotice}</span>
            </div>
          )}

          {/* Section 1: Basic Information & Ma Trận Nhiệm Vụ Specs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                1. Tên nhiệm vụ / Văn bản chỉ đạo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Triển khai kiểm tra an toàn thông tin các hệ thống Quý III/2026..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Nội dung chi tiết & Yêu cầu sản phẩm đầu ra
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả cụ thể mục tiêu, phạm vi triển khai và kết quả cần đạt..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800"
              />
            </div>

            {/* 4 Task Matrix Attributes Container */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                <Table2 className="w-4 h-4 text-red-600" />
                <span>Cấu Hình Ma Trận Nhiệm Vụ & Điểm Số</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 2. Phòng/ban thực hiện (Có thể chọn 1 phòng/ban cụ thể hoặc cả cơ quan) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    2. Phạm vi thực hiện (Phòng/Ban)
                  </label>
                  <select
                    value={matrixDepartmentScope}
                    onChange={e => {
                      setMatrixDepartmentScope(e.target.value);
                      if (e.target.value !== 'ALL') {
                        setDepartmentId(e.target.value);
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 font-semibold"
                  >
                    <option value="ALL">🏛️ Cả cơ quan (Toàn cơ quan)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>🏢 {d.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Nhóm nhiệm vụ (5 lựa chọn: N1, N2, N3, N4, N5) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    3. Nhóm nhiệm vụ (5 Nhóm)
                  </label>
                  <select
                    value={matrixGroup}
                    onChange={e => {
                      const val = e.target.value as TaskMatrixGroup;
                      setMatrixGroup(val);
                      if (val === 'N1') setGroup('FOCUS');
                      else if (val === 'N2') setGroup('REGULAR');
                      else if (val === 'N3') setGroup('PROJECT');
                      else if (val === 'N4') setGroup('URGENT_AD_HOC');
                      else if (val === 'N5') setGroup('ADMINISTRATIVE');
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 font-bold"
                  >
                    <option value="N1">⭐ Nhóm N1: Nhiệm vụ trọng tâm, chỉ đạo</option>
                    <option value="N2">📌 Nhóm N2: Nhiệm vụ thường xuyên</option>
                    <option value="N3">🔬 Nhóm N3: Chuyên môn, thẩm định, giám sát</option>
                    <option value="N4">🤝 Nhóm N4: Phối hợp liên ban, phong trào</option>
                    <option value="N5">📋 Nhóm N5: Hành chính, hậu cần, phục vụ</option>
                  </select>
                </div>

                {/* 4. Điểm nhiệm vụ (1, 2, 3, 4, 5) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    4. Điểm nhiệm vụ (1 - 5 điểm)
                  </label>
                  <select
                    value={matrixPoints}
                    onChange={e => {
                      const pts = Number(e.target.value) as TaskMatrixPoints;
                      setMatrixPoints(pts);
                      setKpiPoints(pts * 20);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 font-bold text-red-600"
                  >
                    <option value={5}>🌟 5 điểm - Rất quan trọng / Đột xuất lớn</option>
                    <option value={4}>⭐ 4 điểm - Trọng tâm / Độ khó cao</option>
                    <option value={3}>🔹 3 điểm - Khá / Đòi hỏi phối hợp</option>
                    <option value={2}>🔸 2 điểm - Trung bình / Thường quy</option>
                    <option value={1}>▫️ 1 điểm - Hành chính / Đơn giản</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Department Assigned */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Đơn vị chịu trách nhiệm</label>
                <select
                  value={departmentId}
                  onChange={e => setDepartmentId(e.target.value)}
                  disabled={currentUser.role === 'DEPT_HEAD'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Mức độ khẩn</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800"
                >
                  <option value="URGENT">Hỏa Tốc (Khẩn cấp)</option>
                  <option value="HIGH">Thượng Khẩn</option>
                  <option value="MEDIUM">Bình Thường</option>
                  <option value="LOW">Thấp</option>
                </select>
              </div>

              {/* KPI Total Score */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Điểm KPI thưởng (Hệ số quy đổi)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={kpiPoints}
                    onChange={e => setKpiPoints(Number(e.target.value))}
                    className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 font-bold"
                  />
                  <Award className="w-4 h-4 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Start Date */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Hạn hoàn thành (Deadline)</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 font-bold text-red-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Assign Personnel */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Phân Công Cán Bộ Thực Hiện
            </h3>

            {/* Lead Assignee */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Cán bộ chủ trì chính <span className="text-red-500">*</span>
              </label>
              <select
                value={leadAssigneeId}
                onChange={e => setLeadAssigneeId(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 font-semibold"
              >
                <option value="">-- Chọn cán bộ chủ trì --</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} - {u.position} ({u.activeTaskCount} việc đang làm, KPI: {u.kpiScore}đ)
                  </option>
                ))}
              </select>
            </div>

            {/* Multiple Collaborators Selector */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Cán bộ phối hợp (Chọn nhiều người):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {users.map(u => {
                  const isChecked = collaboratorIds.includes(u.id);
                  const isLead = u.id === leadAssigneeId;
                  if (isLead) return null;

                  return (
                    <label
                      key={u.id}
                      className={`flex items-center space-x-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-red-50 border border-red-200 text-red-900 font-bold' : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCollaborator(u.id)}
                        className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="truncate">{u.fullName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Milestones & Stages */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Phân Chia Giai Đoạn & Hạn Hoàn Thành Từng Đầu Việc
                </h3>
                <p className="text-[11px] text-slate-500">
                  Giúp kiểm soát tiến độ định kỳ và đôn đốc tự động
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMilestoneField}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm giai đoạn</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-6">
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Giai đoạn {index + 1}:</span>
                    <input
                      type="text"
                      placeholder="Tên đầu việc cụ thể..."
                      value={m.title}
                      onChange={e => handleMilestoneChange(index, 'title', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Hạn mốc:</span>
                    <input
                      type="date"
                      value={m.dueDate}
                      onChange={e => handleMilestoneChange(index, 'dueDate', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Tỷ trọng:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={m.weightPercent}
                      onChange={e => handleMilestoneChange(index, 'weightPercent', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right pt-3 sm:pt-0">
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestoneField(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        title="Xóa giai đoạn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ban Hành & Giao Nhiệm Vụ</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
