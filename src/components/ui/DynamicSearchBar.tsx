import React, { useState, ReactNode, MouseEvent } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DynamicSearchBarProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const DynamicSearchBar: React.FC<DynamicSearchBarProps> = ({
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{
        width: isFocused ? '100%' : '100%',
        boxShadow: isFocused ? '0 0 15px rgba(29, 155, 240, 0.2)' : '0 0 0px rgba(0,0,0,0)',
      }}
      className={`relative flex items-center bg-surface-container-high/40 backdrop-blur-md rounded-2xl border transition-all duration-300 px-4 py-2 ${
        isFocused ? 'border-transparent bg-surface-container-high/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'border-white/5 bg-surface-container-high/20'
      } ${className}`}
    >
      <motion.div
        animate={{
          rotate: isFocused ? 90 : 0,
          scale: isFocused ? 1.1 : 1,
          color: isFocused ? 'var(--color-primary)' : 'var(--color-outline)',
        }}
        className="mr-3"
      >
        <Search size={18} />
      </motion.div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none focus:ring-0 p-0 text-sm text-on-surface w-full placeholder:text-outline/40 transition-all font-medium"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            onClick={() => onChange('')}
            className="ml-2 text-outline hover:text-primary transition-colors p-1"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{
          scaleX: isFocused ? 1 : 0,
          opacity: isFocused ? 1 : 0,
        }}
        className="absolute bottom-0 left-4 right-4 h-[1px] bg-linear-to-r from-transparent via-primary/50 to-transparent origin-center"
      />
    </motion.div>
  );
};

export default DynamicSearchBar;
