import { BookOpen, GraduationCap, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-800 rounded-lg">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SOẠN GIÁO ÁN NĂNG LỰC SỐ</h1>
            <p className="text-blue-100 text-sm">Hỗ trợ tích hợp Năng lực số toàn cấp bởi Trần Hoài Thanh</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors text-blue-100 hover:text-white"
            title="Cài đặt API Key"
          >
            <Settings size={20} />
          </button>
          <Link
            to="/dashboard"
            className="p-2 hover:bg-blue-700 rounded-full transition-colors text-blue-100 hover:text-white flex items-center space-x-1 mr-2"
            title="Dashboard"
          >
            <User size={20} />
            <span className="hidden md:inline text-sm font-medium">Dashboard</span>
          </Link>
          <div className="hidden md:flex items-center space-x-2 text-blue-100 bg-blue-700 px-4 py-2 rounded-full text-sm">
            <BookOpen size={16} />
            <span>Powered by Gemini</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
