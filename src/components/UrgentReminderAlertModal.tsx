import React from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Bell,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Building2,
  Calendar,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';

export const UrgentReminderAlertModal: React.FC = () => {
  const {
    pendingUrgentAlert,
    dismissUrgentAlert,
    currentUser,
    tasks
  } = useApp();

  if (!pendingUrgentAlert) return null;

  const targetTask = tasks.find(t => t.id === pendingUrgentAlert.taskId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden flex flex-col my-6 animate-pulse-glow"
        onClick={e => e.stopPropagation()}
      >
        {/* Urgent Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white relative">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-amber-300 shadow-lg animate-bounce">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-red-950/60 px-2 py-0.5 rounded border border-amber-300/40">
                  CẢNH BÁO ĐÔN ĐỐC KHẨN CẤP
                </span>
                <span className="text-[10px] text-amber-200 font-bold">KHI ĐĂNG NHẬP</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight mt-1">
                Lệnh Đôn Đốc Nhiệm Vụ Từ Lãnh Đạo
              </h2>
              <p className="text-[11px] text-red-100">
                Ủy Ban Mặt Trận Tổ Quốc Việt Nam Tỉnh Bắc Ninh
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Greeting */}
          <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl">
            <p className="text-slate-800">
              Kính gửi đồng chí: <strong className="text-red-800 text-sm">{currentUser.fullName}</strong> ({currentUser.position})
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Hệ thống ghi nhận đồng chí có <strong>01 nhiệm vụ công tác quan trọng</strong> đang được Lãnh đạo cơ quan theo dõi và đôn đốc tiến độ khẩn cấp:
            </p>
          </div>

          {/* Task Callout */}
          <div className="p-4 bg-white rounded-xl border-2 border-red-300 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-mono font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded border border-red-300">
                {pendingUrgentAlert.taskCode}
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Hạn chót: {targetTask?.dueDate || 'Khẩn cấp'}</span>
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {pendingUrgentAlert.taskTitle}
            </h3>

            {/* Leadership Directive Box */}
            <div className="p-3.5 bg-gradient-to-br from-amber-50 to-red-50 border-l-4 border-red-600 rounded-r-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-red-900 font-bold text-[11px]">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Ý kiến chỉ đạo của Lãnh đạo ({pendingUrgentAlert.senderName} - {pendingUrgentAlert.senderPosition}):</span>
              </div>
              <p className="text-xs font-semibold text-red-950 italic pl-1 leading-relaxed">
                "{pendingUrgentAlert.urgentMessage}"
              </p>
              <div className="text-[10px] text-slate-500 pt-1 text-right">
                Thời gian phát lệnh: {new Date(pendingUrgentAlert.dispatchedAt).toLocaleTimeString('vi-VN')} ngày {new Date(pendingUrgentAlert.dispatchedAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Delivery Channels Record */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
            <div className="font-bold text-slate-700 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Các kênh đôn đốc đã phát hành đồng thời:</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] text-slate-600 pl-4">
              <span className="flex items-center space-x-1">
                <Bell className="w-3.5 h-3.5 text-red-600" />
                <span>Cảnh báo khi đăng nhập hệ thống: <strong className="text-emerald-700">Đang hiển thị</strong></span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Từ: <strong className="text-red-700 font-bold">{pendingUrgentAlert.senderEmail || 'ubmttq@bacninh.gov.vn'}</strong> &rarr; Đến: <strong className="text-blue-700">{pendingUrgentAlert.recipientEmail}</strong></span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              id="btn-alert-view-task"
              onClick={() => dismissUrgentAlert(pendingUrgentAlert.id, true)}
              className="w-full py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 text-xs transition-all active:scale-98"
            >
              <span>Xem Chi Tiết Nhiệm Vụ & Báo Cáo Xử Lý Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-alert-acknowledge"
              onClick={() => dismissUrgentAlert(pendingUrgentAlert.id, false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors text-center"
            >
              ✓ Tôi đã tiếp nhận chỉ đạo đôn đốc này
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Cổng Điều Hành Công Vụ Số — Cơ Quan Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh
        </div>
      </div>
    </div>
  );
};
