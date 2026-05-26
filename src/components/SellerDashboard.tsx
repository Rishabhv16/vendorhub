'use client';
import { useStore, Product } from '@/lib/store';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Package, DollarSign, ShoppingBag, AlertTriangle, Edit, Trash2, Check, X, TrendingUp, Truck, Sparkles, Loader2, Wand2 } from 'lucide-react';

type Tab = 'overview' | 'products' | 'orders' | 'payouts';

export default function SellerDashboard() {
  const { currentUser, products, orders, vendors, updateOrderStatus, addProduct, updateProduct, deleteProduct, addNotification, commissionRate, categories } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const vendor = vendors.find(v => v.userId === currentUser?.id);
  const myProducts = products.filter(p => p.sellerId === currentUser?.id);
  const myOrders = orders.filter(o => o.sellerId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalRevenue = myOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.vendorEarnings, 0);
  const weekOrders = myOrders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
  const lowStock = myProducts.filter(p => p.stock <= 5 && p.stock > 0);
  const topProducts = [...myProducts].sort((a, b) => b.sold - a.sold).slice(0, 5);

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const revenue = myOrders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((s, o) => s + o.vendorEarnings, 0);
    return { day: label, revenue };
  });

  const isApproved = vendor?.status === 'approved';

  if (!isApproved) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            {vendor?.status === 'pending' ? 'Application Under Review' : 'Application Rejected'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {vendor?.status === 'pending'
              ? 'Your vendor application is being reviewed by admin. You\'ll be notified once approved.'
              : 'Your application was not approved. Please contact support.'}
          </p>
          {!vendor && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No vendor profile found. Please register as a vendor first.</p>}
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'products', label: `Products (${myProducts.length})`, icon: <Package size={16} /> },
    { id: 'orders', label: `Orders (${myOrders.length})`, icon: <ShoppingBag size={16} /> },
    { id: 'payouts', label: 'Payouts', icon: <DollarSign size={16} /> },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.25rem' }}>{vendor?.businessName}</h1>
          <p style={{ color: 'var(--text-muted)' }}>📍 {vendor?.location} · <span className="badge badge-success">✓ Approved Vendor</span></p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddProduct(true)}><Plus size={16} /> Add Product</button>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--surface)', borderRadius: 12, padding: '0.4rem', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: tab === t.id ? 'var(--gradient)' : 'transparent', color: tab === t.id ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', fontFamily: 'inherit' }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="stats-grid stats-grid-4">
            {[
              { label: 'Total Earnings', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign size={20} />, color: '#10B981' },
              { label: 'Total Orders', value: myOrders.length, icon: <ShoppingBag size={20} />, color: '#6C3EF4' },
              { label: 'This Week', value: weekOrders.length + ' orders', icon: <TrendingUp size={20} />, color: '#F59E0B' },
              { label: 'Products', value: myProducts.length, icon: <Package size={20} />, color: '#EC4899' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ color: s.color, marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {lowStock.length > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={16} color="#F59E0B" />
                <span style={{ fontWeight: 700, color: '#F59E0B' }}>Low Stock Alert ({lowStock.length})</span>
              </div>
              {lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>{p.name}</span><span style={{ color: '#F59E0B', fontWeight: 600 }}>{p.stock} left</span>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Revenue This Week</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="url(#grad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C3EF4" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Top Selling Products</h3>
            {topProducts.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', minWidth: 20 }}>#{i + 1}</span>
                <img src={p.images[0]} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                  onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=40&background=232142&color=8B5CF6`; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.sold} sold · ₹{p.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="progress-bar" style={{ width: 100 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, (p.sold / (topProducts[0]?.sold || 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Rating</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={p.images[0]} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                          onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=44&background=232142&color=8B5CF6`; }} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{p.category}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ color: p.stock === 0 ? 'var(--danger)' : p.stock <= 5 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                        {p.stock === 0 ? 'Out' : p.stock}
                        {p.stock <= 5 && p.stock > 0 && ' ⚠️'}
                      </span>
                    </td>
                    <td>{p.sold}</td>
                    <td>⭐ {p.rating}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setEditProduct(p)}><Edit size={12} /></button>
                        <button className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { if (confirm('Delete product?')) deleteProduct(p.id); }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {myProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Package size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No products yet. <button className="btn-primary" style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setShowAddProduct(true)}>Add your first product</button></p>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Order ID</th><th>Buyer</th><th>Items</th><th>Total</th><th>Earnings</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {myOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>#{o.id.slice(-8)}</td>
                  <td>{o.buyerName}</td>
                  <td>{o.items.length} item(s)</td>
                  <td style={{ fontWeight: 600 }}>₹{o.total.toLocaleString('en-IN')}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{o.vendorEarnings.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'shipped' ? 'badge-primary' : o.status === 'confirmed' ? 'badge-warning' : 'badge-muted'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {o.status === 'placed' && (
                      <button className="btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { updateOrderStatus(o.id, 'confirmed'); addNotification({ id: `n_${Date.now()}`, userId: o.buyerId, title: 'Order Confirmed!', message: `Your order #${o.id} has been confirmed.`, read: false, createdAt: new Date().toISOString(), type: 'order' }); }}>
                        <Check size={12} /> Confirm
                      </button>
                    )}
                    {o.status === 'confirmed' && (
                      <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { updateOrderStatus(o.id, 'shipped'); addNotification({ id: `n_${Date.now()}`, userId: o.buyerId, title: 'Order Shipped!', message: `Your order #${o.id} is on its way!`, read: false, createdAt: new Date().toISOString(), type: 'order' }); }}>
                        <Truck size={12} /> Ship
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myOrders.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders yet.</p>}
        </div>
      )}

      {/* Payouts */}
      {tab === 'payouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="stats-grid stats-grid-3">
            <div className="stat-card">
              <div style={{ color: 'var(--success)' }}><DollarSign size={20} /></div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Earnings (after {commissionRate}% commission)</div>
            </div>
            <div className="stat-card">
              <div style={{ color: 'var(--warning)' }}><DollarSign size={20} /></div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)' }}>₹{myOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.commission, 0).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform Commission ({commissionRate}%)</div>
            </div>
            <div className="stat-card">
              <div style={{ color: 'var(--primary-light)' }}><DollarSign size={20} /></div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-light)' }}>{vendor?.payoutHistory.length || 0}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Payouts Received</div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Payout History</h3>
            {(vendor?.payoutHistory || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No payouts yet.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Payout ID</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {vendor?.payoutHistory.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                      <td>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                      <td><span className="badge badge-success">{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editProduct) && (
        <ProductFormModal
          product={editProduct}
          categories={categories.map(c => c.name)}
          sellerId={currentUser!.id}
          sellerName={vendor!.businessName}
          sellerLocation={vendor!.location}
          commissionRate={commissionRate}
          allProducts={products}
          onSave={(data) => {
            if (editProduct) {
              updateProduct(editProduct.id, data);
            } else {
              addProduct({ id: `p_${Date.now()}`, ...data, rating: 0, reviewCount: 0, views: 0, sold: 0, createdAt: new Date().toISOString() } as Product);
            }
            setShowAddProduct(false); setEditProduct(null);
          }}
          onClose={() => { setShowAddProduct(false); setEditProduct(null); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, categories, sellerId, sellerName, sellerLocation, commissionRate, allProducts, onSave, onClose }: {
  product: Product | null; categories: string[]; sellerId: string; sellerName: string; sellerLocation: string; commissionRate: number;
  allProducts: Product[];
  onSave: (data: Partial<Product>) => void; onClose: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [stock, setStock] = useState(String(product?.stock || ''));
  const [category, setCategory] = useState(product?.category || categories[0]);
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images?.length ? product.images : ['']);
  const [tags, setTags] = useState(product?.tags?.join(', ') || '');

  // Real AI states
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState<{ recommended: number; min: number; max: number; rationale: string } | null>(null);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [aiDescLoading, setAiDescLoading] = useState(false);

  const fetchAiPrice = async () => {
    if (!name || !category) return;
    setAiPriceLoading(true);
    try {
      const res = await fetch('/api/ai/price-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name, category, description, existingProducts: allProducts }),
      });
      const data = await res.json();
      if (data.recommended) {
        setAiPriceSuggestion(data);
        setPrice(String(data.recommended));
      }
    } catch (e) { console.error(e); }
    setAiPriceLoading(false);
  };

  const fetchAiDescription = async () => {
    if (!name) return;
    setAiDescLoading(true);
    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: name, category, keyFeatures: tags }),
      });
      const data = await res.json();
      if (data.description) setDescription(data.description);
    } catch (e) { console.error(e); }
    setAiDescLoading(false);
  };

  const handleSave = () => {
    if (!name || !price || !stock) return;
    const validImages = imageUrls.filter(u => u.trim());
    onSave({
      name, description, price: Number(price), stock: Number(stock),
      category, subcategory,
      images: validImages.length ? validImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      sellerId, sellerName, sellerLocation,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Product Name *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter product name" /></div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Description</label>
              <button onClick={fetchAiDescription} disabled={!name || aiDescLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: '#6C3EF4', background: 'rgba(108,62,244,0.08)', border: '1px solid rgba(108,62,244,0.2)', borderRadius: 8, padding: '0.25rem 0.6rem', cursor: 'pointer' }}>
                {aiDescLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={12} />} AI Write
              </button>
            </div>
            <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product or click 'AI Write'..." style={{ minHeight: 80, resize: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Price (₹) *</label>
                <button onClick={fetchAiPrice} disabled={!name || aiPriceLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '0.25rem 0.6rem', cursor: 'pointer' }}>
                  {aiPriceLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />} AI Price
                </button>
              </div>
              <input className="input" type="number" value={price} onChange={e => { setPrice(e.target.value); setAiPriceSuggestion(null); }} placeholder="0" />
              {aiPriceSuggestion && (
                <div style={{ marginTop: '0.5rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '0.6rem 0.75rem', fontSize: '0.78rem' }}>
                  <p style={{ color: '#10B981', fontWeight: 700, marginBottom: '0.2rem' }}>🤖 AI Price Analysis</p>
                  <p style={{ color: 'var(--text-muted)' }}>Range: ₹{aiPriceSuggestion.min} – ₹{aiPriceSuggestion.max}</p>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{aiPriceSuggestion.rationale}</p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {[aiPriceSuggestion.min, aiPriceSuggestion.recommended, aiPriceSuggestion.max].map((v, i) => (
                      <button key={i} onClick={() => setPrice(String(v))} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 6, border: '1px solid #10B981', background: price === String(v) ? '#10B981' : 'transparent', color: price === String(v) ? '#fff' : '#10B981', cursor: 'pointer', fontWeight: 600 }}>
                        {i === 0 ? 'Min' : i === 1 ? 'Best' : 'Max'} ₹{v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Stock *</label>
              <input className="input" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Subcategory</label>
              <input className="input" value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="e.g. Mobiles" /></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Product Images (up to 4)</label>
              {imageUrls.length < 4 && (
                <button type="button" onClick={() => setImageUrls([...imageUrls, ''])} style={{ fontSize: '0.75rem', color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 600 }}>+ Add Image</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {imageUrls.map((url, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {url && <img src={url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none'; }} />}
                  <input className="input" style={{ flex: 1 }} value={url} onChange={e => { const n = [...imageUrls]; n[i] = e.target.value; setImageUrls(n); }} placeholder={`Image ${i + 1} URL (https://...)`} />
                  {imageUrls.length > 1 && (
                    <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))} style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#EF4444' }}><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            {imageUrls.filter(u => u.trim()).length > 1 && (
              <p style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.4rem' }}>✓ {imageUrls.filter(u => u.trim()).length} images — buyers can swipe through all of them</p>
            )}
          </div>
          <div><label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Tags (comma separated)</label>
            <input className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="wireless, bluetooth, audio..." /></div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>{product ? 'Save Changes' : 'Add Product'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
