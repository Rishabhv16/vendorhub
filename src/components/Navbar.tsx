'use client';
import { useStore } from '@/lib/store';
import { ShoppingCart, Heart, Bell, Search, LogOut, User, ChevronDown, Package, ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onLoginClick: () => void;
  onCartClick: () => void;
  onSearch?: (q: string) => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Navbar({ onLoginClick, onCartClick, onSearch, currentPage, onNavigate }: NavbarProps) {
  const { currentUser, setCurrentUser, cart, wishlist, notifications } = useStore();
  const [search, setSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const nav = (p: string) => { onNavigate?.(p); setUserMenuOpen(false); setMobileMenuOpen(false); };

  const iconBtn = (onClick: () => void, children: React.ReactNode, badge?: number) => (
    <button onClick={onClick} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#4B5563'; }}>
      {children}
      {badge ? <span style={{ position: 'absolute', top: -5, right: -5, background: '#111827', color: 'white', fontSize: '0.65rem', fontWeight: 600, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF' }}>{badge > 9 ? '9+' : badge}</span> : null}
    </button>
  );

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: 1200 }}>

        {/* Logo */}
        <button onClick={() => nav('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0, padding: 0 }}>
          <div style={{ background: '#111827', padding: '7px', borderRadius: 10, display: 'flex' }}><ShoppingBag size={18} color="white" /></div>
          <span id="navbar-logo" className="font-display" style={{ fontWeight: 700, fontSize: '1.35rem', color: '#111827' }}>VendorHub</span>
        </button>

        {/* Desktop Search */}
        {(!currentUser || currentUser.role === 'buyer') && (
          <form id="navbar-search-desktop" onSubmit={e => { e.preventDefault(); onSearch?.(search); }} style={{ flex: 1, maxWidth: 440, display: 'flex', marginLeft: '1.5rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input" style={{ paddingLeft: '2.5rem', height: 40, borderRadius: 10, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', boxShadow: 'none', fontSize: '0.9rem' }} placeholder="Search products, vendors..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" style={{ display: 'none' }}>Go</button>
          </form>
        )}
        {currentUser && currentUser.role !== 'buyer' && <div style={{ flex: 1 }} />}
        <div style={{ flex: 1 }} />

        {/* Desktop Actions */}
        <div id="navbar-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {currentUser ? (
            <>
              {iconBtn(() => nav('notifications'), <Bell size={18} />, unread || undefined)}
              {currentUser.role === 'buyer' && iconBtn(() => nav('wishlist'), <Heart size={18} />, wishlist.length || undefined)}
              {currentUser.role === 'buyer' && iconBtn(onCartClick, <ShoppingCart size={18} />, cartCount || undefined)}
              {currentUser.role === 'buyer' && iconBtn(() => nav('orders'), <Package size={18} />)}

              <div ref={ref} style={{ position: 'relative', marginLeft: '0.25rem' }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '0.3rem 0.6rem', cursor: 'pointer', height: 40, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
                  <img src={currentUser.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%' }} />
                  <span id="navbar-username" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown size={14} color="#6B7280" />
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, minWidth: 220, zIndex: 300, overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', animation: 'slideUp 0.15s ease' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #F3F4F6' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{currentUser.name}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.15rem' }}>{currentUser.email}</p>
                      <span className="badge badge-secondary" style={{ marginTop: '0.5rem' }}>{currentUser.role}</span>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                      <button onClick={() => nav('profile')} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }} onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'} onMouseLeave={e => e.currentTarget.style.background = 'none'}><User size={16} /> Profile</button>
                      <button onClick={() => { setCurrentUser(null); nav('home'); }} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }} onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'none'}><LogOut size={16} /> Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onLoginClick} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Log in</button>
              <button className="btn btn-primary" onClick={onLoginClick} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Sign Up</button>
            </>
          )}
        </div>

        {/* Mobile: Search + Cart + Hamburger */}
        <div id="navbar-mobile-actions" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
          {(!currentUser || currentUser.role === 'buyer') && (
            <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
              <Search size={18} />
            </button>
          )}
          {currentUser?.role === 'buyer' && (
            <button onClick={onCartClick} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563', position: 'relative' }}>
              <ShoppingCart size={18} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#111827', color: '#fff', fontSize: '0.6rem', fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
            </button>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <form onSubmit={e => { e.preventDefault(); onSearch?.(search); setMobileSearchOpen(false); }} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input" autoFocus style={{ paddingLeft: '2.5rem', height: 44, borderRadius: 10, width: '100%' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', height: 44, borderRadius: 10 }}>Go</button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
          {currentUser ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: 12, marginBottom: '0.25rem' }}>
                <img src={currentUser.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div><p style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{currentUser.name}</p><span className="badge badge-secondary">{currentUser.role}</span></div>
              </div>
              {[
                { label: '🔔 Notifications', page: 'notifications', badge: unread },
                ...(currentUser.role === 'buyer' ? [
                  { label: '❤️ Wishlist', page: 'wishlist', badge: wishlist.length },
                  { label: '📦 My Orders', page: 'orders', badge: 0 },
                ] : []),
                { label: '👤 Profile', page: 'profile', badge: 0 },
              ].map(item => (
                <button key={item.page} onClick={() => nav(item.page)} style={{ padding: '0.875rem 1rem', background: 'none', border: '1px solid #F3F4F6', borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontWeight: 500, color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit', fontSize: '0.95rem' }}>
                  {item.label}
                  {item.badge > 0 && <span style={{ background: '#111827', color: '#fff', borderRadius: 999, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{item.badge}</span>}
                </button>
              ))}
              <button onClick={() => { setCurrentUser(null); nav('home'); }} style={{ padding: '0.875rem 1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#DC2626', fontFamily: 'inherit', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center', height: 48 }}>Sign Up / Log In</button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #navbar-search-desktop { display: none !important; }
          #navbar-desktop-actions { display: none !important; }
          #navbar-mobile-actions { display: flex !important; }
        }
        @media (max-width: 480px) {
          #navbar-logo { display: none; }
        }
      `}</style>
    </nav>
  );
}
