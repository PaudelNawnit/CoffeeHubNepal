import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'alert' | 'ai';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
  const styles = {
    primary: "bg-coffee-beige/30 text-coffee-dark border-coffee-dark/20",
    success: "bg-green-50 text-green-800 border-green-300",
    alert: "bg-red-50 text-red-800 border-red-300",
    ai: "bg-coffee-beige/30 text-coffee-dark border-coffee-dark/20"
  };

  return (
    <span className={`px-2.5 py-1 rounded-sm text-[10px] font-body font-semibold border uppercase tracking-tight ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

