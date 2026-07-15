import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Key, CheckCircle, Shield } from 'lucide-react';

const ApiGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10 flex items-center">
        <Link to="/" className="text-slate-500 hover:text-blue-600 mr-4 transition-colors">
          <ArrowLeft />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Hướng dẫn lấy API Key</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Key size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Các bước lấy Google Gemini API Key</h2>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">
            Để sử dụng ứng dụng này, bạn cần có một API Key từ Google. Việc tạo API Key là <strong>hoàn toàn miễn phí</strong>. Hãy làm theo các bước dưới đây:
          </p>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded border border-slate-200">
                <h3 className="font-bold text-slate-800">Truy cập Google AI Studio</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Mở trình duyệt và truy cập vào trang web của Google AI Studio.{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                    Bấm vào đây <ExternalLink size={12} className="ml-1" />
                  </a>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded border border-slate-200">
                <h3 className="font-bold text-slate-800">Đăng nhập tài khoản Google</h3>
                <p className="text-sm text-slate-600 mt-1">Sử dụng tài khoản Gmail của bạn để đăng nhập nếu được yêu cầu.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded border border-slate-200">
                <h3 className="font-bold text-slate-800">Tạo API Key mới</h3>
                <p className="text-sm text-slate-600 mt-1">Bấm vào nút <strong>"Create API key"</strong> màu xanh. Có thể bạn sẽ cần tạo một project mới nếu chưa có.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                4
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded border border-slate-200">
                <h3 className="font-bold text-slate-800">Sao chép API Key</h3>
                <p className="text-sm text-slate-600 mt-1">Khi key được tạo, bấm nút <strong>Copy</strong> để lưu lại chuỗi ký tự (bắt đầu bằng <code className="bg-slate-200 px-1 rounded text-xs">AIza...</code>).</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                5
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded border border-slate-200">
                <h3 className="font-bold text-slate-800">Nhập vào Ứng dụng</h3>
                <p className="text-sm text-slate-600 mt-1">Quay lại trang <strong>Dashboard Cá Nhân</strong> của ứng dụng này, dán API Key vào ô và bấm <strong>Lưu API Key</strong>.</p>
              </div>
            </div>

          </div>

          <div className="mt-12 bg-green-50 p-4 rounded-xl border border-green-200 flex items-start space-x-3">
             <Shield className="text-green-600 shrink-0 mt-0.5" />
             <div>
               <h4 className="font-bold text-green-900">Bảo mật thông tin</h4>
               <p className="text-sm text-green-800 mt-1">API Key của bạn được lưu trữ an toàn trong trình duyệt (Local Storage) trên thiết bị của bạn. Ứng dụng không chia sẻ API Key của bạn ra bên ngoài.</p>
             </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow">
              <CheckCircle size={18} className="mr-2" />
              Đã hiểu, quay lại Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiGuide;
