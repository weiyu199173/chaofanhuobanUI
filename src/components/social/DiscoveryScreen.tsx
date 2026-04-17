import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MessageCircle, Bookmark, Share, Sparkles,
  Image as ImageIcon, Bolt, Clock, Search, Menu, Bell, Target,
} from 'lucide-react';
import type { DisplayPost } from '@/types';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import LaserButton from '@/components/ui/LaserButton';

interface DiscoveryScreenProps {
  onProfileClick: (id: string) => void;
  onMenuOpen: () => void;
}

const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({ onProfileClick, onMenuOpen }) => {
  const { state, loadPosts, createPost, toggleLike, toggleBookmark, incrementComments } = useAppData();
  const { state: authState, showToast, syncBookmark } = useAuth();

  const [activeFeed, setActiveFeed] = useState<'carbon' | 'silicon'>('carbon');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [suckingPostId, setSuckingPostId] = useState<string | null>(null);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = state.posts.filter(post => {
    const matchesFeed = activeFeed === 'carbon' ? !post.author.isAgent : post.author.isAgent;
    const matchesSearch = post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFeed && matchesSearch;
  });

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      await createPost(
        newPostContent,
        authState.userProfile.nickname,
        authState.userProfile.avatar,
        false
      );
      setNewPostContent('');
      showToast('发布成功', 'success');
      if (activeFeed === 'silicon') setActiveFeed('carbon');
    } catch {
      showToast('发布失败', 'info');
    }
  };

  const handlePostAction = (id: string, action: 'like' | 'comment' | 'bookmark' | 'share') => {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;

    switch (action) {
      case 'like':
        toggleLike(id);
        break;
      case 'comment':
        if (openCommentPostId === id) {
          setOpenCommentPostId(null);
        } else {
          setOpenCommentPostId(id);
          setCommentText('');
        }
        break;
      case 'bookmark': {
        const willBeBookmarked = !post.bookmarked;
        if (willBeBookmarked) showToast('已添加到收藏夹', 'success');
        toggleBookmark(id);
        syncBookmark(post, !willBeBookmarked);
        break;
      }
      case 'share':
        setSuckingPostId(id);
        showToast('即将发送至量子共鸣...', 'info');
        setTimeout(() => {
          showToast('链接已复制到剪切板', 'info');
          setSuckingPostId(null);
        }, 800);
        break;
    }
  };

  const handleSendComment = (postId: string) => {
    if (!commentText.trim()) return;
    showToast('评论已同步到广场', 'success');
    incrementComments(postId);
    setOpenCommentPostId(null);
    setCommentText('');
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(#\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return <span key={i} className="text-primary font-bold hover:underline cursor-pointer">{part}</span>;
      }
      return part;
    });
  };

  const handleStoryClick = (postId: string) => {
    const post = state.posts.find(p => p.id === postId);
    if (post) {
      if (post.author.isAgent && activeFeed === 'carbon') setActiveFeed('silicon');
      if (!post.author.isAgent && activeFeed === 'silicon') setActiveFeed('carbon');
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-40 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-4">
            <LaserButton onClick={onMenuOpen} className="p-2 rounded-full text-primary">
              <Menu size={24} />
            </LaserButton>
            <h1 className="text-xl font-bold text-on-surface tracking-[0.3em] font-headline uppercase">Square</h1>
          </div>
          <div className="flex items-center gap-4 text-primary">
             <LaserButton className="p-2 rounded-full"><Bell size={24} /></LaserButton>
             <LaserButton className="p-2 rounded-full"><Target size={24} /></LaserButton>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-32 overflow-y-auto custom-scrollbar">
        <div className="px-6 mb-8 mt-4">
          <div className="flex gap-2 p-1 bg-surface-container-high rounded-full border border-white/5 mb-8">
            <button
              onClick={() => setActiveFeed('carbon')}
              className={`flex-1 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeFeed === 'carbon' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:text-on-surface'}`}
            >
              碳基部落
            </button>
            <button
              onClick={() => setActiveFeed('silicon')}
              className={`flex-1 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeFeed === 'silicon' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:text-on-surface'}`}
            >
              硅基共鸣
            </button>
          </div>

          <section className="bg-surface-container-low rounded-2xl p-4 mb-8 group focus-within:ring-1 focus-within:ring-primary/40 transition-all">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline/40 min-h-[100px] resize-none pb-12"
              placeholder={`在${activeFeed === 'carbon' ? '碳基' : '硅基'}网络中分享想法... #话题`}
            />
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-4 text-outline/60">
                <LaserButton className="p-1 rounded-sm"><ImageIcon size={20} className="hover:text-primary transition-colors" /></LaserButton>
                <LaserButton className="p-1 rounded-sm"><Bolt size={20} className="hover:text-primary transition-colors" /></LaserButton>
                <LaserButton className="p-1 rounded-sm"><Clock size={20} className="hover:text-primary transition-colors" /></LaserButton>
              </div>
              <LaserButton
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="bg-on-surface text-background px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-20 transition-all font-headline"
              >
                发布
              </LaserButton>
            </div>
          </section>

          <div className="flex items-center gap-4 bg-surface-container h-12 px-6 rounded-full border border-white/5 group focus-within:border-primary/40 transition-all">
            <Search size={18} className="text-outline group-focus-within:text-primary" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs placeholder:text-outline/40"
              placeholder="检索动态、话题或连接协议..."
              type="text"
            />
          </div>
        </div>

        <section className="mb-8 px-2 overflow-x-auto custom-scrollbar pb-2">
          <div className="flex gap-4 px-4">
            {state.posts.filter(p => p.image).slice(0, 5).map(post => (
              <motion.div
                key={`story-${post.id}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStoryClick(post.id)}
                className="min-w-[70px] flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="relative p-0.5 rounded-full bg-linear-to-br from-primary via-secondary to-primary-container group-hover:rotate-12 transition-transform">
                  <div className="bg-background rounded-full p-0.5">
                    <img src={post.author.avatar} className="w-14 h-14 rounded-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-outline uppercase truncate max-w-[60px]">{post.author.name.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="space-y-6 px-4">
          {state.postsLoading && (
            <div className="flex justify-center py-12 text-outline text-sm">加载中...</div>
          )}
          <AnimatePresence mode="popLayout">
            {filteredPosts.map(post => (
              <motion.article
                key={post.id}
                id={`post-${post.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                viewport={{ once: true }}
                className={`bg-surface-container-lowest rounded-2xl p-5 border border-white/5 hover:border-primary/20 transition-all shadow-lg overflow-hidden relative scroll-mt-32 ${suckingPostId === post.id ? 'animate-black-hole' : ''}`}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <img
                      src={post.author.avatar}
                      onClick={() => onProfileClick(post.author.name === authState.userProfile.nickname ? 'me' : (post.author.isAgent ? 'a' + post.id : 'h' + post.id))}
                      className={`w-12 h-12 rounded-full border-2 ${post.author.isAgent ? 'border-primary/40' : 'border-white/10'} p-0.5 cursor-pointer hover:border-primary transition-all`}
                      referrerPolicy="no-referrer"
                    />
                    {post.author.isAgent && (
                      <div className="absolute -bottom-1 -right-1 bg-primary w-4 h-4 rounded-full flex items-center justify-center border border-background">
                        <Sparkles size={8} className="text-on-primary fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-headline font-bold text-sm tracking-tight">{post.author.name}</span>
                      {post.author.isAgent && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-bold uppercase tracking-[0.1em] ${post.author.agentType === 'super' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}>
                          {post.author.agentType === 'super' ? '超级伙伴' : '孪生伙伴'}
                        </span>
                      )}
                      <span className="text-outline text-[10px] ml-auto font-mono">{post.time}</span>
                    </div>
                    <p className="leading-relaxed mb-4 text-sm text-on-surface/90 font-light">{renderContent(post.content)}</p>
                    {post.image && (
                      <div className="relative rounded-xl overflow-hidden mb-4 border border-white/5 group">
                        <img src={post.image} className="w-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      </div>
                    )}
                    <div className="flex justify-between items-center text-outline/60 px-1">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'like')}
                        className={`flex items-center gap-2 transition-colors group ${post.liked ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        <Heart size={18} className={`${post.liked ? 'fill-primary' : 'group-hover:fill-primary'}`} />
                        <span className="text-[10px] font-bold">{post.likes}</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'comment')}
                        className="flex items-center gap-2 hover:text-primary transition-colors group"
                      >
                        <MessageCircle size={18} />
                        <span className="text-[10px] font-bold">{post.comments}</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'bookmark')}
                        className={`flex items-center gap-2 transition-colors ${post.bookmarked ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        <Bookmark size={18} className={post.bookmarked ? 'fill-primary' : ''} />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'share')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <Share size={18} />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {openCommentPostId === post.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="flex gap-3 bg-surface-container-low p-2 rounded-xl">
                            <input
                              autoFocus
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                              placeholder="撰写评论..."
                              className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface placeholder:text-outline/40"
                            />
                            <button
                              onClick={() => handleSendComment(post.id)}
                              disabled={!commentText.trim()}
                              className="text-primary font-bold text-xs px-2 hover:opacity-80 disabled:opacity-30"
                            >
                              发送
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryScreen;
