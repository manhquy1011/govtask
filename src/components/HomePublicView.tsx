import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Table2,
  Kanban,
  Award,
  Clock,
  Building2,
  Users,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const HomePublicView: React.FC = () => {
  const {
    users,
    departments,
    loginWithCitizenId,
    setIsLoginModalOpen
  } = useApp();

  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginWithCitizenId(citizenId, password);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Bar: Official Government Banner */}
      <div className="bg-red-800 text-amber-100 text-xs px-4 py-2 border-b border-red-900 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold uppercase tracking-wider text-amber-200">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </span>
            <span className="text-red-300 hidden sm:inline">—</span>
            <span className="italic text-amber-100 hidden sm:inline">Độc lập - Tự do - Hạnh phúc</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-red-100">
            <span className="hidden md:flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-amber-300" />
              <span>Số 01 Lý Thái Tổ, TP. Bắc Ninh</span>
            </span>
            <span className="flex items-center space-x-1">
              <Phone className="w-3 h-3 text-amber-300" />
              <span>Hotline: (0222) 3822 456</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Agency Identification */}
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center justify-center w-14 h-14 shrink-0">
                <img
                  src="/logo-mat-tran-to-quoc-viet-nam-png.png"
                  alt="Biểu trưng Ủy ban Mặt trận Tổ quốc Việt Nam"
                  className="w-14 h-14 object-contain drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-extrabold text-red-800 text-base sm:text-lg tracking-tight uppercase">
                    ỦY BAN MẶT TRẬN TỔ QUỐC VIỆT NAM TỈNH BẮC NINH
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-bold tracking-tight">
                  HỆ THỐNG QUẢN LÝ & ĐIỀU HÀNH CÔNG VIỆC CÔNG VỤ ĐIỆN TỬ
                </p>
              </div>
            </div>

            {/* Quick Login Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const el = document.getElementById('login-form-card');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl text-xs font-bold shadow-md shadow-red-700/20 flex items-center space-x-2 transition-all border border-amber-300/30 active:scale-95"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Đăng Nhập Cán Bộ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Home Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-red-900/50 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Shield className="w-96 h-96 text-amber-300" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-800/80 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Nền Tảng Điều Hành Số Hóa Cơ Quan Nhà Nước</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Cổng Thông Tin & Quản Lý Công Việc Toàn Diện
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Số hóa 100% quy trình giao việc, phân rã ma trận nhiệm vụ 5 nhóm, kiểm soát tiến độ thời gian thực,
              đánh giá KPI minh bạch và bảo mật định danh cán bộ theo chuẩn Căn cước công dân (CCCD).
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{departments.length} Ban & Văn phòng chuyên môn</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{users.length} Cán bộ, công chức định danh</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo mật dữ liệu công vụ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Central Split Section: Login Card & System Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: System Overview & Feature Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
                <Shield className="w-5 h-5 text-red-600" />
                <span>Các Phân Hệ Quản Lý & Điều Hành Chính</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-red-200 hover:bg-red-50/30 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold mb-2.5">
                    <Table2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Ma Trận Nhiệm Vụ 5 Nhóm</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Phân loại nhiệm vụ N1 (Trọng tâm) đến N5 (Hành chính), gắn điểm trọng số và đơn vị chủ trì.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2.5">
                    <Kanban className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Bảng Tiến Độ (Kanban)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Theo dõi trực quan từ Chưa bắt đầu, Đang thực hiện, Chờ duyệt báo cáo đến Hoàn thành.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2.5">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Đánh Giá & Điểm KPI</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tự động chấm điểm hiệu suất, xếp hạng thi đua công chức hàng tháng và quý theo sản phẩm thực tế.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Cảnh Báo Hạn & Hỏa Tốc</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tự động gửi thông báo nhắc việc sắp đến hạn, phát hành công văn đôn đốc hỏa tốc trực tuyến.
                  </p>
                </div>
              </div>
            </div>

            {/* Structure & Departments */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center space-x-2 mb-3">
                <Building2 className="w-5 h-5 text-red-600" />
                <span>Cơ Cấu Tổ Chức Cơ Quan UB MTTQ Tỉnh</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Hệ thống phân cấp quản lý theo đúng cơ cấu chức năng, thẩm quyền của cơ quan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map(dept => (
                  <div key={dept.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>{dept.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
                        {dept.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{dept.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated Login Portal Card (5 cols) */}
          <div className="lg:col-span-5" id="login-form-card">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-24">
              {/* Card Header */}
              <div className="p-6 bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white relative">
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
                      CỔNG ĐĂNG NHẬP CÔNG VỤ
                    </span>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Xác Thực Căn Cước Công Dân
                    </h3>
                    <p className="text-[11px] text-red-100">
                      Ủy ban MTTQ Việt Nam tỉnh Bắc Ninh
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start space-x-2 text-xs">
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

                <form onSubmit={handleFormSubmit} className="space-y-4">
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
                        placeholder="Nhập số CCCD (Ví dụ: 027091007853)"
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
                        placeholder="Nhập mật khẩu..."
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
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-md shadow-red-600/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] text-sm disabled:opacity-75"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}</span>
                  </button>
                </form>

                {/* Security Footnote */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 mt-2">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>Bảo mật thông tin công vụ:</span>
                  </div>
                  <p className="leading-relaxed">
                    Hệ thống ghi nhận nhật ký truy cập (IP, thời gian, thiết bị) theo quy định bảo đảm an toàn dữ liệu công tác Mặt trận.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mb-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Shield className="w-4 h-4 text-red-500" />
                <span>ỦY BAN MTTQ VIỆT NAM TỈNH BẮC NINH</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Cơ quan thường trực thực hiện vai trò khối đại đoàn kết toàn dân, giám sát và phản biện xã hội, điều hành công tác Mặt trận tỉnh Bắc Ninh.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Thông Tin Liên Hệ</h4>
              <p className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Số 01 Đường Lý Thái Tổ, Phường Suối Hoa, TP. Bắc Ninh</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Điện thoại: (0222) 3822 456 — Fax: (0222) 3822 789</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Email: banbientap.mttq@bacninh.gov.vn</span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">An Toàn & Bảo Mật Hệ Thống</h4>
              <p className="text-slate-400 leading-relaxed">
                Hệ thống xác thực theo Căn cước công dân gắn chip và cơ chế phân quyền 4 cấp (Thường trực, Lãnh đạo Ban, Chuyên viên, Quản trị viên).
              </p>
              <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                <span>Hệ thống đang hoạt động an toàn</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} Bản quyền thuộc về Ủy ban Mặt trận Tổ quốc Việt Nam tỉnh Bắc Ninh. Phát triển phục vụ quản lý và điều hành công vụ.
          </div>
        </div>
      </footer>
    </div>
  );
};
