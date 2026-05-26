'use client';
/**
 * FirebaseProvider
 * - On first load: seeds Firestore if empty, then loads all data into Zustand
 * - Sets up real-time listeners for orders, products, vendors, and notifications
 * - All subsequent mutations go through Zustand actions (which also write to Firestore)
 */
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  seedIfEmpty, fetchAll, fetchCart, fetchWishlist, fetchCommissionRate,
  subscribeToOrders, subscribeToProducts, subscribeToVendors, subscribeToNotifications,
} from '@/lib/firebaseService';
import { User, Product, Vendor, Category, Order, Review, Address, Notification } from '@/lib/store';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // 1. Seed if the database is empty (first ever run)
        await seedIfEmpty(
          store.users,
          store.products,
          store.vendors,
          store.categories,
          store.orders,
          store.reviews,
          store.addresses,
        );

        // 2. Load all static/infrequent collections
        const [users, products, vendors, categories, reviews, addresses, notifications] = await Promise.all([
          fetchAll<User>('users'),
          fetchAll<Product>('products'),
          fetchAll<Vendor>('vendors'),
          fetchAll<Category>('categories'),
          fetchAll<Review>('reviews'),
          fetchAll<Address>('addresses'),
          fetchAll<Notification>('notifications'),
        ]);

        // 3. Load orders
        const orders = await fetchAll<Order>('orders');

        // 4. Load commission rate
        const commissionRate = await fetchCommissionRate();

        // 5. Hydrate Zustand store from Firestore
        useStore.setState({
          users: users.length ? users : store.users,
          products: products.length ? products : store.products,
          vendors: vendors.length ? vendors : store.vendors,
          categories: categories.length ? categories : store.categories,
          reviews: reviews.length ? reviews : store.reviews,
          addresses: addresses.length ? addresses : store.addresses,
          orders: orders.length ? orders : store.orders,
          notifications: notifications.length ? notifications : store.notifications,
          commissionRate,
        });

        // 6. Restore current user session
        const currentUser = store.currentUser;
        if (currentUser) {
          const [cart, wishlist] = await Promise.all([
            fetchCart(currentUser.id),
            fetchWishlist(currentUser.id),
          ]);
          if (cart.length) useStore.setState({ cart });
          if (wishlist.length) useStore.setState({ wishlist });
        }

        setReady(true);

        // 7. Real-time listeners — update Zustand whenever Firestore changes
        const unsubOrders = subscribeToOrders(orders => {
          useStore.setState({ orders });
        });

        const unsubProducts = subscribeToProducts(products => {
          useStore.setState({ products });
        });

        const unsubVendors = subscribeToVendors(vendors => {
          useStore.setState({ vendors });
        });

        // Notification listener for current user
        let unsubNotifications: (() => void) | null = null;
        if (currentUser) {
          unsubNotifications = subscribeToNotifications(currentUser.id, (notifications) => {
            useStore.setState(s => ({
              notifications: [
                ...notifications,
                ...s.notifications.filter(n => n.userId !== currentUser.id),
              ],
            }));
          });
        }

        // Cleanup on unmount
        return () => {
          unsubOrders();
          unsubProducts();
          unsubVendors();
          if (unsubNotifications) unsubNotifications();
        };
      } catch (err) {
        console.error('Firebase init error:', err);
        setReady(true); // fall through to local data on error
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading screen while Firestore data is being fetched
  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 12C3 7.03 7.03 3 12 3s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9z" stroke="#10B981" strokeWidth="2"/>
            <path d="M8 12l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#111827', fontSize: '1.1rem', marginBottom: '0.25rem' }}>VendorHub</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Connecting to database...</p>
        </div>
        <div style={{ width: 200, height: 4, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#111827', borderRadius: 99, animation: 'shimmer 1.5s ease-in-out infinite', width: '60%' }}></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
