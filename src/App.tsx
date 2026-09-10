/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { KanbanView } from './components/KanbanView';
import { KPIManagementView } from './components/KPIManagementView';
import { UserManagementView } from './components/UserManagementView';
import { RemindersView } from './components/RemindersView';
import { TaskMatrixView } from './components/TaskMatrixView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskFormModal } from './components/TaskFormModal';
import { SmartAssignmentModal } from './components/SmartAssignmentModal';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { UrgentReminderDispatchModal } from './components/UrgentReminderDispatchModal';
import { UrgentReminderAlertModal } from './components/UrgentReminderAlertModal';
import { LoginStatsModal } from './components/LoginStatsModal';
import { HomePublicView } from './components/HomePublicView';
import { Shield, Sparkles, UserCheck, RefreshCw, CreditCard, LogIn } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    currentUser,
    users,
    switchUser,
    departments,
    unreadNotificationCount,
    setIsLoginModalOpen,
    isAuthenticated
  } = useApp();

  // If user is not authenticated, show the public Home & Login Portal view
  if (!isAuthenticated) {
    return (
      <>
        <HomePublicView />
        <LoginModal />
        <ChangePasswordModal />
      </>
    );
  }

  const currentDept = departments.find(d => d.id === currentUser.departmentId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Online Status Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-1.5 shadow-inner">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="font-bold text-amber-300 shrink-0">Đang trực tuyến:</span>
          <span className="text-slate-300 truncate">
            Đồng chí <strong className="text-white underline">{currentUser.fullName}</strong> <span className="hidden sm:inline">({currentUser.position} • {currentDept?.code})</span> <span className="font-mono text-amber-200 hidden md:inline">- CCCD: {currentUser.citizenId}</span>
          </span>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'matrix' && <TaskMatrixView />}
          {activeTab === 'tasks' && <TaskListView />}
          {activeTab === 'kanban' && <KanbanView />}
          {activeTab === 'kpi' && <KPIManagementView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'reminders' && <RemindersView />}
        </main>
      </div>

      {/* Global Modals */}
      <TaskDetailModal />
      <TaskFormModal />
      <SmartAssignmentModal />
      <LoginModal />
      <ChangePasswordModal />
      <UrgentReminderDispatchModal />
      <UrgentReminderAlertModal />
      <LoginStatsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
