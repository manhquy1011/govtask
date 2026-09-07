import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Building2,
  X,
  Sparkles,
  Info
} from 'lucide-react';

export const ChangePasswordModal: React.FC = () => {
  const {
    currentUser,
    departments,
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    changePassword
  } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isChangePasswordModalOpen) return null;

  const currentDept = departments.find(d => d.id === currentUser.departmentId);

  // Compute password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Độ bảo mật: Yếu', color: 'bg-red-500', text: 'text-red-600' };
    if (score <= 3) return { score: 2, label: 'Độ bảo mật: Trung bình', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score: 3, label: 'Độ bảo mật: Mạnh (Khuyến nghị)', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsChangePasswordModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    if (newPassword.trim() === currentPassword.trim()) {
      setErrorMessage('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMessage('Xác nhận mật khẩu mới không trùng khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setIsSubmitting(true);

    const result = changePassword(currentPassword, newPassword, confirmPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white relative">
          <button 
            type="button"
            id="btn-close-change-password-modal"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                Bảo Mật Tài Khoản Công Vụ
              </span>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Đổi Mật Khẩu Tài Khoản
              </h2>
              <p className="text-[11px] text-red-100">
                Tự đổi mật khẩu cá nhân theo định danh CCCD
              </p>
            </div>
          </div>
        </div>

        {/* Current User Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-red-600/20"
            />
            <div>
              <p className="text-xs font-bold text-slate-900 leading-snug">{currentUser.fullName}</p>
              <p className="text-[11px] text-slate-600">{currentUser.position} • {currentDept?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Số CCCD</span>
            <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {currentUser.citizenId}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start space-x-2 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đổi mật khẩu không thành công</p>
                <p className="mt-0.5 text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start space-x-2 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Thành công!</p>
                <p className="mt-0.5 text-emerald-700">{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Current Password */}
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  <span>Mật khẩu hiện tại</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Mật khẩu đang sử dụng</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  id="input-current-password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-red-600" />
                  <span>Mật khẩu mới</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Tối thiểu 6 ký tự</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  id="input-new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {newPassword && (
                <div className="mt-1.5 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                    <span className="text-slate-400">Gợi ý: Kết hợp chữ hoa, chữ thường và số</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Xác nhận mật khẩu mới</span>
                  <span className="text-red-500">*</span>
                </span>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${confirmPassword === newPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                    {confirmPassword === newPassword ? '✓ Trùng khớp' : '✗ Chưa khớp'}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  id="input-confirm-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới để xác nhận..."
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 transition-all placeholder:font-normal placeholder:text-slate-400 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-300 focus:ring-red-500/20 focus:border-red-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Advisory Note */}
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Đồng chí lưu ý ghi nhớ mật khẩu mới. Mật khẩu này được sử dụng để đăng nhập vào hệ thống kèm số CCCD: <strong>{currentUser.citizenId}</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                id="btn-submit-change-password"
                disabled={isSubmitting || !!successMessage}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center space-x-1.5 text-xs transition-all disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Cơ Quan Ủy Ban MTTQ Việt Nam Tỉnh Bắc Ninh — Cổng Bảo Mật
        </div>
      </div>
    </div>
  );
};
