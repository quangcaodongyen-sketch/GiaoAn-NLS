import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MockDB, User, Log } from '../services/mockDb';
import { useAuthStore } from '../store/authStore';
import { LogOut, Users, Settings, Activity, Shield, Phone, Unlock, Lock, Award } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(MockDB.getUsers().filter(u => u.role !== 'admin'));
    setLogs(MockDB.getLogs().slice(-50).reverse()); // 50 recent logs
    setStats(MockDB.getStats());
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGrantVip = (userId: string, months: number) => {
    const u = MockDB.getUserById(userId);
    if (!u) return;
    const now = Date.now();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + months);
    
    MockDB.updateUser(userId, {
      role: 'vip',
      vipEndDate: endDate.getTime()
    });
    MockDB.addLog(user!.id, 'upgrade_vip', `Granted VIP for ${months} months to ${u.username}`);
    refreshData();
  };

  const handleToggleLock = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    MockDB.updateUser(userId, { status: newStatus });
    refreshData();
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-900 text-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="text-blue-400" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-1 text-slate-300 hover:text-white">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </header>

      <main className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Activity className="mr-2" size={18}/> Thống kê</h3>
            {stats && (
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex justify-between"><span>Tổng TV:</span> <strong>{stats.totalUsers}</strong></li>
                <li className="flex justify-between"><span>VIP:</span> <strong className="text-yellow-600">{stats.totalVip}</strong></li>
                <li className="flex justify-between"><span>Dùng thử:</span> <strong>{stats.totalTrial}</strong></li>
                <li className="flex justify-between"><span>Hết hạn:</span> <strong className="text-red-600">{stats.totalExpired}</strong></li>
                <li className="flex justify-between"><span>Số lượt đăng nhập:</span> <strong>{stats.totalLogins}</strong></li>
                <li className="flex justify-between"><span>Giáo án đã xử lý:</span> <strong>{stats.totalProcessed}</strong></li>
              </ul>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Settings className="mr-2" size={18}/> Nhật ký gần đây</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.map(log => (
                <div key={log.id} className="text-xs border-b pb-1">
                  <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                  <p className="font-medium text-slate-700">{log.action}</p>
                  <p className="text-slate-500">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><Users className="mr-2"/> Quản lý thành viên</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Username</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Hết hạn VIP</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${u.role === 'vip' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.vipEndDate ? new Date(u.vipEndDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => handleGrantVip(u.id, 1)} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors" title="Cấp VIP 1 Tháng">
                          <Award size={14} className="inline mr-1"/> 1 Tháng
                        </button>
                        <button onClick={() => handleGrantVip(u.id, 12)} className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors" title="Cấp VIP 1 Năm">
                           1 Năm
                        </button>
                        <button onClick={() => handleToggleLock(u.id, u.status)} className={`text-xs px-2 py-1 rounded transition-colors ${u.status === 'active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {u.status === 'active' ? <Lock size={14} className="inline"/> : <Unlock size={14} className="inline"/>}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chưa có thành viên nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
