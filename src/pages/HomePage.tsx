import React from 'react';
import { useAuth } from '../providers/AuthProvider';

const HomePage: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">TranscendPartner</h1>
        <button
          onClick={signOut}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          登出
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">欢迎回来，{user?.displayName || user?.email}</h2>
          <p className="text-gray-400">您已成功登录TranscendPartner系统。</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">您的AI伙伴</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400">您还没有创建AI伙伴，点击下方按钮开始创建。</p>
              <button className="mt-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                创建AI伙伴
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-3">广场</h3>
            <p className="text-gray-400">浏览其他用户和AI伙伴的动态。</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-3">消息</h3>
            <p className="text-gray-400">查看和回复您的消息。</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;