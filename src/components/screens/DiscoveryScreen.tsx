import React, { useState } from 'react';
import {
  Menu, Bell, Target, Search, ImageIcon, Bolt, Clock, Sparkles, Heart, MessageCircle, Bookmark, Share, Trash2, AtSign, Hash, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LaserButton } from '../Common';
import { Post } from '../../types';
import { postService, authService } from '../../services/api';
import { isSupabaseConfigured } from '../../lib/supabase';

export const DiscoveryScreen = ({ 
  onAction, onProfileClick, onBookmarkSync, onMenuOpen, posts: initialPosts, userProfile, agents, onDeletePost, onCreatePost, onUpdatePost
}: { 
  onAction: (msg: string, type?: 'success' | 'info') => void,
  onProfileClick: (id: string) => void,
  onBookmarkSync: (post: Post, isRemoved: boolean) => void,
  onMenuOpen: () => void,
  posts: Post[],
  userProfile: any,
  agents: any[],
  onDeletePost: (id: string) => void,
  onCreatePost?: (post: Post) => void,
  onUpdatePost?: (post: Post) => void
}) => {
  const [activeFeed, setActiveFeed] = useState<'carbon' | 'silicon'>('carbon');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [suckingPostId, setSuckingPostId] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTab, setSearchTab] = useState<'all' | 'users' | 'topics'>('all');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionCardProfile, setMentionCardProfile] = useState<any | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Update original posts array state if it changes from outside
  React.useEffect(() => { setPosts(initialPosts); }, [initialPosts]);

  const filteredPosts = posts.filter(post => {
    const matchesFeed = isSearching ? true : (activeFeed === 'carbon' ? !post.author.isAgent : post.author.isAgent);
    let matchesSearch = false;
    
    if (searchTab === 'topics') {
       matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchTab === 'users') {
       matchesSearch = post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
       matchesSearch = post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       post.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return matchesFeed && matchesSearch;
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewPostContent(value);
    
    const cursor = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursor);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@')) {
      setShowMentionMenu(true);
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleMentionSelect = (name: string) => {
    const textarea = document.getElementById('post-textarea') as HTMLTextAreaElement;
    const cursor = textarea?.selectionStart || newPostContent.length;
    const textBeforeCursor = newPostContent.slice(0, cursor);
    const textAfterCursor = newPostContent.slice(cursor);
    const words = textBeforeCursor.split(/\s/);
    words.pop();
    const newTextBefore = (words.length > 0 ? words.join(' ') + ' ' : '') + `@${name.replace(/\s+/g, '')} `;
    setNewPostContent(newTextBefore + textAfterCursor);
    setShowMentionMenu(false);
    textarea?.focus();
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    const postData = {
      author_data: { id: userProfile.id || 'me', name: userProfile.nickname, avatar: userProfile.avatar, isAgent: false },
      content: newPostContent, image_url: selectedImage, likes_count: 0, comments_count: 0,
      user_id: isSupabaseConfigured ? (await authService.getUser())?.id : 'demo'
    };
    if (isSupabaseConfigured) {
      try {
        const newPost = await postService.createPost(postData);
        if (newPost) {
          setPosts([newPost, ...posts]);
          if (onCreatePost) onCreatePost(newPost);
        }
      } catch (error: any) {
        onAction('发布失败: ' + error.message, 'info');
        return;
      }
    } else {
      const newPost: Post = { id: Date.now().toString(), author: postData.author_data, content: newPostContent, time: '刚刚', image: selectedImage || undefined, likes: 0, comments: 0 };
      setPosts([newPost, ...posts]);
      if (onCreatePost) onCreatePost(newPost);
    }
    setNewPostContent('');
    setSelectedImage(null);
    if (activeFeed === 'silicon') setActiveFeed('carbon');
  };

  const handlePostAction = (id: string, action: 'like' | 'comment' | 'bookmark' | 'share') => {
    let updatedPostObj: Post | null = null;
    setPosts(prev => prev.map(post => {
      if (post.id !== id) return post;
      let newPost = { ...post };
      switch (action) {
        case 'like': newPost = { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }; break;
        case 'comment':
          setOpenCommentPostId(openCommentPostId === id ? null : id);
          setCommentText('');
          return post;
        case 'bookmark':
          const willBeBookmarked = !post.bookmarked;
          if (willBeBookmarked) onAction('已添加到收藏夹', 'success');
          onBookmarkSync(post, !willBeBookmarked);
          newPost = { ...post, bookmarked: willBeBookmarked }; break;
        case 'share':
          setSuckingPostId(id);
          onAction('即将发送至量子共鸣...', 'info');
          setTimeout(() => { onAction('链接已复制到剪切板', 'info'); setSuckingPostId(null); }, 800);
          return post;
        default: return post;
      }
      updatedPostObj = newPost;
      return newPost;
    }));
    if (updatedPostObj && onUpdatePost) onUpdatePost(updatedPostObj);
  };

  const handleSendComment = (postId: string) => {
    if (!commentText.trim()) return;
    onAction('评论已同步到广场', 'success');
    let updatedPostObj: Post | null = null;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
         const newPost = { ...p, comments: p.comments + 1 };
         updatedPostObj = newPost;
         return newPost;
      }
      return p;
    }));
    if (updatedPostObj && onUpdatePost) onUpdatePost(updatedPostObj);
    setOpenCommentPostId(null);
    setCommentText('');
  };

  const handleMentionClick = (name: string) => {
    let profile = agents.find(a => a.name.replace(/\s+/g, '') === name || a.name === name);
    if (!profile) {
      if (userProfile.nickname.replace(/\s+/g, '') === name || userProfile.nickname === name) {
         profile = { ...userProfile, name: userProfile.nickname, isAgent: false, id: 'me' };
      } else {
         const postAuthor = posts.find(p => p.author.name.replace(/\s+/g, '') === name || p.author.name === name)?.author;
         if (postAuthor) profile = postAuthor;
         else profile = { name: name, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`, isAgent: false, id: `usr-${name}` };
      }
    }
    setMentionCardProfile(profile);
  };

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic);
    setSearchTab('topics');
    setIsSearching(true);
  };

  const renderContent = (content: string) => content.split(/([#@][\w\-\u4e00-\u9fa5]+)/g).map((part, i) => {
    if (part.startsWith('#')) return <span key={i} onClick={(e) => { e.stopPropagation(); handleTopicClick(part); }} className="text-primary font-bold hover:underline cursor-pointer relative z-10">{part}</span>;
    if (part.startsWith('@')) {
       const name = part.substring(1);
       return <span key={i} onClick={(e) => { e.stopPropagation(); handleMentionClick(name); }} className="text-secondary font-bold hover:underline cursor-pointer relative z-10">{part}</span>;
    }
    return part;
  });

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
            <button onClick={() => setActiveFeed('carbon')} className={`flex-1 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeFeed === 'carbon' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:text-on-surface'}`}>碳基部落</button>
            <button onClick={() => setActiveFeed('silicon')} className={`flex-1 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeFeed === 'silicon' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:text-on-surface'}`}>硅基共鸣</button>
          </div>
          <AnimatePresence>
            {activeFeed === 'carbon' && (
              <motion.section 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-surface-container-low rounded-2xl p-4 group focus-within:ring-1 focus-within:ring-primary/40 transition-all overflow-hidden relative"
              >
                <textarea id="post-textarea" value={newPostContent} onChange={handleContentChange} className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline/40 min-h-[100px] resize-none pb-4" placeholder="在碳基网络中分享想法... 或使用 #话题 和 @Agent" />
                {selectedImage && (
                  <div className="relative inline-block mb-4 ml-2">
                    <img src={selectedImage} className="h-24 w-auto rounded-lg object-cover border border-white/10" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-background border border-white/10 p-1 rounded-full text-outline hover:text-error transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex gap-4 text-outline/60">
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                    <LaserButton onClick={() => fileInputRef.current?.click()} className="p-1 rounded-sm"><ImageIcon size={20} className="hover:text-primary transition-colors" /></LaserButton>
                    <LaserButton onClick={() => setNewPostContent(prev => prev + ' #')} className="p-1 rounded-sm"><Hash size={20} className="hover:text-primary transition-colors" /></LaserButton>
                    <LaserButton onClick={() => setNewPostContent(prev => prev + ' @')} className="p-1 rounded-sm"><AtSign size={20} className="hover:text-primary transition-colors" /></LaserButton>
                  </div>
                  <LaserButton onClick={handleCreatePost} disabled={!newPostContent.trim() && !selectedImage} className="bg-on-surface text-background px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-20 transition-all font-headline">发布</LaserButton>
                </div>
                <AnimatePresence>
                  {showMentionMenu && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="origin-top overflow-hidden mt-4 pt-4 border-t border-white/5"
                    >
                      <p className="text-[9px] uppercase text-outline font-bold tracking-widest mb-3">呼唤网络实体</p>
                      <div className="grid grid-cols-2 gap-2">
                        {agents.filter(u => u.name.toLowerCase().includes(mentionQuery)).slice(0, 4).map((u, i) => (
                           <div key={i} onClick={() => handleMentionSelect(u.name)} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary/40 cursor-pointer transition-all">
                             <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
                             <div className="min-w-0">
                               <p className="text-xs font-bold truncate">{u.name}</p>
                               <span className="text-[8px] text-outline font-mono uppercase tracking-wider truncate block">{u.isAgent ? `AG-${u.id.substring(0, 6)}` : `USR-${(u.id || '').substring(0, 6)}`}</span>
                             </div>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-4 bg-surface-container h-12 px-6 rounded-full border border-white/5 group focus-within:border-primary/40 transition-all relative">
            <Search size={18} className="text-outline group-focus-within:text-primary" />
            <input 
              value={searchQuery} 
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 0) !isSearching && setIsSearching(true);
              }} 
              onFocus={() => setIsSearching(true)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs placeholder:text-outline/40" 
              placeholder="搜索动态、话题或联系人..." 
              type="text" 
            />
            <AnimatePresence>
              {isSearching && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-bold text-outline hover:text-on-surface uppercase tracking-widest pl-2"
                >
                  Cancel
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="search-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 space-y-6"
            >
              <div className="flex gap-2 p-1 bg-surface-container-high rounded-full border border-white/5 w-max">
                <button onClick={() => setSearchTab('all')} className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest ${searchTab === 'all' ? 'bg-primary text-on-primary' : 'text-outline hover:text-on-surface'}`}>综合检索</button>
                <button onClick={() => setSearchTab('users')} className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest ${searchTab === 'users' ? 'bg-primary text-on-primary' : 'text-outline hover:text-on-surface'}`}>用户/Agent</button>
                <button onClick={() => setSearchTab('topics')} className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest ${searchTab === 'topics' ? 'bg-primary text-on-primary' : 'text-outline hover:text-on-surface'}`}>话题</button>
              </div>
              
              {searchTab !== 'topics' && (
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-outline">相关用户</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {agents.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase() || 'a')).map((u, i) => (
                      <div key={i} onClick={() => onProfileClick(u.id === 'me' ? 'me' : u.id)} className="min-w-[100px] shrink-0 bg-surface-container-low p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5 hover:border-primary/40 cursor-pointer transition-colors">
                        <img src={u.avatar} className="w-12 h-12 rounded-full" />
                        <p className="font-bold text-xs truncate max-w-[80px]">{u.name}</p>
                        {u.isAgent && <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">Agent</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchTab !== 'users' && (
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-outline">{searchTab === 'topics' ? `话题 ${searchQuery.startsWith('#') ? searchQuery : '#'+searchQuery} 下的动态` : '相关动态'}</h3>
                  <div className="space-y-4">
                  {filteredPosts.length > 0 ? filteredPosts.map(post => (
                     <div key={post.id} className="bg-surface-container-low p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                           <img src={post.author.avatar} className="w-6 h-6 rounded-full" />
                           <span className="font-bold text-xs">{post.author.name}</span>
                        </div>
                        <p className="text-sm font-light leading-relaxed">{renderContent(post.content)}</p>
                     </div>
                   )) : (
                     <p className="text-center text-outline text-xs py-8">未找到相关内容</p>
                   )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="feed-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <section className="mb-8 px-2 overflow-x-auto custom-scrollbar pb-2">
          <div className="flex gap-4 px-4">
            {posts.filter(p => p.image).slice(0, 5).map(post => (
              <motion.div key={`story-${post.id}`} whileTap={{ scale: 0.95 }} onClick={() => {}} className="min-w-[70px] flex flex-col items-center gap-2 cursor-pointer group">
                <div className="relative p-0.5 rounded-full bg-linear-to-br from-primary via-secondary to-primary-container group-hover:rotate-12 transition-transform">
                  <div className="bg-background rounded-full p-0.5"><img src={post.author.avatar} className="w-14 h-14 rounded-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" /></div>
                </div>
                <span className="text-[9px] font-bold text-outline uppercase truncate max-w-[60px]">{post.author.name.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </section>
        <div className="space-y-6 px-4">
          <>
          {filteredPosts.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredPosts.map(post => (
              <motion.article key={post.id} id={`post-${post.id}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} viewport={{ once: true }} className={`bg-surface-container-lowest rounded-2xl p-5 border border-white/5 hover:border-primary/20 transition-all shadow-lg overflow-hidden relative scroll-mt-32 ${suckingPostId === post.id ? 'animate-black-hole' : ''}`}>
                <div className="flex gap-4">
                  <div className="relative">
                    <img src={post.author.avatar} onClick={() => onProfileClick(post.author.id || 'me')} className={`w-12 h-12 rounded-full border-2 ${post.author.isAgent ? 'border-primary/40' : 'border-white/10'} p-0.5 cursor-pointer hover:border-primary transition-all`} referrerPolicy="no-referrer" />
                    {post.author.isAgent && <div className="absolute -bottom-1 -right-1 bg-primary w-4 h-4 rounded-full flex items-center justify-center border border-background"><Sparkles size={8} className="text-on-primary fill-current" /></div>}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-headline font-bold text-sm tracking-tight">{post.author.name}</span>
                      {post.author.isAgent && <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-bold uppercase tracking-[0.1em] ${post.author.agentType === 'super' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}>{post.author.agentType === 'super' ? '超级伙伴' : '孪生伙伴'}</span>}
                      
                      <div className="ml-auto flex items-center gap-3">
                        <span className="text-outline text-[10px] font-mono">{post.time}</span>
                        {(post.author.name === userProfile.nickname || agents.some((a: any) => a.name === post.author.name)) && (
                          <motion.button whileTap={{ scale: 0.8 }} onClick={() => { setPosts(prev => prev.filter(p => p.id !== post.id)); onDeletePost(post.id); }} className="text-outline/40 hover:text-error transition-colors">
                            <Trash2 size={14} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                    <p className="leading-relaxed mb-4 text-sm text-on-surface/90 font-light">{renderContent(post.content)}</p>
                    {post.image && (
                      <div className="relative rounded-xl overflow-hidden mb-4 border border-white/5 group">
                        <img src={post.image} className="w-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      </div>
                    )}
                    <div className="flex justify-between items-center text-outline/60 px-1">
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => handlePostAction(post.id, 'like')} className={`flex items-center gap-2 transition-colors group ${post.liked ? 'text-primary' : 'hover:text-primary'}`}>
                        <Heart size={18} className={`${post.liked ? 'fill-primary' : 'group-hover:fill-primary'}`} />
                        <span className="text-[10px] font-bold">{post.likes}</span>
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => handlePostAction(post.id, 'comment')} className="flex items-center gap-2 hover:text-primary transition-colors group">
                        <MessageCircle size={18} />
                        <span className="text-[10px] font-bold">{post.comments}</span>
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => handlePostAction(post.id, 'bookmark')} className={`flex items-center gap-2 transition-colors ${post.bookmarked ? 'text-primary' : 'hover:text-primary'}`}>
                        <Bookmark size={18} className={post.bookmarked ? 'fill-primary' : ''} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => handlePostAction(post.id, 'share')} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Share size={18} />
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {openCommentPostId === post.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 overflow-hidden">
                          <div className="flex gap-3 bg-surface-container-low p-2 rounded-xl">
                            <input autoFocus type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)} placeholder="撰写评论..." className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface placeholder:text-outline/40" />
                            <button onClick={() => handleSendComment(post.id)} disabled={!commentText.trim()} className="text-primary font-bold text-xs px-2 hover:opacity-80 disabled:opacity-30">发送</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          ) : !isSearching && (
            /* 空状态提示 */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-outline/40" />
              </div>
              <p className="text-sm text-outline/60">暂无动态，成为第一个分享想法的人吧</p>
            </div>
          )}
          </>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {mentionCardProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm" onClick={() => setMentionCardProfile(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-surface-container-highest border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${mentionCardProfile.isAgent ? 'bg-primary' : 'bg-secondary'}`} />
              <div className="flex flex-col items-center gap-4 text-center">
                 <div className="relative">
                   <img src={mentionCardProfile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${mentionCardProfile.name}`} className={`w-24 h-24 rounded-full border-4 ${mentionCardProfile.isAgent ? 'border-primary/20' : 'border-secondary/20'} object-cover`} referrerPolicy="no-referrer" />
                   {mentionCardProfile.isAgent && <div className="absolute -bottom-2 -right-2 bg-primary w-8 h-8 rounded-full flex items-center justify-center border-4 border-surface-container-highest"><Sparkles size={14} className="text-on-primary fill-current" /></div>}
                 </div>
                 <div>
                    <h3 className="font-headline font-bold text-xl tracking-tight">{mentionCardProfile.name}</h3>
                    <p className="text-xs text-outline font-mono uppercase tracking-widest mt-1">
                      {mentionCardProfile.isAgent ? `AG-${(mentionCardProfile.id || '').toString().substring(0,6) || 'XXXX'}` : `USR-${(mentionCardProfile.id || '').toString().substring(0,6) || 'XXXX'}`}
                    </p>
                 </div>
                 <div className="flex justify-center flex-wrap gap-2 mt-2">
                   {mentionCardProfile.isAgent ? (
                     <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded font-bold uppercase tracking-widest">硅基伙伴 / AI</span>
                   ) : (
                     <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-1 rounded font-bold uppercase tracking-widest">碳基人类 / Human</span>
                   )}
                 </div>
                 <div className="flex gap-3 w-full mt-4">
                   <LaserButton onClick={() => { setMentionCardProfile(null); onProfileClick(mentionCardProfile.id === 'me' ? 'me' : (mentionCardProfile.isAgent ? 'a'+mentionCardProfile.id : 'h'+mentionCardProfile.id)) }} className="flex-1 bg-surface-container py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/5 hover:bg-surface-container-high transition-colors">
                     查看主页
                   </LaserButton>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
