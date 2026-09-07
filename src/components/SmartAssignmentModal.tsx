import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

export const SmartAssignmentModal: React.FC = () => {
  const {
    isSmartAssignModalOpen,
    setIsSmartAssignModalOpen,
    departments,
    users,
    getSmartAssignmentSuggestions,
    setIsCreateModalOpen
  } = useApp();

  const [sampleTitle, setSampleTitle] = useState('Xây dựng đề án Chuyển đổi số và Tích hợp CSDL Quốc gia');
  const [sampleDesc, setSampleDesc] = useState('Yêu cầu cán bộ có kỹ năng an toàn thông tin, lập trình web API và điều phối liên ngành.');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [priority, setPriority] = useState('URGENT');

  if (!isSmartAssignModalOpen) return null;

  const suggestions = getSmartAssignmentSuggestions(sampleTitle, sampleDesc, selectedDept, priority);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-red-600 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <span>Trung Tâm Phân Công Nhân Sự Tự Động</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold">
                  AI Smart Engine
                </span>
              </h2>
              <p className="text-xs text-amber-100">
                Thuật toán cân bằng tải công việc, phân tích chuyên môn và điểm KPI
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSmartAssignModalOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Box */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Chủ đề / Yêu cầu công việc cần phân công:
            </label>
            <input
              type="text"
              value={sampleTitle}
              onChange={e => setSampleTitle(e.target.value)}
              placeholder="Nhập tiêu đề nhiệm vụ..."
              className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Phòng ban đề xuất</label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">Toàn bộ cơ quan</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="URGENT">Hỏa Tốc (Khẩn)</option>
                <option value="HIGH">Thượng Khẩn</option>
                <option value="MEDIUM">Bình Thường</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kết Quả Phân Tích & Đề Xuất Cán Bộ Tối Ưu ({suggestions.length} ứng viên)
            </span>
            <span className="text-[11px] text-slate-500">
              Sắp xếp theo độ phù hợp
            </span>
          </div>

          <div className="space-y-3">
            {suggestions.map((sug, index) => {
              const user = users.find(u => u.id === sug.recommendedUserId);
              const dept = departments.find(d => d.id === sug.departmentId);
              if (!user) return null;

              const isTop = index === 0;

              return (
                <div
                  key={sug.recommendedUserId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isTop
                      ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-amber-300 shadow-md ring-1 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200"
                        />
                        {isTop && (
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-amber-950 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                            ★1
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{user.fullName}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            sug.workloadStatus === 'LIGHT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sug.workloadStatus === 'MODERATE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Tải việc: {sug.workloadStatus === 'LIGHT' ? 'Nhẹ' : sug.workloadStatus === 'MODERATE' ? 'Vừa phải' : 'Bận'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          {user.position} • {dept?.name}
                        </p>

                        <p className="text-xs text-slate-700 bg-white/80 p-2 rounded-lg border border-slate-100 mt-1">
                          💡 <strong>Lý do chọn:</strong> {sug.reason}
                        </p>

                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                          <span>Nhiệm vụ đang làm: <strong>{user.activeTaskCount} việc</strong></span>
                          <span>• Điểm KPI: <strong className="text-amber-600">{user.kpiScore}đ</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="px-3 py-1 bg-slate-900 text-amber-300 rounded-xl font-mono text-sm font-bold shadow-2xs">
                        {sug.score} điểm
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Hệ thống tự động điều phối để tránh dồn việc cho 1 cá nhân
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSmartAssignModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                setIsSmartAssignModalOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5"
            >
              <span>Tạo việc với gợi ý này</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
