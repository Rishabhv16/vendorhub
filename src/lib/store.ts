import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'buyer' | 'seller' | 'admin';
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refund_requested' | 'refunded';
export type VendorStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  phone?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  subcategory: string;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  views: number;
  sold: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  items: { productId: string; productName: string; price: number; quantity: number; image: string }[];
  total: number;
  commission: number;
  vendorEarnings: number;
  status: OrderStatus;
  address: Address;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  refundReason?: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  category: string;
  location: string;
  gstNumber?: string;
  bankAccount?: string;
  status: VendorStatus;
  totalRevenue: number;
  totalOrders: number;
  rating: number;
  createdAt: string;
  payoutHistory: { id: string; amount: number; date: string; status: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'order' | 'vendor' | 'refund' | 'system' | 'low_stock';
}

interface StoreState {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Users
  users: User[];
  addUser: (user: User) => void;

  // Products
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (c: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;

  // Reviews
  reviews: Review[];
  addReview: (r: Review) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Addresses
  addresses: Address[];
  addAddress: (a: Address) => void;
  setDefaultAddress: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus, reason?: string) => void;

  // Vendors
  vendors: Vendor[];
  addVendor: (v: Vendor) => void;
  updateVendorStatus: (id: string, status: VendorStatus) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;

  // Commission
  commissionRate: number;
  setCommissionRate: (rate: number) => void;

  // Browsing history (for AI recommendations)
  browsingHistory: string[];
  addToBrowsingHistory: (productId: string) => void;
}

const SEED_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Electronics', icon: '💻', subcategories: ['Mobiles', 'Laptops', 'Accessories', 'Audio'] },
  { id: 'cat2', name: 'Fashion', icon: '👗', subcategories: ['Men', 'Women', 'Kids', 'Footwear'] },
  { id: 'cat3', name: 'Home & Kitchen', icon: '🏠', subcategories: ['Furniture', 'Appliances', 'Decor', 'Cookware'] },
  { id: 'cat4', name: 'Books', icon: '📚', subcategories: ['Fiction', 'Non-Fiction', 'Academic', 'Comics'] },
  { id: 'cat5', name: 'Sports', icon: '⚽', subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Cycling'] },
  { id: 'cat6', name: 'Beauty', icon: '💄', subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrances'] },
  { id: 'cat7', name: 'Food & Grocery', icon: '🥦', subcategories: ['Organic', 'Snacks', 'Beverages', 'Dairy'] },
  { id: 'cat8', name: 'Toys', icon: '🧸', subcategories: ['Educational', 'Action Figures', 'Board Games', 'Outdoor'] },
];

const SEED_USERS: User[] = [
  { id: 'admin1', name: 'Admin User', email: 'admin@vendorhub.com', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', location: 'Mumbai', phone: '9000000001', createdAt: '2024-01-01' },
  { id: 'seller1', name: 'Ravi Electronics', email: 'ravi@seller.com', role: 'seller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ravi', location: 'Delhi', phone: '9000000002', createdAt: '2024-01-05' },
  { id: 'seller2', name: 'Priya Fashion', email: 'priya@seller.com', role: 'seller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', location: 'Bangalore', phone: '9000000003', createdAt: '2024-01-08' },
  { id: 'seller3', name: 'Green Grocers', email: 'green@seller.com', role: 'seller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=green', location: 'Pune', phone: '9000000004', createdAt: '2024-01-10' },
  { id: 'buyer1', name: 'Arjun Kumar', email: 'arjun@buyer.com', role: 'buyer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun', location: 'Mumbai', phone: '9000000005', createdAt: '2024-02-01' },
];

const SEED_VENDORS: Vendor[] = [
  { id: 'v1', userId: 'seller1', businessName: 'Ravi Electronics Hub', description: 'Best electronics at lowest prices', category: 'Electronics', location: 'Delhi', status: 'approved', totalRevenue: 245000, totalOrders: 87, rating: 4.5, createdAt: '2024-01-05', payoutHistory: [{ id: 'p1', amount: 45000, date: '2024-03-01', status: 'paid' }, { id: 'p2', amount: 60000, date: '2024-04-01', status: 'paid' }] },
  { id: 'v2', userId: 'seller2', businessName: 'Priya Fashion Store', description: 'Trendy fashion at affordable rates', category: 'Fashion', location: 'Bangalore', status: 'approved', totalRevenue: 183000, totalOrders: 142, rating: 4.7, createdAt: '2024-01-08', payoutHistory: [{ id: 'p3', amount: 35000, date: '2024-03-01', status: 'paid' }] },
  { id: 'v3', userId: 'seller3', businessName: 'Green Grocers', description: 'Fresh organic produce daily', category: 'Food & Grocery', location: 'Pune', status: 'approved', totalRevenue: 98000, totalOrders: 310, rating: 4.8, createdAt: '2024-01-10', payoutHistory: [] },
];

const SEED_PRODUCTS: Product[] = [
  { id: 'p1', sellerId: 'seller1', sellerName: 'Ravi Electronics Hub', sellerLocation: 'Delhi', name: 'Wireless Bluetooth Headphones Pro', description: 'Premium noise-cancelling wireless headphones with 30hr battery life, deep bass, and comfortable over-ear design. Perfect for music lovers and professionals.', price: 2999, stock: 45, category: 'Electronics', subcategory: 'Audio', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'], rating: 4.6, reviewCount: 128, tags: ['wireless', 'bluetooth', 'headphones', 'noise cancelling', 'audio'], createdAt: '2024-02-01', views: 1240, sold: 89 },
  { id: 'p2', sellerId: 'seller1', sellerName: 'Ravi Electronics Hub', sellerLocation: 'Delhi', name: 'Smart LED Monitor 24"', description: 'Full HD IPS display with 75Hz refresh rate, ultra-thin bezel, and blue light filter. Ideal for gaming, design, and professional work.', price: 12999, stock: 12, category: 'Electronics', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'], rating: 4.4, reviewCount: 67, tags: ['monitor', 'led', 'display', 'full hd', '24 inch'], createdAt: '2024-02-03', views: 890, sold: 34 },
  { id: 'p3', sellerId: 'seller1', sellerName: 'Ravi Electronics Hub', sellerLocation: 'Delhi', name: 'USB-C Fast Charging Hub 7-Port', description: 'Multi-port USB hub with 100W PD, HDMI 4K, SD card reader and USB 3.0 ports. Compatible with MacBook, laptop and tablets.', price: 1799, stock: 3, category: 'Electronics', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400'], rating: 4.2, reviewCount: 45, tags: ['usb hub', 'charging', 'type c', 'multiport'], createdAt: '2024-02-10', views: 560, sold: 62 },
  { id: 'p4', sellerId: 'seller2', sellerName: 'Priya Fashion Store', sellerLocation: 'Bangalore', name: 'Classic Cotton Kurta Set', description: 'Handcrafted pure cotton kurta with intricate embroidery. Available in multiple sizes. Perfect for festivals and casual wear.', price: 1299, stock: 85, category: 'Fashion', subcategory: 'Women', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400'], rating: 4.8, reviewCount: 214, tags: ['kurta', 'cotton', 'ethnic', 'women', 'traditional'], createdAt: '2024-02-05', views: 2100, sold: 178 },
  { id: 'p5', sellerId: 'seller2', sellerName: 'Priya Fashion Store', sellerLocation: 'Bangalore', name: 'Men\'s Slim Fit Chinos', description: 'Premium stretch chino pants for men. Wrinkle-resistant fabric, modern slim fit. Great for office and casual outings.', price: 1599, stock: 60, category: 'Fashion', subcategory: 'Men', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], rating: 4.5, reviewCount: 89, tags: ['chinos', 'men', 'slim fit', 'pants', 'casual'], createdAt: '2024-02-07', views: 980, sold: 112 },
  { id: 'p6', sellerId: 'seller2', sellerName: 'Priya Fashion Store', sellerLocation: 'Bangalore', name: 'Running Shoes Ultralight', description: 'Lightweight breathable mesh running shoes with cushioned sole and anti-slip grip. Ideal for gym, jogging and sports.', price: 2199, stock: 30, category: 'Sports', subcategory: 'Fitness', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], rating: 4.6, reviewCount: 156, tags: ['running shoes', 'sports', 'ultralight', 'mesh', 'gym'], createdAt: '2024-02-12', views: 1750, sold: 145 },
  { id: 'p7', sellerId: 'seller3', sellerName: 'Green Grocers', sellerLocation: 'Pune', name: 'Organic Mixed Nuts 500g', description: 'Premium selection of organic almonds, cashews, walnuts and pistachios. No preservatives. Rich in protein and healthy fats.', price: 899, stock: 200, category: 'Food & Grocery', subcategory: 'Organic', images: ['https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400'], rating: 4.9, reviewCount: 312, tags: ['nuts', 'organic', 'almonds', 'cashews', 'healthy'], createdAt: '2024-02-15', views: 3200, sold: 298 },
  { id: 'p8', sellerId: 'seller3', sellerName: 'Green Grocers', sellerLocation: 'Pune', name: 'Cold-Pressed Coconut Oil 1L', description: 'Pure virgin cold-pressed coconut oil. Ideal for cooking, hair care and skin moisturization. Chemical-free.', price: 549, stock: 150, category: 'Food & Grocery', subcategory: 'Organic', images: ['https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400'], rating: 4.7, reviewCount: 198, tags: ['coconut oil', 'cold pressed', 'organic', 'hair care', 'cooking'], createdAt: '2024-02-18', views: 1890, sold: 187 },
  { id: 'p9', sellerId: 'seller1', sellerName: 'Ravi Electronics Hub', sellerLocation: 'Delhi', name: 'Mechanical Gaming Keyboard RGB', description: 'Full RGB mechanical keyboard with blue switches. Anti-ghosting, N-Key rollover. Built for gamers and coders.', price: 3499, stock: 25, category: 'Electronics', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'], rating: 4.7, reviewCount: 93, tags: ['keyboard', 'mechanical', 'gaming', 'rgb', 'blue switch'], createdAt: '2024-03-01', views: 1100, sold: 47 },
  { id: 'p10', sellerId: 'seller2', sellerName: 'Priya Fashion Store', sellerLocation: 'Bangalore', name: 'Handwoven Silk Saree', description: 'Exquisite Banarasi silk saree with zari work. Traditional design for weddings and special occasions.', price: 8999, stock: 15, category: 'Fashion', subcategory: 'Women', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'], rating: 4.9, reviewCount: 67, tags: ['saree', 'silk', 'banarasi', 'wedding', 'traditional'], createdAt: '2024-03-05', views: 890, sold: 23 },
];

const SEED_REVIEWS: Review[] = [
  { id: 'r1', productId: 'p1', userId: 'buyer1', userName: 'Arjun Kumar', rating: 5, comment: 'Excellent sound quality! Battery lasts all day. Very comfortable for long hours.', createdAt: '2024-03-10' },
  { id: 'r2', productId: 'p1', userId: 'u2', userName: 'Sneha Patel', rating: 4, comment: 'Great product but the noise cancellation could be better at lower prices.', createdAt: '2024-03-12' },
  { id: 'r3', productId: 'p4', userId: 'buyer1', userName: 'Arjun Kumar', rating: 5, comment: 'Beautiful embroidery, perfect fit. Will buy again!', createdAt: '2024-03-15' },
  { id: 'r4', productId: 'p7', userId: 'buyer1', userName: 'Arjun Kumar', rating: 5, comment: 'Freshest nuts I\'ve had! Delivery was quick.', createdAt: '2024-03-20' },
];

const SEED_ORDERS: Order[] = [
  { id: 'ord1', buyerId: 'buyer1', buyerName: 'Arjun Kumar', sellerId: 'seller1', items: [{ productId: 'p1', productName: 'Wireless Bluetooth Headphones Pro', price: 2999, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }], total: 2999, commission: 300, vendorEarnings: 2699, status: 'delivered', address: { id: 'a1', userId: 'buyer1', label: 'Home', street: '42 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true }, paymentId: 'pay_test_001', createdAt: '2024-03-08', updatedAt: '2024-03-12' },
  { id: 'ord2', buyerId: 'buyer1', buyerName: 'Arjun Kumar', sellerId: 'seller2', items: [{ productId: 'p4', productName: 'Classic Cotton Kurta Set', price: 1299, quantity: 2, image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400' }], total: 2598, commission: 260, vendorEarnings: 2338, status: 'shipped', address: { id: 'a1', userId: 'buyer1', label: 'Home', street: '42 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true }, paymentId: 'pay_test_002', createdAt: '2024-03-18', updatedAt: '2024-03-19' },
  { id: 'ord3', buyerId: 'buyer1', buyerName: 'Arjun Kumar', sellerId: 'seller3', items: [{ productId: 'p7', productName: 'Organic Mixed Nuts 500g', price: 899, quantity: 3, image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400' }], total: 2697, commission: 270, vendorEarnings: 2427, status: 'placed', address: { id: 'a1', userId: 'buyer1', label: 'Home', street: '42 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true }, paymentId: 'pay_test_003', createdAt: '2024-03-22', updatedAt: '2024-03-22' },
];

const SEED_ADDRESSES: Address[] = [
  { id: 'a1', userId: 'buyer1', label: 'Home', street: '42 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true },
  { id: 'a2', userId: 'buyer1', label: 'Office', street: 'Bandra Kurla Complex, Tower B', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', isDefault: false },
];

// Lazy-load Firebase service to avoid SSR issues
async function fb() {
  const mod = await import('./firebaseService');
  return mod;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      users: SEED_USERS,
      addUser: (user) => {
        set((s) => ({ users: [...s.users, user] }));
        fb().then(m => m.createUser(user)).catch(console.error);
      },

      products: SEED_PRODUCTS,
      addProduct: (p) => {
        set((s) => ({ products: [...s.products, p] }));
        fb().then(m => m.createProduct(p)).catch(console.error);
      },
      updateProduct: (id, updates) => {
        set((s) => ({ products: s.products.map(p => p.id === id ? { ...p, ...updates } : p) }));
        fb().then(m => m.updateProduct(id, updates)).catch(console.error);
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter(p => p.id !== id) }));
        fb().then(m => m.deleteProduct(id)).catch(console.error);
      },

      categories: SEED_CATEGORIES,
      addCategory: (c) => {
        set((s) => ({ categories: [...s.categories, c] }));
        fb().then(m => m.createCategory(c)).catch(console.error);
      },
      updateCategory: (id, updates) => {
        set((s) => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c) }));
        fb().then(m => m.updateCategory(id, updates)).catch(console.error);
      },

      reviews: SEED_REVIEWS,
      addReview: (r) => {
        set((s) => ({ reviews: [...s.reviews, r] }));
        fb().then(m => m.createReview(r)).catch(console.error);
      },

      cart: [],
      addToCart: (item) => {
        set((s) => {
          const existing = s.cart.find(c => c.productId === item.productId);
          const newCart = existing
            ? s.cart.map(c => c.productId === item.productId ? { ...c, quantity: c.quantity + item.quantity } : c)
            : [...s.cart, item];
          const userId = s.currentUser?.id;
          if (userId) fb().then(m => m.saveCart(userId, newCart)).catch(console.error);
          return { cart: newCart };
        });
      },
      removeFromCart: (productId) => {
        set((s) => {
          const newCart = s.cart.filter(c => c.productId !== productId);
          const userId = s.currentUser?.id;
          if (userId) fb().then(m => m.saveCart(userId, newCart)).catch(console.error);
          return { cart: newCart };
        });
      },
      updateCartQty: (productId, qty) => {
        set((s) => {
          const newCart = s.cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c);
          const userId = s.currentUser?.id;
          if (userId) fb().then(m => m.saveCart(userId, newCart)).catch(console.error);
          return { cart: newCart };
        });
      },
      clearCart: () => {
        const userId = get().currentUser?.id;
        if (userId) fb().then(m => m.saveCart(userId, [])).catch(console.error);
        set({ cart: [] });
      },

      wishlist: [],
      toggleWishlist: (productId) => {
        set((s) => {
          const newWishlist = s.wishlist.includes(productId)
            ? s.wishlist.filter(id => id !== productId)
            : [...s.wishlist, productId];
          const userId = s.currentUser?.id;
          if (userId) fb().then(m => m.saveWishlist(userId, newWishlist)).catch(console.error);
          return { wishlist: newWishlist };
        });
      },

      addresses: SEED_ADDRESSES,
      addAddress: (a) => {
        set((s) => ({ addresses: [...s.addresses, a] }));
        fb().then(m => m.createAddress(a)).catch(console.error);
      },
      setDefaultAddress: (id) => {
        set((s) => {
          const newAddresses = s.addresses.map(a => ({ ...a, isDefault: a.id === id }));
          const userId = s.currentUser?.id;
          if (userId) fb().then(m => m.setDefaultAddress(userId, id, s.addresses)).catch(console.error);
          return { addresses: newAddresses };
        });
      },

      orders: SEED_ORDERS,
      addOrder: (o) => {
        set((s) => ({ orders: [...s.orders, o] }));
        fb().then(m => m.createOrder(o)).catch(console.error);
      },
      updateOrderStatus: (id, status, reason) => {
        set((s) => ({
          orders: s.orders.map(o => o.id === id
            ? { ...o, status, refundReason: reason || o.refundReason, updatedAt: new Date().toISOString() }
            : o
          ),
        }));
        fb().then(m => m.updateOrderStatus(id, status, reason)).catch(console.error);
      },

      vendors: SEED_VENDORS,
      addVendor: (v) => {
        set((s) => ({ vendors: [...s.vendors, v] }));
        fb().then(m => m.createVendor(v)).catch(console.error);
      },
      updateVendorStatus: (id, status) => {
        set((s) => ({ vendors: s.vendors.map(v => v.id === id ? { ...v, status } : v) }));
        fb().then(m => m.updateVendorStatus(id, status)).catch(console.error);
      },
      updateVendor: (id, updates) => {
        set((s) => ({ vendors: s.vendors.map(v => v.id === id ? { ...v, ...updates } : v) }));
        fb().then(m => m.updateVendor(id, updates)).catch(console.error);
      },

      notifications: [
        { id: 'n1', userId: 'seller1', title: 'New Order Received', message: 'You have a new order #ord1 for ₹2,999', read: false, createdAt: '2024-03-08', type: 'order' },
        { id: 'n2', userId: 'buyer1', title: 'Order Shipped', message: 'Your order #ord2 has been shipped!', read: false, createdAt: '2024-03-19', type: 'order' },
        { id: 'n3', userId: 'seller1', title: 'Low Stock Alert', message: 'USB-C Hub is low on stock (3 remaining)', read: false, createdAt: '2024-03-20', type: 'low_stock' },
      ],
      addNotification: (n) => {
        set((s) => ({ notifications: [n, ...s.notifications] }));
        fb().then(m => m.createNotification(n)).catch(console.error);
      },
      markNotificationRead: (id) => {
        set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
        fb().then(m => m.markNotificationRead(id)).catch(console.error);
      },

      commissionRate: 10,
      setCommissionRate: (rate) => {
        set({ commissionRate: rate });
        fb().then(m => m.saveCommissionRate(rate)).catch(console.error);
      },

      browsingHistory: [],
      addToBrowsingHistory: (productId) => set((s) => ({
        browsingHistory: [productId, ...s.browsingHistory.filter(id => id !== productId)].slice(0, 20),
      })),
    }),
    { name: 'vendorhub-store' }
  )
);

