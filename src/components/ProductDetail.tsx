'use client';
import { Product, useStore } from '@/lib/store';
import { X, Star, MapPin, Truck, ShieldCheck, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onNavigate: (p: string) => void;
}

export default function ProductDetail({ product, onClose, onAddToCart, onNavigate }: ProductDetailProps) {
  const { currentUser, toggleWishlist, wishlist, addToBrowsingHistory, reviews } = useStore();
  const [activeImg, setActiveImg] = useState(0);
  const isWishlisted = wishlist.includes(product.id);
  const isOut = product.stock === 0;
  const productReviews = reviews.filter(r => r.productId === product.id);

  // Track browsing history on open
  useState(() => { addToBrowsingHistory(product.id); });


  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: '2rem' }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</span>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
          {/* Images */}
          <div style={{ flex: '1 1 400px', background: '#F9FAFB', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
              <img src={product.images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=800&background=F3F4F6&color=111827`; }} />
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{ width: 72, height: 72, borderRadius: 10, border: `2px solid ${activeImg === i ? '#111827' : 'transparent'}`, overflow: 'hidden', padding: 0, flexShrink: 0, cursor: 'pointer' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ flex: '1 1 400px', padding: '2.5rem', background: '#FFFFFF' }}>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={16} fill="#FBBF24" color="#FBBF24" />
                <span style={{ fontWeight: 600, color: '#111827' }}>{product.rating}</span>
                <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>({product.reviewCount} reviews)</span>
              </div>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D1D5DB' }} />
              <span style={{ color: '#059669', fontWeight: 500, fontSize: '0.875rem' }}>{product.sold} sold</span>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Vendor info */}
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏪</div>
              <div>
                <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{product.sellerName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6B7280', fontSize: '0.8rem' }}>
                  <MapPin size={12} /> {product.sellerLocation}
                </div>
              </div>
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Verified</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563', fontSize: '0.875rem' }}>
                <Truck size={18} color="#111827" /> Usually ships in 24h
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563', fontSize: '0.875rem' }}>
                <ShieldCheck size={18} color="#111827" /> Secure Sandbox Checkout
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              {currentUser?.role === 'buyer' && (
                <button className="btn btn-secondary" style={{ width: 56, padding: 0 }} onClick={() => toggleWishlist(product.id)}>
                  <Heart size={20} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : '#111827'} />
                </button>
              )}
              {isOut ? (
                <button className="btn btn-secondary" style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }} disabled>Out of Stock</button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '1.05rem', padding: '1rem' }} onClick={() => {
                  if (currentUser?.role === 'buyer') {
                    onAddToCart(product);
                  } else if (!currentUser) {
                    onClose();
                    onNavigate('home'); // Trigger auth
                  }
                }}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '2rem 1.5rem', background: '#FAFAFA' }}>
          <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', marginBottom: '1.25rem' }}>
            Customer Reviews ({productReviews.length})
          </h3>
          {productReviews.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>No reviews yet. Be the first to review after purchase!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 280, overflowY: 'auto' }}>
              {productReviews.map(r => (
                <div key={r.id} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.userName}`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{r.userName}</p>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? '#FBBF24' : '#D1D5DB', fontSize: '0.8rem' }}>★</span>)}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#9CA3AF', fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.5 }}>{r.comment || 'No comment.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
