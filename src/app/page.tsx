'use client';
import { useState, useCallback } from 'react';
import { useStore, Product } from '@/lib/store';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import BuyerHome from '@/components/BuyerHome';
import BuyerOrders from '@/components/BuyerOrders';
import WishlistPage from '@/components/WishlistPage';
import SellerDashboard from '@/components/SellerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import NotificationsPage from '@/components/NotificationsPage';
import ProfilePage from '@/components/ProfilePage';
import Toast from '@/components/Toast';
import LandingPage from '@/components/LandingPage';

type Page = 'home' | 'orders' | 'wishlist' | 'seller' | 'admin' | 'notifications' | 'profile';
interface ToastState { message: string; type: 'success' | 'error' | 'info' }

export default function App() {
  const { currentUser, addToCart } = useStore();
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [page, setPage] = useState<Page>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
  }, []);

  const handleAddToCart = useCallback((p: Product) => {
    if (!currentUser) { setShowAuth(true); return; }
    if (currentUser.role !== 'buyer') { showToast('Only buyers can add to cart.', 'error'); return; }
    addToCart({ productId: p.id, quantity: 1 });
    showToast(`Added to cart!`);
  }, [currentUser, addToCart, showToast]);

  const navigate = useCallback((p: string) => {
    if (!currentUser && p !== 'home') { setShowAuth(true); return; }
    setPage(p as Page);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage('home');
  }, []);

  const effectivePage =
    page === 'home' && currentUser?.role === 'seller' ? 'seller' :
    page === 'home' && currentUser?.role === 'admin'  ? 'admin'  : page;

  const isAuthenticated = !!currentUser;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar
        onLoginClick={() => setShowAuth(true)}
        onCartClick={() => { if (!currentUser) { setShowAuth(true); return; } setShowCart(true); }}
        onSearch={handleSearch}
        currentPage={effectivePage}
        onNavigate={navigate}
      />

      <main>
        {/* Not logged in → show full landing */}
        {!isAuthenticated && effectivePage === 'home' && (
          <LandingPage onLogin={() => setShowAuth(true)} onSearch={handleSearch} />
        )}

        {/* Buyer */}
        {isAuthenticated && currentUser.role === 'buyer' && effectivePage === 'home' && (
          <BuyerHome addToCart={handleAddToCart} searchQuery={searchQuery} onNavigate={navigate} />
        )}
        {effectivePage === 'orders'        && <BuyerOrders onNavigate={navigate} />}
        {effectivePage === 'wishlist'      && <WishlistPage addToCart={handleAddToCart} onNavigate={navigate} />}

        {/* Seller */}
        {effectivePage === 'seller'        && <SellerDashboard />}

        {/* Admin */}
        {effectivePage === 'admin'         && <AdminDashboard />}

        {/* Shared */}
        {effectivePage === 'notifications' && <NotificationsPage />}
        {effectivePage === 'profile'       && <ProfilePage onNavigate={navigate} />}
      </main>

      {showAuth  && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => showToast('Welcome to VendorHub! 🎉')} />}
      {showCart && currentUser && <CartDrawer onClose={() => setShowCart(false)} />}
      {toast    && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
