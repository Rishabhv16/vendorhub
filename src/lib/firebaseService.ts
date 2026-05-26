/**
 * Firebase Firestore service layer
 * Every collection maps 1:1 to our Zustand types.
 * All mutations write to Firestore; the app reads from Firestore on boot.
 */
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc,
  addDoc, deleteDoc, onSnapshot, query, where,
  serverTimestamp, writeBatch, DocumentData, Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User, Product, Order, Vendor, Review, Category,
  Address, Notification, CartItem, OrderStatus, VendorStatus,
} from './store';

// ─── helpers ────────────────────────────────────────────────────────────────
const col = (name: string) => collection(db, name);
const ref = (name: string, id: string) => doc(db, name, id);

function toObj<T>(snap: DocumentData): T {
  return { id: snap.id, ...snap.data() } as T;
}

// ─── SEED ────────────────────────────────────────────────────────────────────
/** Seeds Firestore with initial data only if it's empty */
export async function seedIfEmpty(
  users: User[],
  products: Product[],
  vendors: Vendor[],
  categories: Category[],
  orders: Order[],
  reviews: Review[],
  addresses: Address[],
): Promise<void> {
  const snap = await getDocs(col('products'));
  if (!snap.empty) return; // already seeded

  const batch = writeBatch(db);

  users.forEach(u => batch.set(ref('users', u.id), u));
  products.forEach(p => batch.set(ref('products', p.id), p));
  vendors.forEach(v => batch.set(ref('vendors', v.id), v));
  categories.forEach(c => batch.set(ref('categories', c.id), c));
  orders.forEach(o => batch.set(ref('orders', o.id), o));
  reviews.forEach(r => batch.set(ref('reviews', r.id), r));
  addresses.forEach(a => batch.set(ref('addresses', a.id), a));

  await batch.commit();
  console.log('✅ Firestore seeded with initial data');
}

// ─── FETCH ALL ───────────────────────────────────────────────────────────────
export async function fetchAll<T>(colName: string): Promise<T[]> {
  const snap = await getDocs(col(colName));
  return snap.docs.map(d => toObj<T>(d));
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export async function createUser(user: User): Promise<void> {
  await setDoc(ref('users', user.id), user);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(col('users'), where('email', '==', email.toLowerCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toObj<User>(snap.docs[0]);
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export async function createProduct(product: Product): Promise<void> {
  await setDoc(ref('products', product.id), product);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await updateDoc(ref('products', id), updates as DocumentData);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(ref('products', id));
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export async function createOrder(order: Order): Promise<void> {
  await setDoc(ref('orders', order.id), order);
}

export async function updateOrderStatus(id: string, status: OrderStatus, refundReason?: string): Promise<void> {
  const updates: DocumentData = { status, updatedAt: new Date().toISOString() };
  if (refundReason) updates.refundReason = refundReason;
  await updateDoc(ref('orders', id), updates);
}

// ─── VENDORS ─────────────────────────────────────────────────────────────────
export async function createVendor(vendor: Vendor): Promise<void> {
  await setDoc(ref('vendors', vendor.id), vendor);
}

export async function updateVendorStatus(id: string, status: VendorStatus): Promise<void> {
  await updateDoc(ref('vendors', id), { status });
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<void> {
  await updateDoc(ref('vendors', id), updates as DocumentData);
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export async function createReview(review: Review): Promise<void> {
  await setDoc(ref('reviews', review.id), review);
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export async function createCategory(category: Category): Promise<void> {
  await setDoc(ref('categories', category.id), category);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await updateDoc(ref('categories', id), updates as DocumentData);
}

// ─── ADDRESSES ───────────────────────────────────────────────────────────────
export async function createAddress(address: Address): Promise<void> {
  await setDoc(ref('addresses', address.id), address);
}

export async function setDefaultAddress(userId: string, addressId: string, allAddresses: Address[]): Promise<void> {
  const batch = writeBatch(db);
  allAddresses.filter(a => a.userId === userId).forEach(a => {
    batch.update(ref('addresses', a.id), { isDefault: a.id === addressId });
  });
  await batch.commit();
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export async function createNotification(n: Notification): Promise<void> {
  await setDoc(ref('notifications', n.id), n);
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(ref('notifications', id), { read: true });
}

// ─── CART (per-user sub-documents) ───────────────────────────────────────────
export async function saveCart(userId: string, cart: CartItem[]): Promise<void> {
  await setDoc(ref('carts', userId), { items: cart });
}

export async function fetchCart(userId: string): Promise<CartItem[]> {
  const snap = await getDoc(ref('carts', userId));
  if (!snap.exists()) return [];
  return (snap.data() as { items: CartItem[] }).items || [];
}

// ─── WISHLIST (per-user sub-documents) ───────────────────────────────────────
export async function saveWishlist(userId: string, wishlist: string[]): Promise<void> {
  await setDoc(ref('wishlists', userId), { items: wishlist });
}

export async function fetchWishlist(userId: string): Promise<string[]> {
  const snap = await getDoc(ref('wishlists', userId));
  if (!snap.exists()) return [];
  return (snap.data() as { items: string[] }).items || [];
}

// ─── COMMISSION ──────────────────────────────────────────────────────────────
export async function saveCommissionRate(rate: number): Promise<void> {
  await setDoc(ref('settings', 'platform'), { commissionRate: rate });
}

export async function fetchCommissionRate(): Promise<number> {
  const snap = await getDoc(ref('settings', 'platform'));
  if (!snap.exists()) return 10;
  return (snap.data() as { commissionRate: number }).commissionRate || 10;
}

// ─── REAL-TIME LISTENERS ─────────────────────────────────────────────────────
export function subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(col('orders'), snap => {
    callback(snap.docs.map(d => toObj<Order>(d)));
  });
}

export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): Unsubscribe {
  const q = query(col('notifications'), where('userId', '==', userId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => toObj<Notification>(d)));
  });
}

export function subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
  return onSnapshot(col('products'), snap => {
    callback(snap.docs.map(d => toObj<Product>(d)));
  });
}

export function subscribeToVendors(callback: (vendors: Vendor[]) => void): Unsubscribe {
  return onSnapshot(col('vendors'), snap => {
    callback(snap.docs.map(d => toObj<Vendor>(d)));
  });
}
