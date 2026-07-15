import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus, Key, Upload, FileText, Download, Star, Phone } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans pb-12 flex flex-col items-center">
      <header className="w-full bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-blue-900 hidden sm:block">NLS Assistant</h1>
        </div>
        <div className="flex space-x-3">
          <Link to="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
            Đăng nhập
          </Link>
          <Link to="/register" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-md">
            Đăng ký
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-12 w-full text-center flex-grow flex flex-col justify-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">
          Tích Hợp <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Năng Lực Số</span><br/>Vào Giáo Án Của Bạn
        </h2>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
          Ứng dụng phân tích và tự động chèn nội dung Năng Lực Số (NLS) vào giáo án ở tất cả các cấp học, giữ nguyên định dạng, xuất DOCX/PDF dễ dàng.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 max-w-4xl mx-auto">
          <Link to="/login" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 group">
            <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:bg-blue-600 group-hover:text-white text-blue-600 transition-colors">
              <LogIn size={28} />
            </div>
            <span className="font-semibold text-slate-700">Đăng nhập</span>
          </Link>

          <Link to="/register" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 group">
            <div className="bg-green-100 p-4 rounded-full mb-3 group-hover:bg-green-600 group-hover:text-white text-green-600 transition-colors">
              <UserPlus size={28} />
            </div>
            <span className="font-semibold text-slate-700">Đăng ký</span>
          </Link>

          <Link to="/api-guide" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 group">
            <div className="bg-amber-100 p-4 rounded-full mb-3 group-hover:bg-amber-600 group-hover:text-white text-amber-600 transition-colors">
              <Key size={28} />
            </div>
            <span className="font-semibold text-slate-700">Hướng dẫn API</span>
          </Link>

          <Link to="/app" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 group">
            <div className="bg-purple-100 p-4 rounded-full mb-3 group-hover:bg-purple-600 group-hover:text-white text-purple-600 transition-colors">
              <Sparkles size={28} />
            </div>
            <span className="font-semibold text-slate-700">Tích hợp NLS</span>
          </Link>
        </div>
      </main>

      <footer className="w-full text-center mt-auto bg-white py-6 shadow-inner">
        <div className="max-w-3xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">© 2024 NLS Assistant. Built for Educators.</p>
          <div className="flex items-center space-x-2 text-blue-700 font-medium bg-blue-50 px-4 py-2 rounded-full shadow-sm">
            <Phone size={18} />
            <span>Liên hệ hỗ trợ: Tel/Zalo 0915.213717 (Mr. Thành)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
