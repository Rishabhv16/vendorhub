'use client';
import { Product, useStore } from '@/lib/store';
import { Heart, ShoppingCart, MapPin, Star, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onView: (p: Product) => void;
  onAddToCart?: (p: Product) => void;
}

export default function ProductCard({ product, onView, onAddToCart }: ProductCardProps) {
  const { wishlist, toggleWishlist, currentUser } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const isLow = product.stock > 0 && product.stock <= 5;
  const isOut = product.stock === 0;

  return (
    <div className="product-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => onView(product)}>
      <div className="product-card-img" style={{ borderBottom: '1px solid var(--border)' }}>
        <img src={product.images[0]} alt={product.name}
          onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=F3F4F6&color=111827`; }} />

        {/* Wishlist */}
        {currentUser?.role === 'buyer' && (
          <button onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
            style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', zIndex: 2, border: 'none' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <Heart size={16} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : '#4B5563'} />
          </button>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {isOut && <span className="badge badge-danger">Sold Out</span>}
          {isLow && !isOut && <span className="badge badge-warning">Only {product.stock} left</span>}
        </div>
      </div>

      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={12} fill="#FBBF24" color="#FBBF24" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>{product.rating}</span>
          </div>
        </div>

        <h3 style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.4, marginBottom: '0.75rem', color: '#111827', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>₹{product.price.toLocaleString('en-IN')}</span>
          </div>
          {currentUser?.role === 'buyer' && !isOut && (
            <button className="btn" style={{ background: '#111827', color: '#fff', borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={e => { e.stopPropagation(); onAddToCart?.(product); }}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
