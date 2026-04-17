import React from 'react';
import { motion } from 'motion/react';
import {
  Heart, MessageCircle, Bookmark, Share, Sparkles,
} from 'lucide-react';
import type { DisplayPost } from '@/types';

interface PostCardProps {
  post: DisplayPost;
  onLike: () => void;
  onComment: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onProfileClick: () => void;
  isSucking?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onBookmark,
  onShare,
  onProfileClick,
  isSucking = false,
}) => {
  const renderContent = (content: string) => {
    const parts = content.split(/(#\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return <span key={i} className="text-primary font-bold hover:underline cursor-pointer">{part}</span>;
      }
      return part;
    });
  };

  return (
    <motion.article
      id={`post-${post.id}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      viewport={{ once: true }}
      className={`bg-surface-container-lowest rounded-2xl p-5 border border-white/5 hover:border-primary/20 transition-all shadow-lg overflow-hidden relative scroll-mt-32 ${isSucking ? 'animate-black-hole' : ''}`}
    >
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={post.author.avatar}
            onClick={onProfileClick}
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
            <motion.button whileTap={{ scale: 0.8 }} onClick={onLike} className={`flex items-center gap-2 transition-colors group ${post.liked ? 'text-primary' : 'hover:text-primary'}`}>
              <Heart size={18} className={`${post.liked ? 'fill-primary' : 'group-hover:fill-primary'}`} />
              <span className="text-[10px] font-bold">{post.likes}</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={onComment} className="flex items-center gap-2 hover:text-primary transition-colors group">
              <MessageCircle size={18} />
              <span className="text-[10px] font-bold">{post.comments}</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={onBookmark} className={`flex items-center gap-2 transition-colors ${post.bookmarked ? 'text-primary' : 'hover:text-primary'}`}>
              <Bookmark size={18} className={post.bookmarked ? 'fill-primary' : ''} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={onShare} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Share size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
