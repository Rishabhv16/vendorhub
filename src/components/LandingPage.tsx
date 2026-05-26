'use client';
import { useStore } from '@/lib/store';
import { Search, ArrowRight, Star, ShoppingBag, Store, ShieldCheck, MapPin, Zap, TrendingUp, CheckCircle, Package, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  { icon: <Zap size={24} />, name: 'Electronics', count: '12K+' },
  { icon: <ShoppingBag size={24} />, name: 'Fashion', count: '8K+' },
  { icon: <Package size={24} />, name: 'Home', count: '15K+' },
  { icon: <Store size={24} />, name: 'Grocery', count: '5K+' },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  );
}

export default function LandingPage({ onLogin, onSearch }: { onLogin: () => void; onSearch: (q: string) => void }) {
  const [q, setQ] = useState('');
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) onSearch(q); };

  return (
    <div style={{ background: '#FFFFFF', color: '#111827' }}>
      
      {/* ── BENTO GRID HERO ────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem 2rem' }}>
          <div className="bento-grid">
            
            {/* Main Search Block (Spans 2x2) */}
            <div className="bento-card bg-mesh" style={{ gridColumn: 'span 2', gridRow: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem' }}>
              <FadeIn>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '2rem', width: 'fit-content' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }}></span>
                  Over 12,000 local vendors verified
                </div>
              </FadeIn>
              
              <FadeIn delay={0.1}>
                <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#111827', lineHeight: 1.05, marginBottom: '1.5rem' }}>
                  Explore your <br/> neighborhood.
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p style={{ fontSize: '1.25rem', color: '#6B7280', maxWidth: 400, marginBottom: '3rem', lineHeight: 1.6 }}>
                  The fastest way to discover and buy from local vendors. Delivered today.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', background: '#FFFFFF', borderRadius: 20, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', transition: 'all 0.3s ease' }}>
                    <div style={{ padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Search size={22} color="#9CA3AF" />
                    </div>
                    <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.15rem', height: 56, color: '#111827' }} placeholder="Search for anything..." value={q} onChange={e => setQ(e.target.value)} />
                    <button type="submit" className="btn btn-primary" style={{ height: 56, borderRadius: 16, padding: '0 2rem', fontSize: '1.05rem', fontWeight: 600 }}>Search</button>
                  </div>
                </form>
              </FadeIn>
            </div>

            {/* Featured Product Block (Spans 2x1) */}
            <FadeIn delay={0.4}>
              <div className="bento-card" style={{ gridColumn: 'span 2', position: 'relative', cursor: 'pointer', height: '100%' }} onClick={onLogin}>
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Featured" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)' }}></div>
                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ color: '#FFFFFF' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block', color: '#10B981' }}>Featured Drop</span>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Urban Sneakers</h3>
                  </div>
                  <div className="glass-pill" style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Same Day Delivery Block (1x1) */}
            <FadeIn delay={0.5}>
              <div className="bento-card" style={{ background: '#111827', color: '#FFFFFF', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={24} color="#10B981" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Curated</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>Personalized recommendations based on your local history.</p>
                </div>
              </div>
            </FadeIn>

            {/* Trending Block (1x1) */}
            <FadeIn delay={0.6}>
              <div className="bento-card" style={{ background: '#F3F4F6', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', height: '100%' }}>
                <div style={{ position: 'absolute', top: '-1rem', right: '-1rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                  <TrendingUp size={160} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>Trending Now</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['Fresh Coffee', 'Smart Watches', 'Yoga Mats'].map((t, i) => (
                      <button key={t} onClick={onLogin} style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem', color: '#4B5563', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                        <span>{i+1}. {t}</span> <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────── */}
      <section style={{ padding: '8rem 0', background: '#FAFAFA', borderTop: '1px solid #E5E7EB' }}>
        <div className="container">
          <FadeIn>
            <span className="section-label">Categories</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
              <h2 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#111827' }}>Everything you need,<br />just around the corner.</h2>
              <button className="btn btn-ghost" onClick={onLogin}>View all <ArrowRight size={16} /></button>
            </div>
          </FadeIn>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {CATEGORIES.map((c, i) => (
              <FadeIn key={c.name} delay={i * 0.1}>
                <div onClick={onLogin} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 20, padding: '2rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                    {c.icon}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{c.name}</h3>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{c.count} Products</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
            <FadeIn>
              <span className="section-label">Smart Shopping</span>
              <h2 className="font-display" style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '2rem' }}>
                AI-driven.<br />Locally sourced.
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#4B5563', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                Our proprietary AI understands exactly what you are looking for, even with synonyms. We analyze your preferences to recommend products from top-rated vendors in your vicinity.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { title: 'Fuzzy Search Algorithm', desc: 'Finds products instantly, correcting typos naturally.' },
                  { title: 'Personalized Recommendations', desc: 'Curated feeds based on your order history.' },
                  { title: 'Secure Sandbox Payments', desc: 'Test checkout flows seamlessly with full security.' }
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ marginTop: '0.25rem' }}><CheckCircle size={20} color="#111827" /></div>
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>{f.title}</h4>
                      <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <div style={{ background: '#F9FAFB', borderRadius: 32, padding: '3rem', border: '1px solid #E5E7EB', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80" alt="Shopping" style={{ width: '100%', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FOR SELLERS ───────────────────────────────── */}
      <section style={{ padding: '6rem 0', background: '#FAFAFA', borderTop: '1px solid #E5E7EB' }}>
        <div className="container">
          <FadeIn>
            <div style={{ background: '#111827', borderRadius: 32, padding: '5rem 4rem', color: '#fff', textAlign: 'center', backgroundImage: 'radial-gradient(circle at 50% 0%, #1F2937 0%, transparent 70%)' }}>
              <span className="section-label" style={{ color: '#9CA3AF' }}>For Sellers</span>
              <h2 className="font-display" style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: '#F9FAFB' }}>
                Open your digital storefront.
              </h2>
              <p style={{ color: '#D1D5DB', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 3rem', lineHeight: 1.6 }}>
                Join VendorHub and manage your entire business from one elegant dashboard. Real-time analytics, inventory tracking, and order fulfillment simplified.
              </p>
              <button className="btn" style={{ background: '#fff', color: '#111827', padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: 12 }} onClick={onLogin}>
                Start Selling Now
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer style={{ padding: '4rem 0 2rem', background: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <ShoppingBag size={24} color="#111827" />
                <span className="font-display" style={{ fontWeight: 700, fontSize: '1.5rem', color: '#111827' }}>VendorHub</span>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 300 }}>
                A premium, hyperlocal marketplace connecting discerning buyers with the finest local vendors.
              </p>
            </div>
            {[{ title: 'Product', links: ['Features', 'Pricing', 'Vendors', 'Releases'] }, { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact'] }, { title: 'Legal', links: ['Privacy', 'Terms', 'Refunds'] }].map(c => (
              <div key={c.title}>
                <h4 style={{ fontWeight: 600, color: '#111827', marginBottom: '1.25rem', fontSize: '0.95rem' }}>{c.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {c.links.map(l => <button key={l} className="btn-ghost" onClick={onLogin} style={{ padding: 0, height: 'auto', textAlign: 'left', fontWeight: 400, color: '#6B7280', fontSize: '0.95rem' }}>{l}</button>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
            <p>© 2025 VendorHub. Built for quality.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
