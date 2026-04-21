import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit, Settings, AlertTriangle } from 'lucide-react';
import { LaserButton, TiltedCard } from '../Common';
import { DigitalTwin, Post } from '../../types';
import { DigitalTwinService } from '../../services/digitalTwinService';

interface DigitalTwinDetailScreenProps {
  twinId: string;
  onBack: () => void;
  onEdit: () => void;
}

export const DigitalTwinDetailScreen = ({ twinId, onBack, onEdit }: DigitalTwinDetailScreenProps) => {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [twinPosts, setTwinPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadTwinData();
  }, [twinId]);

  const loadTwinData = async () => {
    setLoading(true);
    try {
      const twinData = await DigitalTwinService.getTwinById(twinId);
      setTwin(twinData);
      // TODO: Fetch posts by this twin in future
      setTwinPosts([]);
    } catch (error) {
      console.error('加载孪生数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">未找到该数字孪生</p>
          <LaserButton onClick={onBack} className="px-6 py-3 bg-primary text-on-primary rounded-full">
            返回
          </LaserButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header Section with Cover */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-container/10" />
        <div className="absolute -bottom-0 left-0 right-0 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end gap-6">
              <TiltedCard className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-container rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container bg-surface-container shadow-2xl">
                  <img src={twin.avatar} alt={twin.name} className="w-full h-full object-cover" />
                </div>
              </TiltedCard>
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-headline font-bold">{twin.name}</h2>
                    <p className="text-outline text-sm max-w-lg leading-relaxed mt-2">{twin.bio}</p>
                  </div>
                  <div className="flex gap-3">
                    <LaserButton onClick={onEdit} className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all">
                      <Edit size={20} />
                    </LaserButton>
                    <LaserButton className="p-3 bg-surface-container text-outline rounded-full hover:bg-surface-container-hig transition-all">
                      <Settings size={20} />
                    </LaserButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back Button */}
        <LaserButton 
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-background/80 backdrop-blur-xl rounded-full text-on-surface shadow-lg hover:bg-background/90 transition-all"
        >
          <ArrowLeft size={20} />
        </LaserButton>
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-32">
        {/* Security Warning */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-orange-900 mb-2">⚠️ AI 操作身份</h3>
              <p className="text-orange-800 text-sm leading-relaxed">
                使用此数字孪生的令牌进行的操作将以该身份执行，所有内容将关联到此数字孪生而非您的账户。
              </p>
            </div>
          </div>
        </motion.div>

        {/* Personality Signature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-surface-container/40 rounded-xl p-6 border border-white/5"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            个性签名
          </h3>
          <div className="font-mono text-sm text-on-surface-variant whitespace-pre-wrap bg-background/50 rounded-lg p-4 border border-white/5">
            {twin.personality_signature || '暂无个性签名'}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <section className="mb-8">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            活动轨迹
          </h3>
          
          {twinPosts.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant bg-surface-container/30 rounded-xl border border-white/5">
              <p className="text-sm">暂无活动记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Posts would go here */}
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container/40 rounded-xl p-6 border border-white/5 text-center">
            <div className="text-3xl font-headline font-bold text-primary">0</div>
            <div className="text-sm text-on-surface-variant mt-1">发帖数</div>
          </div>
          <div className="bg-surface-container/40 rounded-xl p-6 border border-white/5 text-center">
            <div className="text-3xl font-headline font-bold text-primary">0</div>
            <div className="text-sm text-on-surface-variant mt-1">消息数</div>
          </div>
          <div className="bg-surface-container/40 rounded-xl p-6 border border-white/5 text-center">
            <div className="text-xl font-headline font-bold text-on-surface">
              {new Date(twin.created_at).toLocaleDateString('zh-CN')}
            </div>
            <div className="text-sm text-on-surface-variant mt-1">创建于</div>
          </div>
        </div>
      </main>
    </div>
  );
};
