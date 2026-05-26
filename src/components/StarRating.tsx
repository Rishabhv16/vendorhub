'use client';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}

export default function StarRating({ rating, max = 5, size = 14, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="stars" style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(rating) ? '#F59E0B' : 'none'}
          color={i < Math.round(rating) ? '#F59E0B' : 'var(--text-muted)'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'color 0.1s' }}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
