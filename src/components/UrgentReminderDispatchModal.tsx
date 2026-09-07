import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  AlertTriangle,
  Mail,
  Bell,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  Calendar,
  X,
  Sparkles,
  ShieldAlert,
  Info,
  Check,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { Task } from '../types';

export const UrgentReminderDispatchModal: React.FC = () => {
  const {
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    taskToDispatch,
    setTaskToDispatch,
    users,
    departments,
    currentUser,
    sendUrgentReminder
  } = useApp();

  const [customMsg, setCustomMsg] = useState('');
  const [sendEmailChannel, setSendEmailChannel] = useState(true);
  const [sendLoginAlertChannel, setSendLoginAlertChannel] = useState(true);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isPreviewEmail, setIsPreviewEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<any | null>(null);

  const senderEmail = 'ubmttq@bacninh.gov.vn';
  const assignee = users.find(u => u.id === taskToDispatch?.leadAssigneeId);
  const activeRecipient = users.find(u => u.id === selectedRecipientId) || assignee;
  const dept = departments.find(d => d.id === activeRecipient?.departmentId || taskToDispatch?.departmentId);

  useEffect(() => {
    if (taskToDispatch) {
      const primaryLead = users.find(u => u.id === taskToDispatch.leadAssigneeId);
      setSelectedRecipientId(primaryLead?.id || '');
      setEmailAddress(primaryLead?.email || 'canbo.mttq@bacninh.gov.vn');
      setCustomMsg(
        `Lãnh đạo cơ quan yêu cầu đồng chí khẩn trương đẩy nhanh tiến độ nhiệm vụ "${taskToDispatch.title}" (Hạn chót: ${taskToDispatch.dueDate}). Báo cáo tiến độ xử lý ngay.`
      );
      setDispatchReceipt(null);
      setIsPreviewEmail(false);
    }
  }, [taskToDispatch, users]);

  const handleRecipientChange = (userId: string) => {
    setSelectedRecipientId(userId);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setEmailAddress(targetUser.email || `${targetUser.username}@bacninh.gov.vn`);
    }
  };

  if (!isDispatchModalOpen || !taskToDispatch) return null;

  const quickTemplates = [
    {
      label: '⚡ Yêu cầu gấp trong ngày',
      text: `Lãnh đạo yêu cầu đồng chí hoàn thiện hồ sơ và nộp báo cáo tiến độ trước 17h00 hôm nay để phục vụ giao ban.`
    },
    {
      label: '⏳ Đôn đốc việc sắp đến hạn',
      text: `Nhiệm vụ "${taskToDispatch.title}" sắp đến hạn chót (${taskToDispatch.dueDate}). Đề nghị đồng chí phối hợp các đơn vị giải quyết dứt điểm.`
    },
    {
      label: '🏛️ Phục vụ Ban Thường trực',
      text: `Yêu cầu khẩn trương tổng hợp tài liệu, số liệu báo cáo phục vụ phiên họp của Ban Thường trực Ủy ban MTTQ Tỉnh.`
    }
  ];

  const handleClose = () => {
    setIsDispatchModalOpen(false);
    setTaskToDispatch(null);
    setDispatchReceipt(null);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    setIsSubmitting(true);

    const result = sendUrgentReminder(taskToDispatch.id, customMsg, {
      sendEmail: sendEmailChannel,
      recipientEmailOverride: emailAddress,
      senderEmailOverride: senderEmail,
      targetRecipientId: selectedRecipientId
    });

    setIsSubmitting(false);

    if (result.success && result.receipt) {
      setDispatchReceipt(result.receipt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-red-200 overflow-hidden flex flex-col my-6 max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 via-red-700 to-amber-900 text-white relative flex-shrink-0">
          <button 
            type="button"
            id="btn-close-dispatch-modal"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-red-950/40 px-2 py-0.5 rounded border border-amber-300/30">
                  LỆNH ĐÔN ĐỐC KHẨN CẤP
                </span>
                <span className="text-[10px] text-red-200 font-medium">Hệ thống & Email</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight mt-0.5">
                Phát Hành Thông Báo Đôn Đốc Tiến Độ
              </h2>
              <p className="text-[11px] text-red-100">
                Ủy Ban Mặt Trận Tổ Quốc Việt Nam Tỉnh Bắc Ninh
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Dispatch Receipt Success View */}
          {dispatchReceipt ? (
            <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 space-y-3">
                <div className="flex items-center space-x-3 text-emerald-700">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-900">
                      ĐÃ PHÁT HÀNH LỆNH ĐÔN ĐỐC THÀNH CÔNG!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Hệ thống đã tự động gửi email từ hòm thư <strong>ubmttq@bacninh.gov.vn</strong> và kích hoạt thông báo cảnh báo khi đăng nhập.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-200/80 text-xs">
                  {/* Channel 1 Result */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span>Cảnh báo khi Đăng nhập:</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Đã đặt thông báo khẩn cấp bật lên (Popup) ngay khi đồng chí <strong>{dispatchReceipt.recipientName}</strong> đăng nhập vào hệ thống.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ Đã kích hoạt trên hệ thống
                    </span>
                  </div>

                  {/* Channel 2 Result */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-blue-800 font-bold">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Gửi về Email cá nhân:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 break-all">
                      Gửi từ <strong>ubmttq@bacninh.gov.vn</strong> đến hòm thư: <strong>{dispatchReceipt.recipientEmail}</strong> ({dispatchReceipt.recipientName})
                    </p>
                    <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      ✓ Đã gửi đến hòm thư cá nhân
                    </span>
                  </div>
                </div>

                {/* Details Summary */}
                <div className="bg-emerald-100/50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                  <p><strong>Nhiệm vụ:</strong> [{dispatchReceipt.taskCode}] {dispatchReceipt.taskTitle}</p>
                  <p><strong>Hộp thư gửi đi:</strong> ubmttq@bacninh.gov.vn (Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh)</p>
                  <p><strong>Người nhận:</strong> {dispatchReceipt.recipientName} ({dispatchReceipt.recipientEmail})</p>
                  <p><strong>Người chỉ đạo:</strong> {dispatchReceipt.senderName} ({dispatchReceipt.senderPosition})</p>
                  <p><strong>Thời gian phát lệnh:</strong> {new Date(dispatchReceipt.dispatchedAt).toLocaleTimeString('vi-VN')} ngày {new Date(dispatchReceipt.dispatchedAt).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Nội dung đôn đốc:</strong> <em>"{dispatchReceipt.urgentMessage}"</em></p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Hoàn Tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDispatch} className="space-y-4">
              
              {/* Official Sender Email Badge */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-900">Email Phát Lệnh (Hệ Thống):</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Chính Thức</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      ubmttq@bacninh.gov.vn
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:inline-block">
                  Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh
                </span>
              </div>

              {/* Task Overview Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                      {taskToDispatch.code}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      {taskToDispatch.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                    Hạn: {taskToDispatch.dueDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-red-600" />
                    <span>Cán bộ chủ trì: <strong>{assignee?.fullName}</strong> ({assignee?.position})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Đơn vị: <strong>{dept?.name}</strong></span>
                  </div>
                </div>
              </div>

              {/* Recipient Selection Card (Sending to Individuals on System) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-red-600" />
                    <span>Cá nhân nhận lệnh đôn đốc trên hệ thống:</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Gửi trực tiếp đến cá nhân</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <select
                      id="select-recipient-user"
                      value={selectedRecipientId}
                      onChange={e => handleRecipientChange(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                    >
                      <optgroup label="Cán bộ đảm nhiệm nhiệm vụ">
                        {assignee && (
                          <option value={assignee.id}>
                            ★ Chủ trì: {assignee.fullName} ({assignee.position})
                          </option>
                        )}
                        {taskToDispatch.collaboratorIds?.map(collabId => {
                          if (collabId === assignee?.id) return null;
                          const collabUser = users.find(u => u.id === collabId);
                          if (!collabUser) return null;
                          return (
                            <option key={collabId} value={collabId}>
                              Phối hợp: {collabUser.fullName} ({collabUser.position})
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="Tất cả cá nhân trên hệ thống">
                        {users.map(u => {
                          if (u.id === assignee?.id || taskToDispatch.collaboratorIds?.includes(u.id)) return null;
                          const userDept = departments.find(d => d.id === u.departmentId);
                          return (
                            <option key={u.id} value={u.id}>
                              {u.fullName} - {u.position} ({userDept?.code || 'MTTQ'})
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] font-bold text-slate-400">Email:</span>
                      <input
                        type="email"
                        required
                        value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                        placeholder="hòm thư cá nhân..."
                        className="w-full text-xs text-slate-900 font-medium focus:outline-none bg-transparent"
                        title="Địa chỉ email cá nhân nhận thông báo"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Channels Configuration */}
              <div className="p-4 bg-gradient-to-br from-amber-50/70 to-red-50/50 border border-amber-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <Send className="w-4 h-4 text-red-600" />
                  <span>Kênh Thông Báo Đồng Thời Khi Gửi Đôn Đốc:</span>
                </h4>

                <div className="space-y-2.5">
                  {/* Channel 1: Login Notification */}
                  <label className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-amber-200 shadow-2xs cursor-pointer hover:border-red-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={sendLoginAlertChannel}
                      onChange={e => setSendLoginAlertChannel(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-red-600 rounded focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          1. Cảnh Báo Trên Hệ Thống Khi Người Dùng Đăng Nhập
                        </span>
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                          Tức thì
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Tự động hiển thị cửa sổ cảnh báo khẩn cấp nổi bật kèm chuông nhắc việc khi đồng chí <strong>{activeRecipient?.fullName}</strong> đăng nhập vào tài khoản công vụ.
                      </p>
                    </div>
                  </label>

                  {/* Channel 2: Personal Email */}
                  <label className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-blue-200 shadow-2xs cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={sendEmailChannel}
                      onChange={e => setSendEmailChannel(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          2. Gửi Trực Tiếp Về Email Cá Nhân Của Cán Bộ
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                          Hộp thư cá nhân
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Hệ thống sử dụng hòm thư chính thức <strong>ubmttq@bacninh.gov.vn</strong> để gửi công văn đôn đốc điện tử chuẩn mẫu của Ủy ban MTTQ Tỉnh vào hòm thư cá nhân của cán bộ.
                      </p>
                      
                      {sendEmailChannel && (
                        <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-600 bg-blue-50/60 p-2 rounded-lg border border-blue-200/60" onClick={e => e.stopPropagation()}>
                          <span className="font-semibold text-slate-700 shrink-0">Từ:</span>
                          <span className="font-bold text-red-700">ubmttq@bacninh.gov.vn</span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="font-semibold text-slate-700 shrink-0">Đến:</span>
                          <span className="font-bold text-blue-700 break-all">{emailAddress}</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Directive Message Content */}
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>Nội dung chỉ đạo đôn đốc khẩn cấp:</span>
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Chỉ đạo trực tiếp từ Lãnh đạo</span>
                </label>

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-[10px] text-slate-400 self-center">Mẫu nhanh:</span>
                  {quickTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomMsg(tpl.text)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 text-[10px] text-slate-700 transition-colors font-medium"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  required
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Nhập yêu cầu chỉ đạo cụ thể (thời hạn nộp báo cáo, nội dung cần xử lý ngay...)"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all leading-relaxed"
                />
              </div>

              {/* Email Preview Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsPreviewEmail(!isPreviewEmail)}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isPreviewEmail ? 'Ẩn xem trước Email gửi đi' : 'Xem trước bản Email đôn đốc gửi từ ubmttq@bacninh.gov.vn'}</span>
                </button>

                {isPreviewEmail && (
                  <div className="mt-2 p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 font-sans animate-in fade-in">
                    {/* Simulated Email Client Header */}
                    <div className="border-b border-slate-200 pb-2.5 text-[11px] space-y-1">
                      <p><span className="text-slate-500 font-semibold">Từ:</span> <strong>Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh</strong> &lt;ubmttq@bacninh.gov.vn&gt;</p>
                      <p><span className="text-slate-500 font-semibold">Đến:</span> <strong>{activeRecipient?.fullName}</strong> &lt;{emailAddress}&gt;</p>
                      <p><span className="text-slate-500 font-semibold">Tiêu đề:</span> <strong className="text-red-700">[MTTQ BẮC NINH - ĐÔN ĐỐC TIẾN ĐỘ KHẨN] Nhiệm vụ {taskToDispatch.code}</strong></p>
                    </div>

                    {/* Email Letterhead Content */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-slate-800 text-xs">
                      <div className="text-center pb-2 border-b border-red-100">
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest">ỦY BAN MẶT TRẬN TỔ QUỐC VIỆT NAM TỈNH BẮC NINH</p>
                        <p className="text-[10px] text-slate-500 font-serif italic">Độc lập - Tự do - Hạnh phúc</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Hộp thư điện tử phát lệnh: ubmttq@bacninh.gov.vn</p>
                        <h3 className="text-xs font-bold text-red-800 mt-2">PHIẾU ĐÔN ĐỐC TIẾN ĐỘ THỰC HIỆN NHIỆM VỤ CÔNG TÁC</h3>
                      </div>

                      <p>Kính gửi đồng chí: <strong>{activeRecipient?.fullName}</strong> ({activeRecipient?.position} - {dept?.name}),</p>
                      <p className="leading-relaxed">
                        Ban Thường trực / Lãnh đạo cơ quan Ủy ban MTTQ Việt Nam Tỉnh Bắc Ninh yêu cầu đồng chí tập trung thực hiện và báo cáo tiến độ đối với nhiệm vụ sau:
                      </p>

                      <div className="p-3 bg-red-50/70 border-l-4 border-red-600 rounded space-y-1 text-[11px]">
                        <p><strong>1. Mã nhiệm vụ:</strong> {taskToDispatch.code}</p>
                        <p><strong>2. Nội dung công việc:</strong> {taskToDispatch.title}</p>
                        <p><strong>3. Hạn chót hoàn thành:</strong> <span className="text-red-700 font-bold">{taskToDispatch.dueDate}</span></p>
                        <p><strong>4. Chỉ đạo của Lãnh đạo ({currentUser.fullName}):</strong> <span className="text-red-900 font-semibold">"{customMsg}"</span></p>
                      </div>

                      <p className="text-[11px] text-slate-600">
                        Đề nghị đồng chí khẩn trương đăng nhập vào Hệ thống Quản trị & Điều hành công vụ để cập nhật tiến độ chi tiết.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  id="btn-confirm-send-dispatch"
                  disabled={isSubmitting || (!sendLoginAlertChannel && !sendEmailChannel)}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center space-x-2 text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang phát hành...' : 'Gửi Đôn Đốc (Từ ubmttq@bacninh.gov.vn)'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 flex-shrink-0">
          Cơ Chế Điều Hành Điện Tử — Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh
        </div>
      </div>
    </div>
  );
};
