import React from 'react';

/**
 * DRIVAIR Solid Charcoal Card / Glass Card Component (readme1.md 4.3)
 * Standard: charcoal surface #171717, 24px radius, subtle border.
 * Glass: selective highlight backdrop-blur-xl.
 */
export default function Card({
  children,
  variant = 'surface', // 'surface' | 'glass' | 'elevated' | 'subtle'
  className = '',
  ...props
}) {
  const variantStyles = {
    // Standard data-dense surface
    surface: 'bg-[#171717] border border-white/10 rounded-[24px]',
    // Elevated panels and popovers
    elevated: 'bg-[#202020] border border-white/15 rounded-[24px] shadow-xl',
    // Subtle row or nested card
    subtle: 'bg-[#262626] border border-white/10 rounded-[20px]',
    // Selective glassmorphism highlight
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl',
  };

  return (
    <div className={`${variantStyles[variant] || variantStyles.surface} p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
