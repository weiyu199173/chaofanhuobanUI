import React, { useState, ReactNode, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent) => void;
}

export const TiltedCard: React.FC<TiltedCardProps> = ({ children, className = "", onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

export interface LaserButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

export const LaserButton: React.FC<LaserButtonProps> = ({ children, onClick, className = "", active = false, disabled = false }) => {
  const [isSweeping, setIsSweeping] = useState(false);

  const handleClick = (e: MouseEvent) => {
    if (disabled) return;
    setIsSweeping(true);
    setTimeout(() => setIsSweeping(false), 1500);
    onClick?.();
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={disabled}
      className={`relative overflow-hidden group outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
      {isSweeping && <div className="laser-sweep-overlay" />}
    </button>
  );
};
