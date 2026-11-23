import React from 'react';

/**
 * DRIVAIR Pill Button Component (readme1.md 4.1)
 * Minimum touch target 44px, scale transitions, loading spinner.
 */
export default function Button({
  children,
  variant = 'primary', // 'primary' | 'dark' | 'secondary' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon = null,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-2 focus-visible:outline-offset-2';

  const sizeClasses = {
    sm: 'min-h-[38px] px-4 py-1.5 text-xs gap-1.5',
    md: 'min-h-[44px] px-6 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'min-h-[50px] px-8 py-3 text-sm sm:text-base gap-2.5',
  };

  const variantClasses = {
    // Cyber Yellow background, Deep Onyx text
    primary:
      'bg-[#FDE047] text-[#0A0A0A] hover:bg-[#FACC15] hover:scale-[1.02] active:scale-[0.97] shadow-sm shadow-yellow-500/10 focus-visible:outline-[#FDE047]',
    // Dark Charcoal surface
    dark:
      'bg-[#202020] text-white hover:bg-[#262626] border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-white/50',
    // Secondary with subtle border
    secondary:
      'bg-[#171717] text-white border border-white/15 hover:bg-[#202020] hover:border-white/25 active:scale-[0.97]',
    // Danger Red
    danger:
      'bg-[#EF4444] text-white hover:bg-red-600 active:scale-[0.97] focus-visible:outline-red-500',
    // Ghost
    ghost:
      'bg-transparent text-[#B8B8B8] hover:text-white hover:bg-white/5 active:scale-[0.97]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={16} className="shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
