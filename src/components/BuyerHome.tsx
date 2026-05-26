'use client';
import { useState, useMemo } from 'react';
import { useStore, Product } from '@/lib/store';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import { Search, Filter, X, Sparkles, TrendingUp, MapPin, ArrowRight, Star, SlidersHorizontal } from 'lucide-react';

// Synonym map for AI-powered fuzzy search
const SYNONYMS: Record<string, string[]> = {
  'headphones': ['audio', 'earphones', 'earbuds', 'headset', 'sound'],
  'audio': ['headphones', 'earphones', 'speaker', 'sound', 'music'],
  'laptop bag': ['notebook carry case', 'computer bag', 'laptop sleeve'],
  'notebook carry': ['laptop bag', 'computer bag', 'laptop sleeve'],
  'shoes': ['footwear', 'sneakers', 'running', 'sports shoes'],
  'sneakers': ['shoes', 'footwear', 'running shoes', 'sports'],
  'food': ['grocery', 'organic', 'snacks', 'nuts'],
  'nuts': ['organic', 'almonds', 'cashews', 'healthy food'],
  'monitor': ['display', 'screen', 'led', 'computer screen'],
  'keyboard': ['mechanical', 'gaming keyboard', 'input'],
};

function getExpandedTerms(q: string): string[] {
  const lower = q.toLowerCase();
  const terms = [lower];
  Object.entries(SYNONYMS).forEach(([key, synonyms]) => {
    if (lower.includes(key) || synonyms.some(s => lower.includes(s))) {
      terms.push(key, ...synonyms);
    }
  });
  return [...new Set(terms)];
}

export default function BuyerHome({ addToCart, searchQuery = '', onNavigate }: { addToCart: (p: Product) => void; searchQuery?: string; onNavigate: (p: string) => void }) {
  const { products, categories, currentUser, browsingHistory, orders } = useStore();
  const [selected, setSelected] = useState<Product | null>(null);
  const [cat, setCat] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sort, setSort] = useState('relevance');
  const [lq, setLq] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const query = (lq || searchQuery).toLowerCase().trim();
    const expandedTerms = query ? getExpandedTerms(query) : [];

    let result = products.filter(p => {
      // AI-powered search with synonym expansion
      if (query) {
        const searchable = [p.name, p.category, p.description, p.subcategory, ...(p.tags || [])].join(' ').toLowerCase();
        const matches = expandedTerms.some(term => searchable.includes(term));
        if (!matches) return false;
      }
      if (cat && p.category !== cat) return false;
      if (priceMin && p.price < +priceMin) return false;
      if (priceMax && p.price > +priceMax) return false;
      if (locationFilter && !p.sellerLocation.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (ratingFilter && p.rating < +ratingFilter) return false;
      return true;
    });

    // Sort
    if (sort === 'price_asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') result = [...result].sort((a, b) => b.sold - a.sold);

    return result;
  }, [products, lq, searchQuery, cat, priceMin, priceMax, locationFilter, ratingFilter, sort]);

  const isSearch = lq || searchQuery;
  const hasActiveFilters = cat || priceMin || priceMax || locationFilter || ratingFilter;

  const clearFilters = () => {
    setCat(''); setPriceMin(''); setPriceMax(''); setLocationFilter(''); setRatingFilter(''); setLq('');
  };

  // AI Recommendations — based on browsing history + past order categories
  const recommendations = useMemo(() => {
    if (!browsingHistory.length && !orders.length) return products.slice(0, 4);
    const viewedCategories = browsingHistory
      .map(id => products.find(p => p.id === id)?.category)
      .filter(Boolean) as string[];
    const orderedCategories = orders
      .filter(o => o.buyerId === currentUser?.id)
      .flatMap(o => o.items.map(i => products.find(p => p.id === i.productId)?.category))
      .filter(Boolean) as string[];
    const allCats = [...viewedCategories, ...orderedCategories];
    if (!allCats.length) return products.slice(0, 4);
    return products
      .filter(p => !browsingHistory.includes(p.id)) // exclude already viewed
      .sort((a, b) => {
        const aScore = allCats.filter(c => c === a.category).length;
        const bScore = allCats.filter(c => c === b.category).length;
        return bScore - aScore;
      })
      .slice(0, 8);
  }, [browsingHistory, orders, products, currentUser]);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      
      {/* ── BENTO GRID HERO ────────────────────────────────────────── */}
      {!isSearch && !hasActiveFilters && (
        <div style={{ padding: '6rem 2rem 2rem' }}>
          <div className="bento-grid">
            
            {/* Main Search Block (Spans 2x2) */}
            <div className="bento-card bg-mesh" style={{ gridColumn: 'span 2', gridRow: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '2rem', width: 'fit-content' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span>
                Welcome back, {currentUser?.name.split(' ')[0]}
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#111827', lineHeight: 1.05, marginBottom: '1.5rem' }}>
                Explore your <br/> neighborhood.
              </h1>
              <p style={{ fontSize: '1.25rem', color: '#6B7280', maxWidth: 400, marginBottom: '3rem', lineHeight: 1.6 }}>
                The fastest way to discover and buy from local vendors.
              </p>

              <form onSubmit={e => { e.preventDefault(); }} style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', background: '#FFFFFF', borderRadius: 20, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', transition: 'all 0.3s ease' }}>
                  <div style={{ padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={22} color="#9CA3AF" />
                  </div>
                  <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.15rem', height: 56, color: '#111827' }} placeholder="Search for anything..." value={lq} onChange={e => setLq(e.target.value)} />
                  <button type="submit" className="btn btn-primary" style={{ height: 56, borderRadius: 16, padding: '0 2rem', fontSize: '1.05rem', fontWeight: 600 }}>Search</button>
                </div>
              </form>
            </div>

            {/* Featured Product Block (Spans 2x1) */}
            <div className="bento-card" style={{ gridColumn: 'span 2', position: 'relative', cursor: 'pointer' }} onClick={() => products[0] && setSelected(products[0])}>
              <img src={products[0]?.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Featured" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)' }}></div>
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ color: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', color: '#10B981' }}>Featured Drop</span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{products[0]?.name || 'Urban Sneakers'}</h3>
                  <p style={{ color: '#D1D5DB', fontSize: '0.95rem' }}>₹{products[0]?.price?.toLocaleString('en-IN')}</p>
                </div>
                <div className="glass-pill" style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>

            {/* AI Curated Block */}
            <div className="bento-card" style={{ background: '#111827', color: '#FFFFFF', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Curated</h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>Personalized recommendations based on your local history.</p>
              </div>
            </div>

            {/* Trending Block */}
            <div className="bento-card" style={{ background: '#F3F4F6', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-1rem', right: '-1rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                <TrendingUp size={160} />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>Trending Now</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['Wireless Headphones', 'Organic Almonds', 'Running Shoes'].map((t, i) => (
                    <button key={t} onClick={() => setLq(t)} style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem', color: '#4B5563', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                      <span>{i+1}. {t}</span> <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTERS & SEARCH BAR (when searching) ────────────────────────────────── */}
      <div className="container" style={{ padding: isSearch || hasActiveFilters ? '2rem 1.5rem 0' : '3rem 1.5rem 0' }}>
        
        {/* Category Pills */}
        <section style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setCat('')} style={{ padding: '0.625rem 1.5rem', borderRadius: 999, background: !cat ? '#111827' : '#FFFFFF', color: !cat ? '#FFFFFF' : '#4B5563', border: `1px solid ${!cat ? '#111827' : '#E5E7EB'}`, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              All
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCat(cat === c.name ? '' : c.name)} style={{ padding: '0.625rem 1.5rem', borderRadius: 999, background: cat === c.name ? '#F3F4F6' : '#FFFFFF', color: cat === c.name ? '#111827' : '#4B5563', border: `1px solid ${cat === c.name ? '#111827' : '#E5E7EB'}`, fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{c.icon}</span> {c.name}
              </button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)} style={{ marginLeft: 'auto', padding: '0.625rem 1.25rem', borderRadius: 12, background: showFilters ? '#111827' : '#FFFFFF', color: showFilters ? '#FFFFFF' : '#4B5563', border: '1px solid #E5E7EB', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
              <SlidersHorizontal size={16} /> Filters {hasActiveFilters && <span style={{ background: '#10B981', color: '#fff', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Min Price (₹)</label>
                <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Max Price (₹)</label>
                <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="99999" style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Vendor Location</label>
                <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} placeholder="e.g. Delhi, Mumbai" style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Min Rating ⭐</label>
                <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: '0.95rem', outline: 'none', background: '#FFFFFF' }}>
                  <option value="">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Sort By</label>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: '0.95rem', outline: 'none', background: '#FFFFFF' }}>
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: 10, border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#6B7280', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <X size={14} /> Clear All
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── MAIN PRODUCT GRID ────────────────────────────────── */}
        <section style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <h2 className="font-display" style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', color: '#111827' }}>
              {(lq || searchQuery) ? `Results for "${lq || searchQuery}"` : cat ? `${cat} Collection` : 'Featured Products'}
            </h2>
            <span style={{ color: '#9CA3AF', fontSize: '0.95rem', fontWeight: 500 }}>({filtered.length} items)</span>
            {(lq || searchQuery) && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 999, fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                <Sparkles size={12} /> AI-powered synonyms active
              </div>
            )}
          </div>
          
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '8rem 1rem', background: '#F9FAFB', borderRadius: 32, border: '1px dashed #D1D5DB' }}>
              <Search size={56} color="#D1D5DB" style={{ margin: '0 auto 1.5rem' }} />
              <p className="font-display" style={{ fontWeight: 600, fontSize: '1.5rem', color: '#111827', marginBottom: '0.5rem' }}>Nothing found.</p>
              <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Try a different search or remove some filters.</p>
              <button className="btn btn-primary" style={{ borderRadius: 12 }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} onView={setSelected} onAddToCart={addToCart} />)}
            </div>
          )}
        </section>
      </div>

      {/* ── AI RECOMMENDATIONS ────────────────────────────────── */}
      {!isSearch && !hasActiveFilters && browsingHistory.length > 0 && (
        <div style={{ background: '#F9FAFB', padding: '3rem 1.5rem', marginBottom: '0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="#10B981" />
              </div>
              <div>
                <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1.5rem', color: '#111827' }}>Recommended For You</h2>
                <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Based on your browsing history · AI-powered</p>
              </div>
            </div>
            <div className="product-grid">
              {recommendations.map(p => <ProductCard key={p.id} product={p} onView={setSelected} onAddToCart={addToCart} />)}
            </div>
          </div>
        </div>
      )}

      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} onAddToCart={addToCart} onNavigate={onNavigate} />}
    </div>
  );
}
