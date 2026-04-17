import React, { useState, ReactNode, MouseEvent } from 'react';

interface LaserButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

const LaserButton: React.FC<LaserButtonProps> = ({ children, onClick, className = "", active = false, disabled = false }) => {
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

export default LaserButton;
