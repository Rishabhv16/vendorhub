'use client';
import { useStore } from '@/lib/store';
import { Heart, ShoppingCart } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '@/lib/store';
import { useState } from 'react';
import ProductDetail from './ProductDetail';

interface WishlistPageProps {
  addToCart: (p: Product) => void;
  onNavigate: (page: string) => void;
}

export default function WishlistPage({ addToCart, onNavigate }: WishlistPageProps) {
  const { wishlist, products } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const wishlisted = products.filter(p => wishlist.includes(p.id));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Heart size={24} color="#EC4899" fill="#EC4899" />
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>My Wishlist</h1>
        <span className="badge badge-muted">{wishlisted.length} items</span>
      </div>

      {wishlisted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Heart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ marginBottom: '1rem' }}>Your wishlist is empty</p>
          <button className="btn-primary" onClick={() => onNavigate('home')}>Explore Products</button>
        </div>
      ) : (
        <div className="product-grid">
          {wishlisted.map(p => (
            <ProductCard key={p.id} product={p} onView={setSelectedProduct} onAddToCart={addToCart} />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} onNavigate={onNavigate} />
      )}
    </div>
  );
}
