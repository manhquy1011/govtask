import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  Sparkles,
  Trophy,
  Medal,
  Star,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const KPIManagementView: React.FC = () => {
  const { users, departments, tasks, userPermittedTasks } = useApp();

  // Calculate detailed KPI metrics per user
  const userRankings = users.map(user => {
    const userTasks = tasks.filter(
      t => t.leadAssigneeId === user.id || t.collaboratorIds?.includes(user.id)
    );
    const completedTasks = userTasks.filter(t => t.status === 'COMPLETED');
    const overdueTasks = userTasks.filter(t => t.status === 'OVERDUE');
    const ontimeTasks = completedTasks.filter(t => !t.completedAt || t.completedAt <= t.dueDate);

    const ontimeRate = completedTasks.length > 0
      ? Math.round((ontimeTasks.length / completedTasks.length) * 100)
      : 100;

    const dept = departments.find(d => d.id === user.departmentId);

    return {
      user,
      deptName: dept?.name || '',
      deptCode: dept?.code || '',
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      ontimeRate,
      kpiScore: user.kpiScore || 0,
    };
  });

  // Sort by KPI score descending
  userRankings.sort((a, b) => b.kpiScore - a.kpiScore);

  // Department Average KPI Data for Chart
  const deptKPIData = departments.map(dept => {
    const deptUsers = users.filter(u => u.departmentId === dept.id);
    const avgKPI = deptUsers.length > 0
      ? Math.round(deptUsers.reduce((sum, u) => sum + (u.kpiScore || 0), 0) / deptUsers.length)
      : 0;

    const deptTasks = tasks.filter(t => t.departmentId === dept.id);
    const completedCount = deptTasks.filter(t => t.status === 'COMPLETED').length;

    return {
      name: dept.code,
      fullName: dept.name,
      'Điểm KPI trung bình': avgKPI,
      'Nhiệm vụ hoàn thành': completedCount,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Trophy className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-200">
              Hệ Thống Đánh Giá Hiệu Suất Công Vụ
            </span>
            <h1 className="text-2xl font-bold mt-1 text-white">
              Bảng Xếp Hạng & Đánh Giá Điểm KPI Cơ Quan
            </h1>
            <p className="text-xs text-amber-100 mt-1 max-w-xl">
              Tính điểm tự động dựa trên mức độ quan trọng nhiệm vụ, tỷ lệ hoàn thành đúng hạn và chất lượng nghiệm thu.
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {userRankings.slice(0, 3).map((item, index) => {
          const isFirst = index === 0;
          return (
            <div
              key={item.user.id}
              className={`rounded-2xl p-5 border text-center transition-all ${
                isFirst
                  ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-md ring-2 ring-amber-400/50 order-first md:order-2'
                  : index === 1
                  ? 'bg-white border-slate-200 shadow-2xs order-2 md:order-1'
                  : 'bg-white border-slate-200 shadow-2xs order-3 md:order-3'
              }`}
            >
              <div className="relative inline-block mx-auto mb-3">
                <img
                  src={item.user.avatar}
                  alt={item.user.fullName}
                  className={`w-16 h-16 rounded-full object-cover ring-4 ${
                    isFirst ? 'ring-amber-400' : index === 1 ? 'ring-slate-300' : 'ring-amber-700/40'
                  }`}
                />
                <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                  isFirst ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
                }`}>
                  {index + 1}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{item.user.fullName}</h3>
              <p className="text-xs text-slate-500">{item.user.position}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold mt-1 inline-block">
                {item.deptName}
              </span>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-around text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Điểm KPI</span>
                  <strong className="text-amber-600 text-base font-bold">{item.kpiScore}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Đúng hạn</span>
                  <strong className="text-emerald-600 text-base font-bold">{item.ontimeRate}%</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Đã xong</span>
                  <strong className="text-blue-600 text-base font-bold">{item.completedTasks}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart: Department KPI Benchmarking */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          So Sánh Điểm KPI Trung Bình Giữa Các Đơn Vị
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Điểm trung bình của các cán bộ thuộc từng phòng ban
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptKPIData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Điểm KPI trung bình" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Nhiệm vụ hoàn thành" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Bảng Tổng Hợp Chi Tiết Đánh Giá Cán Bộ
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Hạng</th>
                <th className="py-3 px-3">Cán bộ</th>
                <th className="py-3 px-3">Đơn vị</th>
                <th className="py-3 px-3 text-center">Tổng việc phụ trách</th>
                <th className="py-3 px-3 text-center">Đã hoàn thành</th>
                <th className="py-3 px-3 text-center">Tỷ lệ đúng hạn</th>
                <th className="py-3 px-4 text-right">Tổng Điểm KPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userRankings.map((item, idx) => (
                <tr key={item.user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-700">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={item.user.avatar}
                        alt={item.user.fullName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{item.user.fullName}</p>
                        <p className="text-[10px] text-slate-500">{item.user.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {item.deptName}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-800 font-semibold">
                    {item.totalTasks}
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-600 font-bold">
                    {item.completedTasks}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                      {item.ontimeRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.kpiScore} điểm</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
