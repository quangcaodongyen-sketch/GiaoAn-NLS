import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Key, User, Star, AlertTriangle, Phone } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user, logout, updateUser, checkExpiration } = useAuthStore();
  const navigate = useNavigate();
  const [apiKeyInput, setApiKeyInput] = useState(user?.apiKey || '');
  const [saveMessage, setSaveMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveApi = () => {
    updateUser({ apiKey: apiKeyInput });
    setSaveMessage('Đã lưu API Key thành công!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const isExpired = checkExpiration();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">Dashboard Cá Nhân</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-1 text-slate-600 hover:text-red-600">
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* User Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Thông tin tài khoản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Tên đăng nhập</p>
              <p className="font-semibold">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Loại tài khoản</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'vip' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                  {user.role.toUpperCase()}
                </span>
                {isExpired && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
                    ĐÃ HẾT HẠN
                  </span>
                )}
              </div>
            </div>
          </div>

          {isExpired && (
            <div className="mt-6 bg-red-50 p-4 rounded-lg flex items-start space-x-3 border border-red-200">
              <AlertTriangle className="text-red-600 shrink-0" />
              <div>
                <h3 className="font-bold text-red-800">Tài khoản dùng thử/VIP đã hết hạn</h3>
                <p className="text-red-700 text-sm mt-1">
                  Vui lòng liên hệ: <strong>Tel/Zalo 0915.213717 (Mr. Thành)</strong> để được kích hoạt VIP.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* API Key Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-4 border-b pb-2">
            <Key className="text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">Quản lý API Key</h2>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            Ứng dụng sử dụng Gemini API. Bạn cần có API Key của riêng mình. <Link to="/api-guide" className="text-blue-600 hover:underline">Xem hướng dẫn lấy API tại đây.</Link>
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="password"
              placeholder="sk-..."
              className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            <button
              onClick={handleSaveApi}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              Lưu API Key
            </button>
          </div>
          {saveMessage && <p className="text-green-600 text-sm mt-2">{saveMessage}</p>}
        </div>

        {/* App Access */}
        <div className="flex justify-center mt-8">
          {isExpired ? (
            <button disabled className="px-8 py-4 bg-slate-300 text-slate-500 rounded-xl font-bold flex items-center space-x-2 cursor-not-allowed">
              <Star />
              <span>BẮT ĐẦU SỬ DỤNG (CẦN NÂNG CẤP VIP)</span>
            </button>
          ) : (
            <Link to="/app" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all flex items-center space-x-2">
              <Star />
              <span>BẮT ĐẦU SỬ DỤNG ỨNG DỤNG</span>
            </Link>
          )}
        </div>
      </main>
      
      <footer className="text-center py-6 mt-12 text-slate-500 text-sm flex justify-center items-center space-x-2">
         <Phone size={16} />
         <span>Liên hệ hỗ trợ: Tel/Zalo 0915.213717 (Mr. Thành)</span>
      </footer>
    </div>
  );
};

export default UserDashboard;
