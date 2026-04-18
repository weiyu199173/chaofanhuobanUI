import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserService } from '../services/userService';

interface DebugStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

export function DatabaseDebugger({ onClose }: { onClose: () => void }) {
  const [steps, setSteps] = useState<DebugStep[]>([
    { id: 'config', name: '检查配置', status: 'pending' },
    { id: 'auth', name: '检查认证状态', status: 'pending' },
    { id: 'users-table', name: '检查 users 表', status: 'pending' },
    { id: 'user-profile', name: '检查用户资料', status: 'pending' },
    { id: 'insert-test', name: '测试插入数据', status: 'pending' },
    { id: 'update-test', name: '测试更新数据', status: 'pending' },
  ]);

  const [logs, setLogs] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const updateStep = (id: string, status: DebugStep['status'], message?: string, details?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status, message, details } : step
    ));
  };

  const runAllTests = async () => {
    addLog('🧪 开始完整数据库诊断...');
    
    // 重置所有步骤
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined, details: undefined })));

    // 1. 检查配置
    updateStep('config', 'running');
    if (!isSupabaseConfigured) {
      updateStep('config', 'error', '❌ Supabase 未配置');
      addLog('❌ Supabase 未配置');
      return;
    }
    updateStep('config', 'success', '✅ Supabase 已配置');
    addLog('✅ Supabase 配置检查通过');

    // 2. 检查认证状态
    updateStep('auth', 'running');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        setCurrentUserId(user.id);
        updateStep('auth', 'success', `✅ 已登录: ${user.email}`);
        addLog(`✅ 用户已登录: ${user.id}`);
      } else {
        updateStep('auth', 'error', '❌ 未登录');
        addLog('❌ 用户未登录');
        return;
      }
    } catch (error: any) {
      updateStep('auth', 'error', `❌ ${error.message}`, error);
      addLog(`❌ 认证失败: ${error.message}`);
      return;
    }

    // 3. 检查 users 表
    updateStep('users-table', 'running');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id');
      
      if (error) throw error;
      
      const count = data ? data.length : 0;
      updateStep('users-table', 'success', `✅ users 表存在，当前记录数: ${count}`);
      addLog(`✅ users 表正常，有 ${count} 条记录`);
    } catch (error: any) {
      updateStep('users-table', 'error', `❌ ${error.message}`, error);
      addLog(`❌ users 表错误: ${error.message}`);
    }

    // 4. 检查用户资料
    updateStep('user-profile', 'running');
    if (currentUserId) {
      try {
        const profile = await UserService.getUserProfile(currentUserId);
        if (profile) {
          updateStep('user-profile', 'success', '✅ 用户资料存在', profile);
          addLog(`✅ 用户资料已找到: ${profile.nickname}`);
        } else {
          updateStep('user-profile', 'error', '❌ 用户资料不存在');
          addLog('❌ 用户资料不存在于数据库中');
        }
      } catch (error: any) {
        updateStep('user-profile', 'error', `❌ ${error.message}`, error);
        addLog(`❌ 获取用户资料失败: ${error.message}`);
      }
    }

    // 5. 测试插入/更新
    updateStep('insert-test', 'running');
    if (currentUserId) {
      try {
        const testData = {
          nickname: '测试用户_' + Date.now(),
          bio: '这是一条测试数据',
          fullBio: '完整的测试个人简介',
        };
        
        addLog(`📝 正在保存测试数据: ${JSON.stringify(testData)}`);
        const success = await UserService.updateUserProfile(currentUserId, testData);
        
        if (success) {
          updateStep('insert-test', 'success', '✅ 数据保存成功！');
          addLog('✅ 数据库写入测试成功！');
          
          // 6. 验证更新
          updateStep('update-test', 'running');
          const verifyProfile = await UserService.getUserProfile(currentUserId);
          if (verifyProfile && verifyProfile.nickname === testData.nickname) {
            updateStep('update-test', 'success', '✅ 数据读取验证通过！');
            addLog('✅ 数据读取验证通过！');
            addLog(`👤 读取到用户: ${verifyProfile.nickname}`);
          } else {
            updateStep('update-test', 'error', '❌ 数据验证失败');
            addLog('❌ 数据验证失败');
            addLog(`📊 verifyProfile: ${JSON.stringify(verifyProfile)}`);
          }
        } else {
          updateStep('insert-test', 'error', '❌ 数据保存失败 - 请检查浏览器控制台的详细错误');
          updateStep('update-test', 'error', '跳过');
          addLog('❌ 数据库写入失败');
        }
      } catch (error: any) {
        updateStep('insert-test', 'error', `❌ ${error.message}`, error);
        updateStep('update-test', 'error', '跳过');
        addLog(`❌ 测试失败: ${error.message}`);
        console.error('❌ 完整错误:', error);
      }
    }

    addLog('🎉 诊断完成！');
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-outline flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-on-surface">🔧 数据库诊断工具</h2>
            <p className="text-sm text-on-surface-variant mt-1">自动检测和诊断 Supabase 数据库问题</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 测试步骤 */}
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {steps.map(step => (
            <div key={step.id} className="flex items-start gap-3 p-3 bg-surface-variant/50 rounded-lg">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${step.status === 'success' ? 'bg-green-500 text-white' : ''}
                ${step.status === 'error' ? 'bg-red-500 text-white' : ''}
                ${step.status === 'running' ? 'bg-yellow-500 text-white animate-pulse' : ''}
                ${step.status === 'pending' ? 'bg-gray-300' : ''}
              `}>
                {step.status === 'success' ? '✓' : step.status === 'error' ? '✗' : step.status === 'running' ? '…' : '○'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface">{step.name}</p>
                {step.message && (
                  <p className={`text-sm mt-1 ${step.status === 'error' ? 'text-red-500' : 'text-on-surface-variant'}`}>
                    {step.message}
                  </p>
                )}
                {step.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-primary cursor-pointer">查看详细信息</summary>
                    <pre className="text-xs bg-surface p-2 rounded mt-1 overflow-x-auto text-on-surface-variant">
                      {JSON.stringify(step.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 日志 */}
        <div className="border-t border-outline">
          <div className="p-4 bg-black/20">
            <h3 className="text-sm font-bold text-on-surface-variant mb-2">📋 日志</h3>
            <div className="h-32 overflow-y-auto bg-black/30 rounded p-3 text-xs font-mono">
              {logs.map((log, i) => (
                <div key={i} className="text-on-surface-variant">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="p-6 border-t border-outline flex gap-3">
          <button
            onClick={runAllTests}
            className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            🔄 重新运行诊断
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-surface-variant text-on-surface-variant rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
