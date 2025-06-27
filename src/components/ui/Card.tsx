import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-sm ${hover ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;