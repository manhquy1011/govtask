import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole, Gender, Department } from '../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  Layers,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Key,
  CreditCard,
  Calendar,
  UserCheck,
  UserX,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertCircle,
  Activity,
  Radio,
  FileText,
  Camera,
  Sliders,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  ArrowLeftRight,
  Plus,
  FolderPlus,
  AlertTriangle,
  HardDrive
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const {
    users,
    departments,
    tasks,
    currentUser,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    canManageUsers,
    setIsChangePasswordModalOpen,
    setIsLoginStatsModalOpen,
    getUserLoginCount,
    getUserLastLogin,
    isUserOnline,
    onlineUserIds,
    totalLoginCount,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isServerSyncing,
    lastServerSyncAt,
    saveToServer
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix' | 'departments'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  
  // Create / Edit User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Department Management Modal State (Create & Edit)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptHeadUserId, setDeptHeadUserId] = useState('');
  const [deptError, setDeptError] = useState('');
  const [deptSuccessMsg, setDeptSuccessMsg] = useState('');

  // Department Deletion State
  const [isDeleteDeptModalOpen, setIsDeleteDeptModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [targetFallbackDeptId, setTargetFallbackDeptId] = useState('');

  // View Detailed Profile Modal State
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isProfileDetailModalOpen, setIsProfileDetailModalOpen] = useState(false);

  // Form Fields for Full Admin Editing
  const [fullName, setFullName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('NAM');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [departmentId, setDepartmentId] = useState('dept-van-phong');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [position, setPosition] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [kpiScore, setKpiScore] = useState<number>(75);
  const [formError, setFormError] = useState('');

  // Preset Avatars for quick selection
  const PRESET_AVATARS = [
    { label: 'Nam công chức 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', gender: 'NAM' },
    { label: 'Nam công chức 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', gender: 'NAM' },
    { label: 'Nam lãnh đạo 1', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', gender: 'NAM' },
    { label: 'Nam lãnh đạo 2', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', gender: 'NAM' },
    { label: 'Nữ công chức 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', gender: 'NU' },
    { label: 'Nữ công chức 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', gender: 'NU' },
    { label: 'Nữ lãnh đạo 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', gender: 'NU' },
    { label: 'Nữ lãnh đạo 2', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', gender: 'NU' },
  ];

  // Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userForReset, setUserForReset] = useState<User | null>(null);
  const [resetOption, setResetOption] = useState<'default' | 'custom'>('default');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [appliedPassword, setAppliedPassword] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const openCreateModal = () => {
    if (currentUser.role !== 'ADMIN') return;
    setEditingUser(null);
    setFullName('');
    setCitizenId(`0270${Math.floor(10000000 + Math.random() * 90000000)}`);
    setPassword('123456');
    setShowPassword(false);
    setDateOfBirth('1990-01-01');
    setGender('NAM');
    setUsername('');
    setEmail('');
    setPhone('0912.345.678');
    setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');
    setDepartmentId(departments[0]?.id || 'dept-van-phong');
    setRole('OFFICER');
    setPosition('Chuyên viên chuyên trách');
    setSkillsInput('Soạn thảo văn bản, Xử lý hồ sơ công vụ, Tổng hợp báo cáo');
    setStatus('active');
    setKpiScore(75);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    if (currentUser.role !== 'ADMIN') return;
    setEditingUser(user);
    setFullName(user.fullName);
    setCitizenId(user.citizenId || '');
    setPassword(user.password || '123456');
    setShowPassword(false);
    setDateOfBirth(user.dateOfBirth || '');
    setGender((user.gender as Gender) || 'NAM');
    setUsername(user.username);
    setEmail(user.email);
    setPhone(user.phone);
    setAvatar(user.avatar || '');
    setDepartmentId(user.departmentId);
    setRole(user.role);
    setPosition(user.position);
    setSkillsInput(user.skills?.join(', ') || '');
    setStatus(user.status || 'active');
    setKpiScore(user.kpiScore ?? 70);
    setFormError('');
    setIsModalOpen(true);
  };

  const openProfileDetailModal = (user: User) => {
    setViewingUser(user);
    setIsProfileDetailModalOpen(true);
  };

  const openCreateDeptModal = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptDescription('');
    setDeptHeadUserId('');
    setDeptError('');
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDescription(dept.description || '');
    setDeptHeadUserId(dept.headUserId || '');
    setDeptError('');
    setIsDeptModalOpen(true);
  };

  const openDeleteDeptModal = (dept: Department) => {
    if (departments.length <= 1) {
      alert('Không thể xóa phòng/ban cuối cùng của cơ quan! Hệ thống cần duy trì ít nhất 1 phòng ban/văn phòng.');
      return;
    }
    setDeptToDelete(dept);
    const otherDepts = departments.filter(d => d.id !== dept.id);
    setTargetFallbackDeptId(otherDepts[0]?.id || '');
    setIsDeleteDeptModalOpen(true);
  };

  const handleDeptFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeptError('');

    const cleanName = deptName.trim();
    const cleanCode = deptCode.trim().toUpperCase();

    if (!cleanName) {
      setDeptError('Vui lòng nhập tên Phòng, Ban, Bộ phận.');
      return;
    }
    if (!cleanCode) {
      setDeptError('Vui lòng nhập mã viết tắt của Ban/Bộ phận.');
      return;
    }

    // Check code duplication
    const duplicateCode = departments.find(
      d => d.code.toUpperCase() === cleanCode && (!editingDept || d.id !== editingDept.id)
    );
    if (duplicateCode) {
      setDeptError(`Mã Ban "${cleanCode}" đã được sử dụng cho "${duplicateCode.name}". Vui lòng chọn mã khác.`);
      return;
    }

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: cleanName,
        code: cleanCode,
        description: deptDescription.trim(),
        headUserId: deptHeadUserId || undefined
      });
      setDeptSuccessMsg(`Đã cập nhật thông tin phòng/ban "${cleanName}" thành công.`);
    } else {
      createDepartment({
        name: cleanName,
        code: cleanCode,
        description: deptDescription.trim(),
        headUserId: deptHeadUserId || undefined,
        order: departments.length + 1
      });
      setDeptSuccessMsg(`Đã thêm mới phòng, ban, bộ phận "${cleanName}" (${cleanCode}) thành công.`);
    }

    setIsDeptModalOpen(false);
    setTimeout(() => setDeptSuccessMsg(''), 4000);
  };

  const handleConfirmDeleteDept = () => {
    if (!deptToDelete) return;
    const res = deleteDepartment(deptToDelete.id, targetFallbackDeptId);
    setIsDeleteDeptModalOpen(false);
    if (res.success) {
      setDeptSuccessMsg(res.message);
      setTimeout(() => setDeptSuccessMsg(''), 5000);
    } else {
      alert(res.message);
    }
    setDeptToDelete(null);
  };

  const handleToggleUserStatus = (user: User) => {
    if (currentUser.role !== 'ADMIN') return;
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionLabel = nextStatus === 'active' ? 'kích hoạt lại' : 'tạm khóa';
    if (confirm(`Đồng chí có chắc chắn muốn ${actionLabel} tài khoản cán bộ "${user.fullName}"?`)) {
      updateUser(user.id, { status: nextStatus });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (currentUser.role !== 'ADMIN') {
      setFormError('Chỉ tài khoản có vai trò Quản trị viên (Admin) mới có quyền chỉnh sửa thông tin người dùng.');
      return;
    }

    if (!fullName.trim()) {
      setFormError('Họ và tên không được để trống.');
      return;
    }

    const cleanCccd = citizenId.trim();
    if (!cleanCccd || cleanCccd.length < 9) {
      setFormError('Số Căn cước công dân (CCCD) phải hợp lệ (từ 9 đến 12 chữ số).');
      return;
    }

    // Check duplicate CCCD
    const duplicate = users.find(u => u.citizenId === cleanCccd && u.id !== editingUser?.id);
    if (duplicate) {
      setFormError(`Số CCCD "${cleanCccd}" đã thuộc về đồng chí ${duplicate.fullName}. Vui lòng kiểm tra lại.`);
      return;
    }

    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const finalAvatar = avatar.trim() || (gender === 'NU' 
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');

    if (editingUser) {
      updateUser(editingUser.id, {
        fullName: fullName.trim(),
        citizenId: cleanCccd,
        dateOfBirth: dateOfBirth || editingUser.dateOfBirth,
        gender,
        password: password.trim() || editingUser.password || '123456',
        username: username.trim() || editingUser.username,
        email: email.trim(),
        phone: phone.trim(),
        avatar: finalAvatar,
        departmentId,
        role,
        position: position.trim(),
        skills: skillsArray,
        status,
        kpiScore: Number(kpiScore) || 70,
      });
    } else {
      createUser({
        fullName: fullName.trim(),
        citizenId: cleanCccd,
        dateOfBirth: dateOfBirth || '1990-01-01',
        gender,
        password: password.trim() || '123456',
        username: username.trim() || `cb.${cleanCccd.slice(-4)}`,
        email: email.trim() || `cb.${cleanCccd.slice(-4)}@bacninh.gov.vn`,
        phone: phone.trim() || '0912.xxx.xxx',
        avatar: finalAvatar,
        departmentId,
        role,
        position: position.trim() || 'Chuyên viên chuyên trách',
        skills: skillsArray,
        status,
        kpiScore: Number(kpiScore) || 75
      } as any);
    }

    setIsModalOpen(false);
  };

  // Open Reset Password Modal for Admin
  const openResetPasswordModal = (user: User, initialOption: 'default' | 'custom' = 'default') => {
    setUserForReset(user);
    setResetOption(initialOption);
    const randomTempPwd = `MTTQ@${Math.floor(1000 + Math.random() * 9000)}`;
    setNewPasswordInput(randomTempPwd);
    setResetSuccessMessage('');
    setAppliedPassword('');
    setIsCopied(false);
    setIsResetModalOpen(true);
  };

  const handleExecuteResetPassword = (e?: React.FormEvent, forceMode?: 'default' | 'custom') => {
    if (e) e.preventDefault();
    if (!userForReset) return;

    const mode = forceMode || resetOption;
    const finalPassword = mode === 'default'
      ? '123'
      : (newPasswordInput.trim() || `MTTQ@${Math.floor(1000 + Math.random() * 9000)}`);

    const res = resetUserPassword(userForReset.id, finalPassword);
    if (res.success) {
      setAppliedPassword(finalPassword);
      setResetSuccessMessage(res.message);
    }
  };

  const copyPasswordToClipboard = () => {
    const pwdToCopy = appliedPassword || (resetOption === 'default' ? '123' : newPasswordInput);
    if (!pwdToCopy) return;
    navigator.clipboard.writeText(pwdToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'ADMIN':
        return { label: 'Quản trị hệ thống (Admin)', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'AGENCY_LEAD':
        return { label: 'Thường trực UB MTTQ Tỉnh', color: 'bg-red-100 text-red-800 border-red-200 font-bold' };
      case 'DEPT_HEAD':
        return { label: 'Lãnh đạo Ban / Văn phòng', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'OFFICER':
        return { label: 'Chuyên viên chuyên trách', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: userRole, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesDept = selectedDeptFilter === 'ALL' || u.departmentId === selectedDeptFilter;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchesDept;

    const matchesSearch = 
      u.fullName.toLowerCase().includes(q) ||
      u.citizenId?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.position?.toLowerCase().includes(q);

    return matchesDept && matchesSearch;
  });

  // Top horizontal scrollbar synchronization refs and logic
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState<number>(1400);

  useEffect(() => {
    const updateWidth = () => {
      if (tableRef.current) {
        setTableScrollWidth(tableRef.current.scrollWidth || 1400);
      }
    };
    updateWidth();

    let observer: ResizeObserver | null = null;
    if (tableRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateWidth();
      });
      observer.observe(tableRef.current);
    }

    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (observer) observer.disconnect();
    };
  }, [filteredUsers]);

  const isSyncingTop = useRef(false);
  const isSyncingTable = useRef(false);

  const handleTopScroll = () => {
    if (isSyncingTable.current) return;
    isSyncingTop.current = true;
    if (tableScrollRef.current && topScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingTop.current = false;
    });
  };

  const handleTableScroll = () => {
    if (isSyncingTop.current) return;
    isSyncingTable.current = true;
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingTable.current = false;
    });
  };

  const scrollHorizontally = (direction: 'left' | 'right' | 'start' | 'end') => {
    if (!tableScrollRef.current) return;
    const current = tableScrollRef.current.scrollLeft;
    let target = current;
    if (direction === 'left') target = Math.max(0, current - 320);
    else if (direction === 'right') target = current + 320;
    else if (direction === 'start') target = 0;
    else if (direction === 'end') target = tableScrollRef.current.scrollWidth;

    tableScrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
    if (topScrollRef.current) {
      topScrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-50 text-red-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Quản Lý Người Dùng, Căn Cước Công Dân & Phân Quyền (RBAC)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấp tài khoản đăng nhập bằng CCCD, số điện thoại, ngày sinh, mật khẩu & quyền quản trị viên Reset mật khẩu
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsLoginStatsModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
            title="Xem bảng thống kê toàn bộ lượt đăng nhập và giám sát trạng thái trực tuyến"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Thống Kê Đăng Nhập ({onlineUserIds.length} Online)</span>
          </button>

          <button
            type="button"
            id="btn-my-change-password"
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
            title="Tự đổi mật khẩu cho tài khoản đang đăng nhập"
          >
            <Key className="w-4 h-4 text-amber-600" />
            <span>Đổi Mật Khẩu Của Tôi</span>
          </button>

          <button
            type="button"
            id="btn-save-server-users"
            onClick={async () => {
              const ok = await saveToServer('Lưu dữ liệu cán bộ và tổ chức vào máy chủ');
              if (ok) {
                alert('Đã lưu trữ toàn bộ dữ liệu cán bộ và hệ thống vào máy chủ an toàn!');
              } else {
                alert('Dữ liệu đã được lưu cục bộ và sẽ tự động đồng bộ khi có kết nối.');
              }
            }}
            disabled={isServerSyncing}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            title="Lưu trữ vĩnh viễn toàn bộ dữ liệu người dùng và phòng ban vào máy chủ hệ thống"
          >
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span>{isServerSyncing ? 'Đang Lưu Máy Chủ...' : 'Lưu CSDL Máy Chủ'}</span>
          </button>

          {canManageUsers && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Cán Bộ / Cấp Tài Khoản Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'users'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Cán Bộ & Hồ Sơ CCCD ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'matrix'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Ma Trận Phân Quyền Công Vụ (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'departments'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Cơ Cấu Phòng, Ban, Bộ Phận ({departments.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: USERS LIST */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          
          {/* Admin Full Authority Banner */}
          {canManageUsers && (
            <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950 flex items-center space-x-1.5 flex-wrap gap-1">
                    <span>Đặc Quyền Quản Trị Viên (Admin) - Toàn Quyền Quản Lý & Chỉnh Sửa Hồ Sơ</span>
                    <span className="px-2 py-0.2 rounded bg-purple-200/80 text-purple-800 text-[10px] font-extrabold uppercase tracking-wide">Full Access</span>
                  </h4>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Tài khoản Admin có quyền chỉnh sửa 100% thông tin cán bộ: CCCD, Mật khẩu, Họ tên, Đơn vị, Chức danh, Vai trò RBAC, SĐT, Email, Ảnh đại diện, Trạng thái tài khoản và Điểm KPI.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm Cán Bộ</span>
                </button>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo CCCD, Họ tên cán bộ, Số điện thoại, Email, Chức vụ..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500"
              >
                <option value="ALL">Tất cả ban / văn phòng ({users.length})</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>

              <span className="text-xs text-slate-500 font-medium px-1 whitespace-nowrap">
                Hiển thị: <b className="text-slate-900">{filteredUsers.length}</b>/{users.length}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Thanh điều khiển cuộn ngang trên đầu bảng */}
            <div className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-red-100 text-red-700">
                  <MoveHorizontal className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Thanh cuộn sang trái / phải (Đã đưa lên trên đầu bảng):
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Kéo thanh trượt ngang bên dưới hoặc bấm nút để xem trọn vẹn các cột
                </span>
              </div>

              {/* Nút cuộn nhanh */}
              <div className="flex items-center space-x-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => scrollHorizontally('start')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg text-[11px] transition-colors"
                  title="Cuộn về cột đầu tiên bên trái"
                >
                  ⏮ Đầu bảng
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontally('left')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg text-[11px] flex items-center space-x-1 transition-colors shadow-2xs"
                  title="Cuộn sang trái"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sang trái</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontally('right')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg text-[11px] flex items-center space-x-1 transition-colors shadow-2xs"
                  title="Cuộn sang phải"
                >
                  <span>Sang phải</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontally('end')}
                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 rounded-lg text-[11px] transition-colors"
                  title="Cuộn nhanh tới cột Thao tác quản trị ở cuối bên phải"
                >
                  Cột cuối (Thao tác) ⏭
                </button>
              </div>
            </div>

            {/* THANH CUỘN NGANG TRÊN ĐẦU BẢNG (Top Horizontal Scrollbar) */}
            <div
              ref={topScrollRef}
              onScroll={handleTopScroll}
              className="overflow-x-auto bg-slate-100/90 border-b border-slate-200 top-horizontal-scrollbar cursor-ew-resize select-none"
              title="Thanh cuộn ngang trên đầu bảng - Kéo sang trái hoặc phải"
            >
              <div style={{ width: `${tableScrollWidth}px`, height: '14px' }} />
            </div>

            {/* Table */}
            <div
              ref={tableScrollRef}
              onScroll={handleTableScroll}
              className="overflow-x-auto"
            >
              <table ref={tableRef} className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Cán bộ & Chức danh</th>
                    <th className="py-3.5 px-3">Căn cước công dân (CCCD)</th>
                    <th className="py-3.5 px-3">Trạng thái Online</th>
                    <th className="py-3.5 px-3 text-center">Tài khoản</th>
                    <th className="py-3.5 px-3 text-center">Đăng nhập</th>
                    <th className="py-3.5 px-3">Số ĐT & Email</th>
                    <th className="py-3.5 px-3">Đơn vị công tác</th>
                    <th className="py-3.5 px-3">Vai trò phân quyền</th>
                    <th className="py-3.5 px-3 text-center">Tải việc</th>
                    <th className="py-3.5 px-3 text-center">KPI</th>
                    <th className="py-3.5 px-4 text-right">Thao tác Quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => {
                    const dept = departments.find(d => d.id === user.departmentId);
                    const roleInfo = getRoleBadge(user.role);
                    const isCurrent = user.id === currentUser.id;
                    const isOnline = isUserOnline(user.id);
                    const loginCount = getUserLoginCount(user.id);
                    const isActive = (user.status ?? 'active') === 'active';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Officer name & avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => openProfileDetailModal(user)}
                              className="relative shrink-0 hover:opacity-85 transition-opacity"
                              title="Xem hồ sơ chi tiết cán bộ"
                            >
                              <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-red-400 transition-all"
                              />
                              {isOnline && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => openProfileDetailModal(user)}
                                  className="font-bold text-slate-900 hover:text-red-700 text-left transition-colors"
                                >
                                  {user.fullName}
                                </button>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 font-medium">{user.position}</p>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                                <span>ID: {user.username}</span>
                                <span>•</span>
                                <span>{user.gender === 'NAM' ? 'Nam' : user.gender === 'NU' ? 'Nữ' : 'Khác'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CCCD */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {user.citizenId || 'Chưa cập nhật'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Tài khoản đăng nhập</span>
                        </td>

                        {/* Online Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isOnline ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>Trực tuyến</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Ngoại tuyến</span>
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {canManageUsers ? (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              }`}
                              title="Bấm để Đổi Trạng Thái Hoạt Động / Tạm Khóa"
                            >
                              {isActive ? '● Đang hoạt động' : '✕ Tạm khóa'}
                            </button>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300'
                            }`}>
                              {isActive ? 'Hoạt động' : 'Tạm khóa'}
                            </span>
                          )}
                        </td>

                        {/* Login Count */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setIsLoginStatsModalOpen(true)}
                            className="px-2 py-0.5 rounded-md bg-red-50 hover:bg-red-100 text-red-700 font-bold font-mono text-xs border border-red-200/80 transition-colors"
                            title="Xem chi tiết nhật ký đăng nhập"
                          >
                            {loginCount} lượt
                          </button>
                        </td>

                        {/* Phone & Email */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-slate-800 font-medium">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{user.phone || 'Chưa có SĐT'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-500 text-[10px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{user.email}</span>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">{dept?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Mã: {dept?.code}</span>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* Active tasks */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                            user.activeTaskCount <= 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : user.activeTaskCount <= 3
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {user.activeTaskCount} việc
                          </span>
                        </td>

                        {/* KPI Score */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="font-bold text-amber-600 text-xs">
                            {user.kpiScore ?? 70} đ
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* View Profile Detail */}
                            <button
                              type="button"
                              onClick={() => openProfileDetailModal(user)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1"
                              title="Xem toàn bộ hồ sơ cán bộ"
                            >
                              <FileText className="w-3 h-3 text-slate-500" />
                              <span>Hồ sơ</span>
                            </button>

                            {/* Admin Reset Password button */}
                            {currentUser.role === 'ADMIN' && (
                              <button
                                onClick={() => openResetPasswordModal(user)}
                                className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center space-x-1 text-[11px] font-bold"
                                title="Admin Reset Mật Khẩu"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden xl:inline">Reset MK</span>
                              </button>
                            )}
                            
                            {/* Admin Full Edit & Delete */}
                            {canManageUsers && (
                              <>
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1"
                                  title={`Chỉnh sửa toàn bộ thông tin cán bộ ${user.fullName}`}
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Sửa hồ sơ</span>
                                </button>
                                {users.length > 1 && user.role !== 'ADMIN' && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Đồng chí có chắc chắn muốn xóa tài khoản cán bộ "${user.fullName}" (CCCD: ${user.citizenId || user.username}) khỏi hệ thống?`)) {
                                        deleteUser(user.id);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1"
                                    title={`Xóa tài khoản cán bộ ${user.fullName}`}
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                    <span>Xóa tài khoản</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RBAC MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
            <h3 className="text-sm font-bold text-blue-950 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Nguyên Tắc Phân Quyền & Bảo Mật Công Vụ Trong Cơ Quan MTTQ Tỉnh Bắc Ninh</span>
            </h3>
            <p className="text-xs text-blue-800 mt-1">
              Hệ thống thực thi nghiêm ngặt quyền hạn bảo mật thông tin theo cấp bậc hành chính nhà nước.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Quyền hạn / Chức năng</th>
                  <th className="py-3.5 px-3 text-center bg-purple-50/50 text-purple-900">Quản trị viên (Admin)</th>
                  <th className="py-3.5 px-3 text-center bg-red-50/50 text-red-900">Thường trực MTTQ Tỉnh (Chủ tịch / PCT)</th>
                  <th className="py-3.5 px-3 text-center bg-blue-50/50 text-blue-900">Lãnh đạo Ban/VP (Trưởng ban/Chánh VP)</th>
                  <th className="py-3.5 px-3 text-center bg-emerald-50/50 text-emerald-900">Chuyên viên chuyên trách</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Đăng nhập hệ thống bằng CCCD + Mật khẩu</td>
                  <td className="py-3 px-3 text-center bg-purple-50/20 text-emerald-600 font-bold">✓ Có</td>
                  <td className="py-3 px-3 text-center bg-red-50/20 text-emerald-600 font-bold">✓ Có</td>
                  <td className="py-3 px-3 text-center bg-blue-50/20 text-emerald-600 font-bold">✓ Có</td>
                  <td className="py-3 px-3 text-center bg-emerald-50/20 text-emerald-600 font-bold">✓ Có</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Quyền Reset / Cấp lại Mật khẩu khi quên</td>
                  <td className="py-3 px-3 text-center bg-purple-50/20 text-purple-700 font-extrabold">✓ Toàn quyền Reset mọi tài khoản</td>
                  <td className="py-3 px-3 text-center bg-red-50/20 text-slate-400">✗ Qua Admin</td>
                  <td className="py-3 px-3 text-center bg-blue-50/20 text-slate-400">✗ Qua Admin</td>
                  <td className="py-3 px-3 text-center bg-emerald-50/20 text-slate-400">✗ Qua Admin</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Phạm vi xem danh sách nhiệm vụ</td>
                  <td className="py-3 px-3 text-center bg-purple-50/20 text-purple-900 font-semibold">Toàn bộ Cơ Quan</td>
                  <td className="py-3 px-3 text-center bg-red-50/20 text-red-900 font-semibold">Toàn bộ Cơ Quan</td>
                  <td className="py-3 px-3 text-center bg-blue-50/20 text-blue-900 font-semibold">Chỉ ban/văn phòng mình quản lý</td>
                  <td className="py-3 px-3 text-center bg-emerald-50/20 text-emerald-900 font-semibold">Chỉ việc mình chủ trì / phối hợp</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Giao nhiệm vụ & Phân công cán bộ</td>
                  <td className="py-3 px-3 text-center bg-purple-50/20 text-emerald-600 font-bold">✓ Toàn quyền</td>
                  <td className="py-3 px-3 text-center bg-red-50/20 text-emerald-600 font-bold">✓ Giao cho mọi ban / cá nhân</td>
                  <td className="py-3 px-3 text-center bg-blue-50/20 text-blue-600 font-bold">✓ Giao cho cán bộ trong ban</td>
                  <td className="py-3 px-3 text-center bg-emerald-50/20 text-slate-400">✗ Không có quyền</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Phê duyệt & Chấm điểm KPI nhiệm vụ</td>
                  <td className="py-3 px-3 text-center bg-purple-50/20 text-emerald-600 font-bold">✓ Toàn quyền</td>
                  <td className="py-3 px-3 text-center bg-red-50/20 text-emerald-600 font-bold">✓ Duyệt toàn cơ quan</td>
                  <td className="py-3 px-3 text-center bg-blue-50/20 text-blue-600 font-bold">✓ Duyệt nhiệm vụ của ban</td>
                  <td className="py-3 px-3 text-center bg-emerald-50/20 text-slate-400">✗ Chỉ gửi báo cáo duyệt</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Quản trị người dùng & Hồ sơ CCCD cán bộ</td>
                  <td className="py-3 px-3 text-center bg-purple-50/20 text-emerald-600 font-bold">✓ Thêm/sửa/xóa/đổi quyền/Reset MK</td>
                  <td className="py-3 px-3 text-center bg-red-50/20 text-slate-500">Chỉ xem danh sách</td>
                  <td className="py-3 px-3 text-center bg-blue-50/20 text-slate-500">Chỉ xem danh sách ban</td>
                  <td className="py-3 px-3 text-center bg-emerald-50/20 text-slate-400">✗ Không</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DEPARTMENTS */}
      {activeSubTab === 'departments' && (
        <div className="space-y-4">
          {/* Department Action Banner & Stats */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-700 text-white rounded-xl shadow-xs shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span>Cơ Cấu Tổ Chức: Phòng, Ban, Bộ Phận</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-extrabold">
                    {departments.length} Đơn vị
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý tổ chức bộ máy, các Ban chuyên môn, Văn phòng và bộ phận trực thuộc UB MTTQ Tỉnh Bắc Ninh
                </p>
              </div>
            </div>

            {canManageUsers && (
              <button
                type="button"
                onClick={openCreateDeptModal}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all shrink-0 active:scale-98"
                title="Thêm mới Phòng, Ban, Bộ phận vào hệ thống cơ quan"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Mới Phòng, Ban</span>
              </button>
            )}
          </div>

          {/* Toast / Feedback Message if any */}
          {deptSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between text-xs font-semibold shadow-2xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{deptSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeptSuccessMsg('')}
                className="text-emerald-700 hover:text-emerald-950 font-bold p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map(dept => {
              const headUser = users.find(u => u.id === dept.headUserId);
              const deptMembers = users.filter(u => u.departmentId === dept.id);
              const deptTasks = tasks.filter(t => t.departmentId === dept.id && t.status !== 'COMPLETED');

              return (
                <div
                  key={dept.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {dept.code}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {deptTasks.length} việc
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {deptMembers.length} cán bộ
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{dept.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-3 min-h-[36px]">
                        {dept.description || 'Chưa cập nhật mô tả chức năng nhiệm vụ...'}
                      </p>
                    </div>

                    {/* Member Avatars Preview */}
                    {deptMembers.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                          {deptMembers.slice(0, 5).map(m => (
                            <img
                              key={m.id}
                              src={m.avatar}
                              alt={m.fullName}
                              title={`${m.fullName} - ${m.position}`}
                              className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                          {deptMembers.length > 5 && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-white bg-slate-100 text-[9px] font-bold text-slate-600">
                              +{deptMembers.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    {/* Head Officer Info */}
                    <div className="flex items-center space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {headUser ? (
                        <>
                          <img
                            src={headUser.avatar}
                            alt={headUser.fullName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block truncate">Lãnh đạo đơn vị:</span>
                            <span className="text-xs font-bold text-slate-800 truncate block">{headUser.fullName}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-400 italic flex items-center space-x-1.5 py-0.5">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Chưa chỉ định Trưởng ban</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Action Buttons: Edit & Delete */}
                    {canManageUsers && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditDeptModal(dept)}
                          className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                          title="Chỉnh sửa thông tin phòng, ban"
                        >
                          <Edit2 className="w-3 h-3 text-blue-600" />
                          <span>Sửa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteDeptModal(dept)}
                          className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={departments.length <= 1}
                          title={
                            departments.length <= 1
                              ? 'Không thể xóa phòng ban duy nhất'
                              : 'Xóa phòng ban này và điều chuyển cán bộ'
                          }
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create or Edit User (Full Admin Editing) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-5 text-white flex items-center justify-between ${
              editingUser?.role === 'ADMIN'
                ? 'bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 border-b border-purple-500/30'
                : 'bg-gradient-to-r from-red-800 via-red-900 to-indigo-950'
            }`}>
              <div>
                <h3 className="text-sm font-bold flex items-center space-x-2 flex-wrap gap-1">
                  {editingUser?.role === 'ADMIN' ? (
                    <Shield className="w-4 h-4 text-amber-400" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-amber-300" />
                  )}
                  <span>
                    {editingUser 
                      ? (editingUser.role === 'ADMIN' 
                          ? `Chỉnh Sửa Tài Khoản QUẢN TRỊ VIÊN (ADMIN): ${editingUser.fullName}` 
                          : `Chỉnh Sửa Hồ Sơ & Quyền Cán Bộ: ${editingUser.fullName}`) 
                      : 'Thêm Cán Bộ & Cấp Tài Khoản Mới'}
                  </span>
                  {editingUser?.role === 'ADMIN' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      ADMIN ROOT
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-red-200 mt-0.5">
                  {editingUser?.role === 'ADMIN'
                    ? 'Chỉnh sửa tài khoản Quản trị viên: CCCD, mật khẩu đăng nhập, phân quyền, họ tên, liên lạc, chức danh và điểm KPI.'
                    : 'Đặc quyền Quản trị viên (Admin): Toàn quyền cấu hình CCCD, Mật khẩu, Thông tin cá nhân, Phân quyền RBAC, Ban công tác & Điểm KPI.'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Phần 1: Thông tin định danh & Đăng nhập */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-slate-800 font-bold text-xs pb-1.5 border-b border-slate-200">
                  <div className="flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-red-600" />
                    <span>1. Thông Tin Định Danh & Đăng Nhập (CCCD & Mật khẩu)</span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded">Admin Edit All</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Họ và tên cán bộ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Hoàng"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Số Căn cước công dân (CCCD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={citizenId}
                      onChange={e => setCitizenId(e.target.value)}
                      placeholder="12 chữ số (VD: 027085001234)"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Tên đăng nhập / ID
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="cb.xxxx hoặc username"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Giới tính
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as Gender)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                    >
                      <option value="NAM">Nam</option>
                      <option value="NU">Nữ</option>
                      <option value="KHAC">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Mật khẩu đăng nhập hệ thống <span className="text-slate-500 font-normal">(Admin có quyền trực tiếp xem & sửa đổi)</span>
                  </label>
                  <div className="relative flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPassword(`MTTQ@${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-colors"
                      title="Tạo mật khẩu ngẫu nhiên an toàn"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ngẫu nhiên</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Phần 2: Thông tin liên hệ & Ảnh đại diện */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-xs pb-1.5 border-b border-slate-200">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>2. Thông Tin Liên Lạc & Ảnh Chân Dung Cán Bộ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Số điện thoại di động <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Ví dụ: 0912.345.678"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Email công vụ / cá nhân
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ten.cb@bacninh.gov.vn"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ảnh đại diện (Chọn nhanh ảnh mẫu chuẩn công chức hoặc nhập URL):</span>
                    </label>
                  </div>

                  {/* Preset Avatars */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2.5">
                    {PRESET_AVATARS.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatar(p.url)}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          avatar === p.url ? 'border-red-600 ring-2 ring-red-200' : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full aspect-square object-cover rounded-lg" />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] py-0.5 text-center truncate">
                          {p.gender === 'NAM' ? 'Nam' : 'Nữ'} {idx % 4 + 1}
                        </span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    placeholder="Nhập đường dẫn URL ảnh đại diện tùy chỉnh (https://...)"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-[11px] font-mono"
                  />
                </div>
              </div>

              {/* Phần 3: Thông tin công tác, Phân quyền & Quản lý (RBAC & KPI) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-xs pb-1.5 border-b border-slate-200">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>3. Thông Tin Công Tác, Phân Quyền (RBAC) & Đánh Giá KPI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Đơn vị / Ban trực thuộc <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={departmentId}
                      onChange={e => setDepartmentId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Vai trò phân quyền hệ thống (RBAC) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-red-950"
                    >
                      <option value="OFFICER">Chuyên viên chuyên trách</option>
                      <option value="DEPT_HEAD">Lãnh đạo Ban / Văn phòng (Trưởng ban/Chánh VP)</option>
                      <option value="AGENCY_LEAD">Thường trực UB MTTQ Tỉnh (Chủ tịch/PCT)</option>
                      <option value="ADMIN">Quản trị hệ thống (Admin)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-bold text-slate-800 block mb-1">Chức vụ cụ thể</label>
                    <input
                      type="text"
                      value={position}
                      onChange={e => setPosition(e.target.value)}
                      placeholder="VD: Chuyên viên chính..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Trạng thái tài khoản</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                      className={`w-full p-2 bg-white border rounded-lg font-bold ${
                        status === 'active' ? 'text-emerald-700 border-emerald-300' : 'text-rose-700 border-rose-300'
                      }`}
                    >
                      <option value="active">● Đang hoạt động</option>
                      <option value="inactive">✕ Tạm khóa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Điểm KPI khởi tạo / Tích lũy</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={kpiScore}
                      onChange={e => setKpiScore(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Kỹ năng & Lĩnh vực chuyên môn phụ trách
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    placeholder="Ví dụ: Giám sát phản biện, Đơn thư, Quỹ vì người nghèo, Tuyên giáo, Tổ chức sự kiện..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Phân tách các kỹ năng bằng dấu phẩy (,). Hệ thống AI sẽ tự động tham chiếu khi phân bổ công việc.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <div>
                  {editingUser && users.length > 1 && editingUser.role !== 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Đồng chí có chắc chắn muốn xóa tài khoản cán bộ "${editingUser.fullName}" khỏi hệ thống?`)) {
                          deleteUser(editingUser.id);
                          setIsModalOpen(false);
                        }
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl flex items-center space-x-1.5 transition-colors text-xs"
                      title={`Xóa vĩnh viễn tài khoản cán bộ ${editingUser.fullName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Xóa Tài Khoản</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingUser ? 'Lưu Toàn Bộ Thay Đổi' : 'Tạo Tài Khoản & Cấp Mật Khẩu'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detailed Personnel Dossier (Xem Chi Tiết Hồ Sơ Cán Bộ) */}
      {isProfileDetailModalOpen && viewingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={viewingUser.avatar}
                  alt={viewingUser.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>{viewingUser.fullName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold uppercase">
                      Hồ sơ công chức
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">{viewingUser.position}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileDetailModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Top summary badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Đơn vị</span>
                  <span className="font-bold text-slate-900 truncate block mt-0.5">
                    {departments.find(d => d.id === viewingUser.departmentId)?.name || 'Cơ quan'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Vai trò</span>
                  <span className="font-bold text-red-700 truncate block mt-0.5">
                    {getRoleBadge(viewingUser.role).label}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Điểm KPI</span>
                  <span className="font-bold text-amber-600 text-sm block mt-0.5">
                    {viewingUser.kpiScore ?? 70} đ
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Trạng thái</span>
                  <span className={`font-bold block mt-0.5 ${
                    (viewingUser.status ?? 'active') === 'active' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {(viewingUser.status ?? 'active') === 'active' ? '● Hoạt động' : '✕ Tạm khóa'}
                  </span>
                </div>
              </div>

              {/* Dossier details card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5">
                <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 pb-2 border-b border-slate-200">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Thông Tin Định Danh & Pháp Lý</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Số Căn cước công dân (CCCD):</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
                      {viewingUser.citizenId || 'Chưa cập nhật'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Tên đăng nhập hệ thống:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
                      {viewingUser.username}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Ngày sinh:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.dateOfBirth || 'Chưa cập nhật'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Giới tính:</span>
                    <span className="font-semibold text-slate-800">
                      {viewingUser.gender === 'NAM' ? 'Nam' : viewingUser.gender === 'NU' ? 'Nữ' : 'Khác'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Số điện thoại liên hệ:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.phone || 'Chưa có SĐT'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Email công vụ:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.email}</span>
                  </div>

                  {/* Password shown for Admin */}
                  {currentUser.role === 'ADMIN' && (
                    <div className="sm:col-span-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-amber-800 font-bold block">Mật khẩu hiện tại (Chỉ Admin nhìn thấy):</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{viewingUser.password || '123456'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDetailModalOpen(false);
                          openResetPasswordModal(viewingUser);
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Reset MK</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & expertise */}
              {viewingUser.skills && viewingUser.skills.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Lĩnh Vực Chuyên Môn & Kỹ Năng Phụ Trách</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingUser.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity stats */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Số nhiệm vụ đang xử lý</span>
                  <span className="font-bold text-blue-600 text-base">{viewingUser.activeTaskCount} việc</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Lượt đăng nhập hệ thống</span>
                  <span className="font-bold text-red-600 text-base">{getUserLoginCount(viewingUser.id)} lượt</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileDetailModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                  >
                    Đóng
                  </button>

                  {canManageUsers && viewingUser && users.length > 1 && viewingUser.role !== 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Đồng chí có chắc chắn muốn xóa tài khoản cán bộ "${viewingUser.fullName}" khỏi hệ thống?`)) {
                          deleteUser(viewingUser.id);
                          setIsProfileDetailModalOpen(false);
                        }
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl flex items-center space-x-1.5 transition-colors text-xs"
                      title={`Xóa tài khoản cán bộ ${viewingUser.fullName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Xóa Tài Khoản</span>
                    </button>
                  )}
                </div>

                {canManageUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDetailModalOpen(false);
                      openEditModal(viewingUser);
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Chỉnh Sửa Toàn Bộ Thông Tin Cán Bộ Này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Reset Password */}
      {isResetModalOpen && userForReset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-xl text-amber-300">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Admin Cấp Lại Mật Khẩu (Reset)</h3>
                  <p className="text-[11px] text-amber-200">Đồng chí: {userForReset.fullName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsResetModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteResetPassword} className="p-5 space-y-4 text-xs">
              {/* User summary card */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Số Căn cước công dân:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                    {userForReset.citizenId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Số điện thoại:</span>
                  <span className="font-semibold text-slate-800">{userForReset.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Chức vụ:</span>
                  <span className="font-medium text-slate-800">{userForReset.position}</span>
                </div>
              </div>

              {resetSuccessMessage ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đặt lại mật khẩu thành công!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">{resetSuccessMessage}</p>
                  
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {appliedPassword === '123' ? 'Mật khẩu mặc định đã cấp:' : 'Mật khẩu tùy chọn đã cấp:'}
                      </span>
                      <span className="font-mono font-extrabold text-base text-slate-900 tracking-wider">
                        {appliedPassword || '123'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyPasswordToClipboard}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center space-x-1.5 text-xs transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 italic">
                    * Cán bộ {userForReset.fullName} dùng số CCCD <span className="font-mono font-bold text-slate-800">{userForReset.citizenId}</span> và mật khẩu trên để đăng nhập.
                  </p>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(false)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
                    >
                      Hoàn Tất & Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mode Selector Tabs: Mặc định (123) hoặc Tùy chọn */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Chọn phương thức cấp lại mật khẩu:
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setResetOption('default')}
                        className={`py-2 px-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                          resetOption === 'default'
                            ? 'bg-white text-amber-900 shadow-xs border border-amber-300'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mặc Định (123)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetOption('custom')}
                        className={`py-2 px-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                          resetOption === 'custom'
                            ? 'bg-white text-amber-900 shadow-xs border border-amber-300'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tùy Chọn Mật Khẩu</span>
                      </button>
                    </div>
                  </div>

                  {/* Option 1: Reset về mặc định (123) */}
                  {resetOption === 'default' && (
                    <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2 animate-in fade-in duration-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                          <Key className="w-4 h-4 text-amber-600" />
                          <span>Mật khẩu mặc định hệ thống:</span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-amber-200 text-amber-950 font-extrabold text-sm rounded-md font-mono tracking-wider">
                          123
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Mật khẩu của đồng chí <strong className="text-slate-900">{userForReset.fullName}</strong> sẽ được đưa về giá trị mặc định <strong className="text-amber-950 font-mono">123</strong>. Cán bộ dùng số CCCD để đăng nhập ngay và tự đổi mật khẩu mới sau đó.
                      </p>
                    </div>
                  )}

                  {/* Option 2: Tùy chọn mật khẩu (giữ nguyên như hiện nay) */}
                  {resetOption === 'custom' && (
                    <div className="space-y-2 animate-in fade-in duration-100">
                      <label className="text-xs font-bold text-slate-800 block">
                        Mật khẩu mới cho tài khoản <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex space-x-2">
                        <input
                          type="text"
                          required
                          value={newPasswordInput}
                          onChange={e => setNewPasswordInput(e.target.value)}
                          placeholder="Nhập mật khẩu mới..."
                          className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-600"
                        />
                        <button
                          type="button"
                          onClick={() => setNewPasswordInput(`MTTQ@${Math.floor(1000 + Math.random() * 9000)}`)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-[11px] whitespace-nowrap flex items-center space-x-1"
                          title="Tạo ngẫu nhiên mật khẩu mới an toàn"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Mới</span>
                        </button>
                      </div>

                      {/* Quick preset buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-slate-500">Mẫu nhanh:</span>
                        <button
                          type="button"
                          onClick={() => setNewPasswordInput('123')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded font-mono text-[10px] font-bold border border-slate-200 transition-colors"
                        >
                          123
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPasswordInput('MTTQ@2026')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded font-mono text-[10px] font-bold border border-slate-200 transition-colors"
                        >
                          MTTQ@2026
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPasswordInput(`MTTQ@${Math.floor(1000 + Math.random() * 9000)}`)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded font-mono text-[10px] font-bold border border-slate-200 transition-colors"
                        >
                          Mã ngẫu nhiên
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1">
                        Mật khẩu mới sẽ có hiệu lực ngay lập tức. Cán bộ dùng số CCCD để đăng nhập với mật khẩu này.
                      </p>
                    </div>
                  )}

                  {/* Dual Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 order-3 sm:order-1"
                    >
                      Đóng
                    </button>

                    {/* Button 1: Reset về mặc định (123) */}
                    <button
                      type="button"
                      onClick={() => handleExecuteResetPassword(undefined, 'default')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all order-1 sm:order-2 ${
                        resetOption === 'default'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400/40'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                      title="Reset ngay mật khẩu về mặc định 123"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Reset Về Mặc Định (123)</span>
                    </button>

                    {/* Button 2: Tùy chọn */}
                    <button
                      type="button"
                      onClick={() => {
                        if (resetOption !== 'custom') {
                          setResetOption('custom');
                        } else {
                          handleExecuteResetPassword(undefined, 'custom');
                        }
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all order-2 sm:order-3 ${
                        resetOption === 'custom'
                          ? 'bg-red-700 hover:bg-red-800 text-white ring-2 ring-red-400/40'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                      title="Reset mật khẩu theo giá trị tùy chọn"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{resetOption === 'custom' ? 'Xác Nhận Tùy Chọn' : 'Mật Khẩu Tùy Chọn'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Department (Admin Feature) */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-5 text-white flex items-center justify-between ${
              editingDept 
                ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900' 
                : 'bg-gradient-to-r from-red-800 via-red-900 to-indigo-950'
            }`}>
              <div>
                <h3 className="text-sm font-bold flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>
                    {editingDept
                      ? `Chỉnh Sửa Phòng, Ban, Bộ Phận: ${editingDept.name}`
                      : 'Thêm Mới Phòng, Ban, Bộ Phận Cơ Quan'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5">
                  {editingDept
                    ? 'Cập nhật tên đơn vị, mã định danh, mô tả chức năng & chỉ định lãnh đạo đơn vị'
                    : 'Khai báo đơn vị tổ chức mới vào hệ thống quản lý công việc UB MTTQ Tỉnh Bắc Ninh'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsDeptModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeptFormSubmit} className="p-5 space-y-4 text-xs">
              {deptError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{deptError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Tên Phòng, Ban, Bộ phận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={e => setDeptName(e.target.value)}
                  placeholder="Ví dụ: Ban Dân tộc - Tôn giáo, Phòng Kế hoạch - Tổng hợp..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Mã Ban viết tắt (Ký hiệu) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={e => setDeptCode(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: VP, DCS, TG, TCKT, CHT..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-red-500 uppercase tracking-wider"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Mã dùng để phân loại nhanh trong bảng việc, ma trận nhiệm vụ và xuất báo cáo
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Chỉ định Lãnh đạo Đơn vị (Trưởng Ban / Chánh Văn Phòng)
                </label>
                <select
                  value={deptHeadUserId}
                  onChange={e => setDeptHeadUserId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Chưa chỉ định Trưởng Ban --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} - {u.position} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Mô tả chức năng, nhiệm vụ trọng tâm
                </label>
                <textarea
                  rows={3}
                  value={deptDescription}
                  onChange={e => setDeptDescription(e.target.value)}
                  placeholder="Mô tả chức năng, thẩm quyền và nhiệm vụ phụ trách của phòng/ban..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingDept ? 'Lưu Thay Đổi Phòng/Ban' : '+ Tạo Phòng/Ban Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Department Confirmation */}
      {isDeleteDeptModalOpen && deptToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-red-700 via-red-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                <h3 className="text-sm font-bold">Xác Nhận Xóa Phòng, Ban, Bộ Phận</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsDeleteDeptModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-1">
                <p className="font-bold text-sm text-red-950 flex items-center space-x-1.5">
                  <span>{deptToDelete.name}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-red-200 text-red-800 rounded">
                    {deptToDelete.code}
                  </span>
                </p>
                <p className="text-xs text-red-700">
                  Đơn vị này hiện có{' '}
                  <strong className="font-bold text-red-950">
                    {users.filter(u => u.departmentId === deptToDelete.id).length} cán bộ
                  </strong>{' '}
                  và{' '}
                  <strong className="font-bold text-red-950">
                    {tasks.filter(t => t.departmentId === deptToDelete.id).length} nhiệm vụ
                  </strong>{' '}
                  liên quan.
                </p>
              </div>

              {departments.filter(d => d.id !== deptToDelete.id).length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Chuyển giao cán bộ và công việc sang đơn vị: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={targetFallbackDeptId}
                    onChange={e => setTargetFallbackDeptId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                  >
                    {departments
                      .filter(d => d.id !== deptToDelete.id)
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Để đảm bảo liên tục công vụ, toàn bộ cán bộ và nhiệm vụ trực thuộc đơn vị này sẽ được tự động điều chuyển an toàn.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteDeptModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteDept}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác Nhận Xóa Phòng Ban</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
