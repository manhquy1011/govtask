import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldAlert,
  UserCheck,
  Award,
  RefreshCw,
  Sliders,
  Calendar,
  Mail,
  Check,
  Eye,
  FileText
} from 'lucide-react';

export const RemindersView: React.FC = () => {
  const {
    notifications,
    tasks,
    users,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    urgentDispatches,
    openUrgentDispatchModal,
    setSelectedTaskId,
    canCreateTask
  } = useApp();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedTaskToRemind, setSelectedTaskToRemind] = useState<string>('');

  const filteredNotifs = notifications.filter(n => {
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    return true;
  });

  const uncompletedTasks = tasks.filter(t => t.status !== 'COMPLETED');

  const handleLaunchDispatchModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToRemind) return;
    const task = tasks.find(t => t.id === selectedTaskToRemind);
    if (task) {
      openUrgentDispatchModal(task);
      setSelectedTaskToRemind('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 via-red-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 rounded-2xl border border-amber-300/30">
            <Clock className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
              TRUNG TÂM GIÁM SÁT & ĐIỀU HÀNH ĐÔN ĐỐC TIẾN ĐỘ
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-white">
              Tự Động Nhắc Việc & Đôn Đốc Đa Kênh (Hệ Thống + Email)
            </h1>
            <p className="text-xs text-red-100 mt-1 max-w-2xl leading-relaxed">
              Tự động cảnh báo khi đăng nhập và phát lệnh đôn đốc trực tiếp về hòm thư cá nhân của cán bộ, đảm bảo thông suốt 100% chỉ đạo của Ban Thường trực.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Configured Automated Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Cảnh Báo Khi Đăng Nhập Hệ Thống</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Popup Cảnh Báo Real-Time</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ngay khi cán bộ được đôn đốc đăng nhập tài khoản công vụ, cửa sổ chỉ đạo khẩn cấp sẽ lập tức xuất hiện nổi bật tại màn hình.
          </p>
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
            <Check className="w-3 h-3" />
            <span>Kích hoạt 24/7</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase">
            <Mail className="w-4 h-4" />
            <span>Đồng Thời Gửi Email Cá Nhân</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Email Từ ubmttq@bacninh.gov.vn</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hệ thống sử dụng hòm thư chính thức <strong>ubmttq@bacninh.gov.vn</strong> để phát hành bản tin đôn đốc điện tử chuẩn mẫu Ủy ban MTTQ Tỉnh vào hòm thư của các cá nhân.
          </p>
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
            <Check className="w-3 h-3" />
            <span>ubmttq@bacninh.gov.vn</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase">
            <Clock className="w-4 h-4" />
            <span>Quét Quá Hạn & Nhắc Hạn Chót</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Tự Động Đếm Ngược 48 Giờ</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tự động thông báo tới cán bộ trước 2 ngày đến hạn và phát chuông báo động đỏ nếu nhiệm vụ bị trễ hạn so với cam kết.
          </p>
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
            <Check className="w-3 h-3" />
            <span>Hoạt động liên tục</span>
          </span>
        </div>
      </div>

      {/* Manual Dispatch Tool (For Leadership/Admin) */}
      {(currentUser.role === 'ADMIN' || currentUser.role === 'AGENCY_LEAD' || currentUser.role === 'DEPT_HEAD') && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 p-5 rounded-2xl border border-red-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-red-950 flex items-center space-x-2">
                <Send className="w-4 h-4 text-red-600" />
                <span>Phát Lệnh Đôn Đốc Ngay (Đồng Thời Gửi Hệ Thống & Email Cá Nhân)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Chọn nhiệm vụ để mở bảng điều khiển phát lệnh đôn đốc đa kênh chuyên sâu
              </p>
            </div>
          </div>

          <form onSubmit={handleLaunchDispatchModal} className="flex flex-col sm:flex-row items-center gap-3 text-xs">
            <div className="w-full sm:flex-1">
              <select
                required
                value={selectedTaskToRemind}
                onChange={e => setSelectedTaskToRemind(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-slate-800 font-medium"
              >
                <option value="">-- Chọn nhiệm vụ cần phát lệnh đôn đốc khẩn cấp --</option>
                {uncompletedTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.code}] {t.title.slice(0, 55)}... (Hạn: {t.dueDate})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedTaskToRemind}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Mở Bảng Phát Lệnh Đôn Đốc</span>
            </button>
          </form>
        </div>
      )}

      {/* Urgent Dispatches Log Section */}
      {urgentDispatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Nhật Ký Các Lệnh Đôn Đốc Đã Phát Hành ({urgentDispatches.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Đã kích hoạt đồng thời Hệ thống & Email</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nhiệm Vụ</th>
                  <th className="p-3">Cán Bộ Nhận</th>
                  <th className="p-3">Kênh Email</th>
                  <th className="p-3">Cảnh Báo Đăng Nhập</th>
                  <th className="p-3">Người Chỉ Đạo</th>
                  <th className="p-3">Thời Gian</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {urgentDispatches.map(dispatch => (
                  <tr key={dispatch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 max-w-xs">
                      <span className="text-[10px] font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded mr-1.5 font-bold">
                        {dispatch.taskCode}
                      </span>
                      <span className="line-clamp-1">{dispatch.taskTitle}</span>
                    </td>
                    <td className="p-3 text-slate-800">
                      <strong>{dispatch.recipientName}</strong>
                      <div className="text-[10px] text-slate-500">{dispatch.recipientDepartment}</div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Mail className="w-3 h-3" />
                          <span>{dispatch.recipientEmail}</span>
                        </span>
                        <div className="text-[9px] text-slate-500">
                          Từ: <strong className="text-red-700">{dispatch.senderEmail || 'ubmttq@bacninh.gov.vn'}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {dispatch.isAcknowledgedOnLogin ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã tiếp nhận khi đăng nhập</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Bell className="w-3 h-3 text-amber-600 animate-bounce" />
                          <span>Chờ đăng nhập để hiển thị</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div>{dispatch.senderName}</div>
                      <div className="text-[10px] text-slate-500">{dispatch.senderPosition}</div>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(dispatch.dispatchedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedTaskId(dispatch.taskId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications & Reminders Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Nhật Ký Thông Báo Toàn Hệ Thống ({notifications.length})
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả loại thông báo</option>
              <option value="REMINDER">Nhắc việc & Quá hạn</option>
              <option value="ASSIGNMENT">Phân công nhiệm vụ</option>
              <option value="REVIEW_REQUEST">Yêu cầu phê duyệt</option>
              <option value="KPI_AWARD">Khen thưởng KPI</option>
            </select>

            <button
              onClick={markAllNotificationsAsRead}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold"
            >
              Đánh dấu đã đọc tất cả
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Không có thông báo nào.
            </div>
          ) : (
            filteredNotifs.map(notif => {
              const targetUser = users.find(u => u.id === notif.userId);
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.taskId) setSelectedTaskId(notif.taskId);
                  }}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                    !notif.isRead ? 'bg-red-50/40' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-slate-100 mt-0.5 shrink-0">
                      {notif.type === 'REMINDER' && <Clock className="w-4 h-4 text-red-600" />}
                      {notif.type === 'ASSIGNMENT' && <UserCheck className="w-4 h-4 text-blue-600" />}
                      {notif.type === 'REVIEW_REQUEST' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {notif.type === 'KPI_AWARD' && <Award className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className={`text-xs font-bold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                        )}
                        {notif.isUrgentAlert && (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                            Khẩn cấp
                          </span>
                        )}
                        {notif.sendEmail && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded flex items-center space-x-1">
                            <Mail className="w-2.5 h-2.5" />
                            <span>Đã gửi Email</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-0.5">
                        <span>Gửi tới: <strong>{notif.userId === 'all' ? 'Toàn cơ quan' : targetUser?.fullName}</strong></span>
                        {notif.recipientEmail && <span>• Email: <strong className="text-slate-600">{notif.recipientEmail}</strong></span>}
                        <span>• {new Date(notif.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {notif.taskId && (
                    <button
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shrink-0"
                    >
                      Xem việc &rarr;
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
