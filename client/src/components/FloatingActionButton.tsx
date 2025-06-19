interface FloatingActionButtonProps {
  onClick: () => void;
  icon: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FloatingActionButton({ 
  onClick, 
  icon, 
  size = 'lg',
  className = ''
}: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        rounded-full btn-neon flex items-center justify-center 
        shadow-lg hover:shadow-2xl transition-all neon-glow
        ${className}
      `}
    >
      <i className={`${icon} text-white ${iconSizes[size]}`}></i>
    </button>
  );
}
