import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Lock,
  CreditCard,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithCitizenId
  } = useApp();

  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = loginWithCitizenId(citizenId, password);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage('');
        setIsLoginModalOpen(false);
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white relative">
          <button 
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center">
              <img
                src="/logo-mat-tran-to-quoc-viet-nam-png.png"
                alt="Biểu trưng Ủy ban Mặt trận Tổ quốc Việt Nam"
                className="w-12 h-12 object-contain drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 block">
                Cổng Xác Thực Điện Tử Công Vụ
              </span>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Đăng Nhập Bằng Căn Cước Công Dân (CCCD)
              </h2>
              <p className="text-[11px] text-red-100">
                Ủy ban MTTQ Việt Nam tỉnh Bắc Ninh
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start space-x-2 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đăng nhập không thành công</p>
                <p className="mt-0.5 text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CCCD Input */}
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
                <span className="flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-red-600" />
                  <span>Số Căn cước công dân (12 chữ số)</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Định danh VNeID</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={citizenId}
                  onChange={e => setCitizenId(e.target.value)}
                  placeholder="Ví dụ: 027085001234"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  <span>Mật khẩu hệ thống</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Quý đồng chí quên mật khẩu vui lòng liên hệ trực tiếp với Quản Trị Viên (Admin) hoặc Chánh Văn phòng để được cấp lại mật khẩu mới.')}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Quên mật khẩu?</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Xác Thực & Đăng Nhập Hệ Thống</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-3 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span>Bảo mật thông tin đăng nhập:</span>
              </div>
              <p>
                Mỗi cán bộ, công chức sử dụng số định danh Căn cước công dân (12 số) và mật khẩu cá nhân được cấp để truy cập. Không chia sẻ mật khẩu cho người khác.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Hệ thống Quản lý Công việc & Phân quyền bảo mật — UB MTTQ Việt Nam tỉnh Bắc Ninh
        </div>
      </div>
    </div>
  );
};
