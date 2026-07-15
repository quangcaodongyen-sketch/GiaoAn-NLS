import React, { useState, useEffect } from 'react';
import { Key, Save, X } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSave: (key: string) => void;
    onClose: () => void;
    initialKey?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, initialKey = '' }) => {
    const [key, setKey] = useState(initialKey);

    useEffect(() => {
        setKey(initialKey);
    }, [initialKey]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Key className="text-white" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Cấu hình API Key</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 mb-6 text-sm">
                        Vui lòng nhập Gemini API Key của bạn để sử dụng ứng dụng.
                        Key sẽ được lưu trên trình duyệt của bạn (localStorage).
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={!key.trim()}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                <span>Lưu cấu hình</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Chưa có key? Lấy mã Gemini API tại đây
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
