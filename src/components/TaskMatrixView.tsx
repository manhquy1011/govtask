import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TaskMatrixItem, TaskMatrixGroup, TaskMatrixPoints } from '../types';
import {
  Table2,
  Plus,
  Search,
  Filter,
  Building2,
  Award,
  Sparkles,
  Edit2,
  Trash2,
  Send,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
  SlidersHorizontal,
  ChevronRight,
  LayoutGrid,
  List,
  Check,
  Star,
  FileText,
  X
} from 'lucide-react';

export const TaskMatrixView: React.FC = () => {
  const {
    taskMatrix,
    departments,
    createTaskMatrixItem,
    updateTaskMatrixItem,
    deleteTaskMatrixItem,
    createTaskFromMatrix,
    currentUser,
    canCreateTask,
    tasks
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedPointsFilter, setSelectedPointsFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaskMatrixItem | null>(null);

  // Form states for the 4 attributes
  const [formName, setFormName] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState<string>('ALL');
  const [formGroup, setFormGroup] = useState<TaskMatrixGroup>('N1');
  const [formPoints, setFormPoints] = useState<TaskMatrixPoints>(5);
  const [formDescription, setFormDescription] = useState('');

  // Group definitions for clear guidance
  const groupMetadata: Record<TaskMatrixGroup, { label: string; sub: string; color: string; bg: string; border: string }> = {
    N1: {
      label: 'Nhóm N1: Trọng tâm & Chỉ đạo',
      sub: 'Nhiệm vụ đột phá, công tác trọng tâm cấp bách của Ban Thường trực',
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    N2: {
      label: 'Nhóm N2: Thường xuyên',
      sub: 'Công tác định kỳ, chế độ hội họp, báo cáo tháng/quý theo quy chế',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    N3: {
      label: 'Nhóm N3: Chuyên môn & Giám sát',
      sub: 'Giám sát, phản biện xã hội, kiểm tra, thẩm định chuyên đề',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    N4: {
      label: 'Nhóm N4: Phối hợp & Phong trào',
      sub: 'Công tác tuyên truyền, các cuộc vận động, phong trào thi đua liên ngành',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    N5: {
      label: 'Nhóm N5: Hành chính & Hậu cần',
      sub: 'Văn thư, tiếp nhận hồ sơ, tài chính, khánh tiết, công nghệ',
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-300'
    }
  };

  // Filtered list
  const filteredMatrix = useMemo(() => {
    return taskMatrix.filter(item => {
      // Search
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Group
      const matchGroup = selectedGroupFilter === 'ALL' || item.taskGroup === selectedGroupFilter;

      // Dept scope
      const matchDept = selectedDeptFilter === 'ALL' || item.departmentId === selectedDeptFilter;

      // Points
      const matchPoints = selectedPointsFilter === 'ALL' || item.points.toString() === selectedPointsFilter;

      return matchSearch && matchGroup && matchDept && matchPoints;
    });
  }, [taskMatrix, searchQuery, selectedGroupFilter, selectedDeptFilter, selectedPointsFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = taskMatrix.length;
    const n1 = taskMatrix.filter(m => m.taskGroup === 'N1').length;
    const n2 = taskMatrix.filter(m => m.taskGroup === 'N2').length;
    const n3 = taskMatrix.filter(m => m.taskGroup === 'N3').length;
    const n4 = taskMatrix.filter(m => m.taskGroup === 'N4').length;
    const n5 = taskMatrix.filter(m => m.taskGroup === 'N5').length;
    const agencyWide = taskMatrix.filter(m => m.departmentId === 'ALL').length;
    return { total, n1, n2, n3, n4, n5, agencyWide };
  }, [taskMatrix]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDepartmentId('ALL');
    setFormGroup('N1');
    setFormPoints(5);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TaskMatrixItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDepartmentId(item.departmentId);
    setFormGroup(item.taskGroup);
    setFormPoints(item.points);
    setFormDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập tên nhiệm vụ');
      return;
    }

    if (editingItem) {
      updateTaskMatrixItem(editingItem.id, {
        name: formName.trim(),
        departmentId: formDepartmentId,
        taskGroup: formGroup,
        points: formPoints,
        description: formDescription.trim(),
      });
    } else {
      createTaskMatrixItem({
        name: formName.trim(),
        departmentId: formDepartmentId,
        taskGroup: formGroup,
        points: formPoints,
        description: formDescription.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Đồng chí có chắc chắn muốn xóa nhiệm vụ "${name}" khỏi Ma trận chuẩn?`)) {
      deleteTaskMatrixItem(id);
    }
  };

  const getDepartmentName = (deptId: string) => {
    if (deptId === 'ALL') return '🏛️ Cả cơ quan';
    const dept = departments.find(d => d.id === deptId);
    return dept ? `🏢 ${dept.name}` : deptId;
  };

  const getPointColor = (pts: number) => {
    switch (pts) {
      case 5: return 'bg-red-100 text-red-700 border-red-200';
      case 4: return 'bg-amber-100 text-amber-800 border-amber-200';
      case 3: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-md shadow-red-600/20">
            <Table2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900">
                Ma Trận Nhiệm Vụ Cơ Quan
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                4 Tiêu Chí Chuẩn
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Danh mục phân loại nhiệm vụ chuẩn hóa theo 5 nhóm (N1 - N5) và thang điểm đánh giá (1 - 5 điểm) của UB MTTQ tỉnh Bắc Ninh
            </p>
          </div>
        </div>

        {canCreateTask && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhiệm Vụ Vào Ma Trận</span>
          </button>
        )}
      </div>

      {/* 4 Attributes Guide Cards / Group Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Card */}
        <div 
          onClick={() => setSelectedGroupFilter('ALL')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedGroupFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tất cả ma trận</span>
            <Layers className={`w-4 h-4 ${selectedGroupFilter === 'ALL' ? 'text-red-400' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-black mt-1">{stats.total}</div>
          <p className={`text-[10px] mt-0.5 ${selectedGroupFilter === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            {stats.agencyWide} việc toàn cơ quan
          </p>
        </div>

        {/* N1 */}
        <div 
          onClick={() => setSelectedGroupFilter(selectedGroupFilter === 'N1' ? 'ALL' : 'N1')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedGroupFilter === 'N1'
              ? 'bg-red-600 text-white border-red-600 shadow-md'
              : 'bg-red-50/60 text-red-900 border-red-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase">Nhóm N1</span>
            <Star className={`w-4 h-4 ${selectedGroupFilter === 'N1' ? 'text-white' : 'text-red-500'}`} />
          </div>
          <div className="text-2xl font-black mt-1">{stats.n1}</div>
          <p className={`text-[10px] mt-0.5 truncate ${selectedGroupFilter === 'N1' ? 'text-red-100' : 'text-red-700'}`}>
            Trọng tâm & chỉ đạo
          </p>
        </div>

        {/* N2 */}
        <div 
          onClick={() => setSelectedGroupFilter(selectedGroupFilter === 'N2' ? 'ALL' : 'N2')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedGroupFilter === 'N2'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-blue-50/60 text-blue-900 border-blue-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase">Nhóm N2</span>
            <span className="text-xs font-bold">2-4đ</span>
          </div>
          <div className="text-2xl font-black mt-1">{stats.n2}</div>
          <p className={`text-[10px] mt-0.5 truncate ${selectedGroupFilter === 'N2' ? 'text-blue-100' : 'text-blue-700'}`}>
            Thường xuyên, định kỳ
          </p>
        </div>

        {/* N3 */}
        <div 
          onClick={() => setSelectedGroupFilter(selectedGroupFilter === 'N3' ? 'ALL' : 'N3')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedGroupFilter === 'N3'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-purple-50/60 text-purple-900 border-purple-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase">Nhóm N3</span>
            <span className="text-xs font-bold">3-5đ</span>
          </div>
          <div className="text-2xl font-black mt-1">{stats.n3}</div>
          <p className={`text-[10px] mt-0.5 truncate ${selectedGroupFilter === 'N3' ? 'text-purple-100' : 'text-purple-700'}`}>
            Chuyên môn & giám sát
          </p>
        </div>

        {/* N4 */}
        <div 
          onClick={() => setSelectedGroupFilter(selectedGroupFilter === 'N4' ? 'ALL' : 'N4')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedGroupFilter === 'N4'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase">Nhóm N4</span>
            <span className="text-xs font-bold">2-4đ</span>
          </div>
          <div className="text-2xl font-black mt-1">{stats.n4}</div>
          <p className={`text-[10px] mt-0.5 truncate ${selectedGroupFilter === 'N4' ? 'text-amber-100' : 'text-amber-700'}`}>
            Phối hợp & phong trào
          </p>
        </div>

        {/* N5 */}
        <div 
          onClick={() => setSelectedGroupFilter(selectedGroupFilter === 'N5' ? 'ALL' : 'N5')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedGroupFilter === 'N5'
              ? 'bg-slate-700 text-white border-slate-700 shadow-md'
              : 'bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase">Nhóm N5</span>
            <span className="text-xs font-bold">1-3đ</span>
          </div>
          <div className="text-2xl font-black mt-1">{stats.n5}</div>
          <p className={`text-[10px] mt-0.5 truncate ${selectedGroupFilter === 'N5' ? 'text-slate-200' : 'text-slate-600'}`}>
            Hành chính & hậu cần
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhiệm vụ, mã ma trận hoặc nội dung..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Department */}
            <select
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-red-500"
            >
              <option value="ALL">Phạm vi: Tất cả</option>
              <option value="ALL">🏛️ Cả cơ quan</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>🏢 {d.name}</option>
              ))}
            </select>

            {/* Filter by Group */}
            <select
              value={selectedGroupFilter}
              onChange={e => setSelectedGroupFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-red-500"
            >
              <option value="ALL">Nhóm: Tất cả (N1 - N5)</option>
              <option value="N1">⭐ Nhóm N1: Trọng tâm, chỉ đạo</option>
              <option value="N2">📌 Nhóm N2: Thường xuyên</option>
              <option value="N3">🔬 Nhóm N3: Chuyên môn, giám sát</option>
              <option value="N4">🤝 Nhóm N4: Phối hợp, phong trào</option>
              <option value="N5">📋 Nhóm N5: Hành chính, hậu cần</option>
            </select>

            {/* Filter by Points */}
            <select
              value={selectedPointsFilter}
              onChange={e => setSelectedPointsFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-red-500"
            >
              <option value="ALL">Điểm: Tất cả (1-5đ)</option>
              <option value="5">🌟 5 điểm</option>
              <option value="4">⭐ 4 điểm</option>
              <option value="3">🔹 3 điểm</option>
              <option value="2">🔸 2 điểm</option>
              <option value="1">▫️ 1 điểm</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng thẻ lưới"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng bảng ma trận"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters readout */}
        {(selectedGroupFilter !== 'ALL' || selectedDeptFilter !== 'ALL' || selectedPointsFilter !== 'ALL' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-900">{filteredMatrix.length}</span> / {taskMatrix.length} nhiệm vụ phù hợp
            </div>
            <button
              onClick={() => {
                setSelectedGroupFilter('ALL');
                setSelectedDeptFilter('ALL');
                setSelectedPointsFilter('ALL');
                setSearchQuery('');
              }}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMatrix.map(item => {
            const groupInfo = groupMetadata[item.taskGroup];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Group + Points + Scope */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${groupInfo.bg} ${groupInfo.color} ${groupInfo.border}`}>
                        {item.taskGroup}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${getPointColor(item.points)}`}>
                        {item.points} Điểm
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[140px]">
                      {getDepartmentName(item.departmentId)}
                    </span>
                  </div>

                  {/* 1. Task Name */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    {item.name}
                  </h3>

                  {/* Description / Deliverable */}
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer Bar & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Mã: <span className="font-mono text-slate-600">{item.code || item.id}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {canCreateTask && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa nhiệm vụ ma trận"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa khỏi ma trận"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => createTaskFromMatrix(item)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                      title="Giao nhiệm vụ này cho cán bộ ngay"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Giao Việc</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">STT</th>
                  <th className="py-3.5 px-4">1. Tên Nhiệm Vụ</th>
                  <th className="py-3.5 px-4 w-44">2. Phòng/Ban Thực Hiện</th>
                  <th className="py-3.5 px-4 w-32">3. Nhóm Nhiệm Vụ</th>
                  <th className="py-3.5 px-4 w-28 text-center">4. Điểm Số</th>
                  <th className="py-3.5 px-4 w-40 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Không tìm thấy nhiệm vụ nào trong Ma trận phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredMatrix.map((item, idx) => {
                    const groupInfo = groupMetadata[item.taskGroup];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          {item.description && (
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Mã: {item.code || item.id}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {getDepartmentName(item.departmentId)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-black border ${groupInfo.bg} ${groupInfo.color} ${groupInfo.border}`}>
                            {item.taskGroup}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-black border ${getPointColor(item.points)}`}>
                            {item.points} Điểm
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => createTaskFromMatrix(item)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Giao</span>
                            </button>

                            {canCreateTask && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                  title="Sửa"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.name)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Thêm mới / Chỉnh sửa Nhiệm Vụ Trong Ma Trận */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-red-700 to-red-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Table2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {editingItem ? 'Chỉnh Sửa Nhiệm Vụ Trong Ma Trận' : 'Thêm Nhiệm Vụ Mới Vào Ma Trận'}
                  </h2>
                  <p className="text-xs text-red-100">
                    Thiết lập 4 tiêu chí cốt lõi để chuẩn hóa quy trình điều hành
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveModal} className="p-5 space-y-4 text-xs overflow-y-auto">
              {/* 1. Tên nhiệm vụ */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  1. Tên nhiệm vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giám sát việc thực hiện các kiến nghị sau thanh tra, kiểm tra..."
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-slate-900 font-bold"
                />
              </div>

              {/* 2. Phòng/ban thực hiện */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  2. Phòng/ban thực hiện (Có thể chọn 1 phòng/ban cụ thể hoặc cả cơ quan) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formDepartmentId}
                  onChange={e => setFormDepartmentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 font-semibold"
                >
                  <option value="ALL">🏛️ Cả cơ quan (Áp dụng toàn thể cơ quan UB MTTQ tỉnh)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>🏢 {d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* 3. Nhóm nhiệm vụ & 4. Điểm nhiệm vụ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                {/* 3. Nhóm nhiệm vụ (5 lựa chọn: N1, N2, N3, N4, N5) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    3. Nhóm nhiệm vụ (5 lựa chọn: N1 - N5) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formGroup}
                    onChange={e => setFormGroup(e.target.value as TaskMatrixGroup)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 font-bold"
                  >
                    <option value="N1">⭐ Nhóm N1: Trọng tâm & Chỉ đạo</option>
                    <option value="N2">📌 Nhóm N2: Thường xuyên & Định kỳ</option>
                    <option value="N3">🔬 Nhóm N3: Chuyên môn & Giám sát</option>
                    <option value="N4">🤝 Nhóm N4: Phối hợp & Phong trào</option>
                    <option value="N5">📋 Nhóm N5: Hành chính & Hậu cần</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {groupMetadata[formGroup].sub}
                  </p>
                </div>

                {/* 4. Điểm nhiệm vụ (1, 2, 3, 4, 5) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    4. Điểm nhiệm vụ (1, 2, 3, 4, 5) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPoints}
                    onChange={e => setFormPoints(Number(e.target.value) as TaskMatrixPoints)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 font-black text-red-600"
                  >
                    <option value={5}>🌟 5 Điểm - Độ khó rất cao / Đột xuất đặc biệt quan trọng</option>
                    <option value={4}>⭐ 4 Điểm - Trọng tâm / Nhiều bên phối hợp</option>
                    <option value={3}>🔹 3 Điểm - Khá / Yêu cầu chuyên môn sâu</option>
                    <option value={2}>🔸 2 Điểm - Trung bình / Thường quy định kỳ</option>
                    <option value={1}>▫️ 1 Điểm - Hành chính / Thao tác đơn giản</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Quy đổi tương ứng {(formPoints as number) * 20} điểm KPI hệ thống.
                  </p>
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Mô tả sản phẩm đầu ra / Yêu cầu chuẩn hóa
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú yêu cầu sản phẩm, biểu mẫu hoặc văn bản nghiệm thu..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-slate-800"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'Lưu Thay Đổi' : 'Tạo Nhiệm Vụ Ma Trận'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
