import { Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface FavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FavoriteButton = ({
  isFavorited,
  onToggle,
  disabled = false,
  size = 'md',
  className,
}: FavoriteButtonProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      className={cn(
        'rounded-full bg-white/90 backdrop-blur-sm shadow-md',
        'flex items-center justify-center',
        'transition-all duration-200',
        'hover:scale-110 hover:shadow-lg',
        'active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      aria-label={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-200',
          isFavorited
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-400'
        )}
      />
    </button>
  );
};
