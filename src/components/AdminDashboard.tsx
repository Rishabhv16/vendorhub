'use client';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Check, X, Users, Package, ShoppingBag, DollarSign, Settings, Shield, RotateCcw } from 'lucide-react';

type Tab = 'overview' | 'vendors' | 'orders' | 'categories' | 'refunds' | 'settings';

const COLORS = ['#6C3EF4', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'];

export default function AdminDashboard() {
  const { vendors, updateVendorStatus, orders, products, users, categories, addCategory, updateCategory, commissionRate, setCommissionRate, updateOrderStatus, addNotification } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCommission, setNewCommission] = useState(String(commissionRate));
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [newSubcat, setNewSubcat] = useState('');
  const [vendorFilter, setVendorFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedVendor, setSelectedVendor] = useState<typeof vendors[0] | null>(null);

  const totalSales = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const totalCommission = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.commission, 0);
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const refundRequests = orders.filter(o => o.status === 'refund_requested');

  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: products.filter(p => p.category === cat.name).length,
  })).filter(c => c.value > 0);

  const topVendors = [...vendors].filter(v => v.status === 'approved').sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const revenue = orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString() && o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
    return { day: label, revenue };
  });

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Shield size={15} /> },
    { id: 'vendors', label: 'Vendors', icon: <Users size={15} />, badge: pendingVendors.length },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={15} /> },
    { id: 'refunds', label: 'Refunds', icon: <RotateCcw size={15} />, badge: refundRequests.length },
    { id: 'categories', label: 'Categories', icon: <Package size={15} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Platform-wide management and analytics</p>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', background: 'var(--surface)', borderRadius: 12, padding: '0.4rem', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: 8, border: 'none', background: tab === t.id ? 'var(--gradient)' : 'transparent', color: tab === t.id ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s', fontFamily: 'inherit', whiteSpace: 'nowrap', position: 'relative' }}>
            {t.icon}{t.label}
            {t.badge ? <span style={{ background: 'var(--danger)', color: 'white', fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="stats-grid stats-grid-4">
            {[
              { label: 'Total Sales', value: `₹${totalSales.toLocaleString('en-IN')}`, icon: <DollarSign size={20} />, color: '#10B981' },
              { label: 'Platform Commission', value: `₹${totalCommission.toLocaleString('en-IN')}`, icon: <DollarSign size={20} />, color: '#F59E0B' },
              { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={20} />, color: '#6C3EF4' },
              { label: 'Active Vendors', value: vendors.filter(v => v.status === 'approved').length, icon: <Users size={20} />, color: '#EC4899' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ color: s.color }}>{s.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Platform Revenue (7 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByDay}>
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="url(#grad2)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C3EF4" /><stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Products by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 } as any} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Top Vendors</h3>
            <table className="table">
              <thead><tr><th>Vendor</th><th>Category</th><th>Location</th><th>Revenue</th><th>Orders</th><th>Rating</th></tr></thead>
              <tbody>
                {topVendors.map((v, i) => (
                  <tr key={v.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--text-muted)', marginRight: 8 }}>#{i + 1}</span>{v.businessName}</td>
                    <td><span className="badge badge-primary">{v.category}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{v.location}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{v.totalRevenue.toLocaleString('en-IN')}</td>
                    <td>{v.totalOrders}</td>
                    <td>⭐ {v.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ VENDOR MANAGEMENT ═══════════════════════════════════ */}
      {tab === 'vendors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {([
              { label: 'Pending', filter: 'pending' as const, color: '#F59E0B', bg: '#FEF3C7' },
              { label: 'Approved', filter: 'approved' as const, color: '#10B981', bg: '#D1FAE5' },
              { label: 'Rejected', filter: 'rejected' as const, color: '#EF4444', bg: '#FEE2E2' },
              { label: 'All', filter: 'all' as const, color: '#6C3EF4', bg: '#EDE9FE' },
            ] as const).map(s => {
              const count = s.filter === 'all' ? vendors.length : vendors.filter(v => v.status === s.filter).length;
              return (
                <button key={s.filter} onClick={() => setVendorFilter(s.filter)} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, border: `2px solid ${vendorFilter === s.filter ? s.color : 'transparent'}`, background: s.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', transition: 'all 0.2s', minWidth: 90 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{count}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: s.color }}>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Vendor cards list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {vendors
              .filter(v => vendorFilter === 'all' || v.status === vendorFilter)
              .sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (b.status === 'pending' && a.status !== 'pending') return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map(v => {
                const user = users.find(u => u.id === v.userId);
                const vendorProducts = products.filter(p => p.sellerId === v.userId);
                const vendorOrders = orders.filter(o => o.sellerId === v.userId);
                return (
                  <div key={v.id} style={{ background: '#FFFFFF', border: `1px solid ${v.status === 'pending' ? '#FCD34D' : v.status === 'rejected' ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    {v.status === 'pending' && (
                      <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FCD34D', padding: '0.4rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                        <span style={{ color: '#92400E', fontWeight: 600, fontSize: '0.8rem' }}>AWAITING REVIEW — submitted {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: v.status === 'pending' ? '#FEF3C7' : v.status === 'approved' ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>🏪</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{v.businessName}</h4>
                              <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>{user?.name} · {user?.email}</p>
                            </div>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: v.status === 'approved' ? '#D1FAE5' : v.status === 'pending' ? '#FEF3C7' : '#FEE2E2', color: v.status === 'approved' ? '#065F46' : v.status === 'pending' ? '#92400E' : '#991B1B', flexShrink: 0 }}>{v.status.toUpperCase()}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.35rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>📍 <strong>{v.location}</strong></span>
                            <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>🏷️ <strong>{v.category}</strong></span>
                            <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>📦 <strong>{vendorProducts.length}</strong> products</span>
                            <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>🛒 <strong>{vendorOrders.length}</strong> orders</span>
                            {v.gstNumber && <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>GST: <strong>{v.gstNumber}</strong></span>}
                          </div>
                          {v.description && <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '0.4rem', fontStyle: 'italic' }}>"{v.description}"</p>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                          <button onClick={() => setSelectedVendor(v)} style={{ padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151', fontFamily: 'inherit' }}>View Details</button>
                          {v.status !== 'approved' && (
                            <button onClick={() => { updateVendorStatus(v.id, 'approved'); addNotification({ id: `n_${Date.now()}`, userId: v.userId, title: '🎉 Vendor Approved!', message: `Your vendor application for "${v.businessName}" has been approved!`, read: false, createdAt: new Date().toISOString(), type: 'vendor' }); }} style={{ padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: '#10B981', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#fff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><Check size={14} /> Approve</button>
                          )}
                          {v.status !== 'rejected' && (
                            <button onClick={() => { updateVendorStatus(v.id, 'rejected'); addNotification({ id: `n_${Date.now()}`, userId: v.userId, title: 'Application Update', message: `Your application for "${v.businessName}" was not approved at this time.`, read: false, createdAt: new Date().toISOString(), type: 'vendor' }); }} style={{ padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: '#EF4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#fff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><X size={14} /> Reject</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }
            {vendors.filter(v => vendorFilter === 'all' || v.status === vendorFilter).length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#F9FAFB', borderRadius: 16, color: '#9CA3AF' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</p>
                <p style={{ fontWeight: 600 }}>No {vendorFilter === 'all' ? '' : vendorFilter} vendors</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ VENDOR DETAIL MODAL ═══════════════════════════════════ */}
      {selectedVendor && (() => {
        const v = selectedVendor;
        const user = users.find(u => u.id === v.userId);
        const vendorProducts = products.filter(p => p.sellerId === v.userId);
        const vendorOrders = orders.filter(o => o.sellerId === v.userId);
        const delivered = vendorOrders.filter(o => o.status === 'delivered');
        return (
          <div className="modal-overlay" onClick={() => setSelectedVendor(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 660, padding: 0, overflow: 'hidden' }}>
              <div style={{ background: v.status === 'pending' ? '#FFFBEB' : v.status === 'approved' ? '#F0FDF4' : '#FFF1F2', padding: '1.5rem 2rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111827' }}>{v.businessName}</h2>
                  <span style={{ padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: v.status === 'approved' ? '#D1FAE5' : v.status === 'pending' ? '#FEF3C7' : '#FEE2E2', color: v.status === 'approved' ? '#065F46' : v.status === 'pending' ? '#92400E' : '#991B1B' }}>{v.status.toUpperCase()}</span>
                </div>
                <button onClick={() => setSelectedVendor(null)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
              </div>
              <div style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <section>
                  <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Owner Information</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {([{ label: 'Full Name', val: user?.name }, { label: 'Email', val: user?.email }, { label: 'Phone', val: user?.phone || 'Not provided' }, { label: 'Registered', val: new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }] as {label:string,val:string|undefined}[]).map(item => (
                      <div key={item.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '0.75rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.2rem' }}>{item.label}</p>
                        <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem', wordBreak: 'break-all' }}>{item.val || '—'}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Business Details (Registration)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {([{ label: 'Business Name', val: v.businessName }, { label: 'Category', val: v.category }, { label: 'Location', val: v.location }, { label: 'GST Number', val: v.gstNumber || 'Not provided' }, { label: 'Bank Account', val: v.bankAccount ? `****${v.bankAccount.slice(-4)}` : 'Not provided' }, { label: 'Applied On', val: new Date(v.createdAt).toLocaleDateString('en-IN') }] as {label:string,val:string}[]).map(item => (
                      <div key={item.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '0.75rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.2rem' }}>{item.label}</p>
                        <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                  {v.description && (
                    <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '0.75rem', marginTop: '0.75rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.2rem' }}>Business Description</p>
                      <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.5 }}>{v.description}</p>
                    </div>
                  )}
                </section>
                <section>
                  <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Platform Activity</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {([{ label: 'Products', val: vendorProducts.length, color: '#6C3EF4' }, { label: 'Total Orders', val: vendorOrders.length, color: '#3B82F6' }, { label: 'Delivered', val: delivered.length, color: '#10B981' }, { label: 'Revenue', val: `₹${v.totalRevenue.toLocaleString('en-IN')}`, color: '#F59E0B' }] as {label:string,val:string|number,color:string}[]).map(s => (
                      <div key={s.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.val}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </section>
                {vendorProducts.length > 0 && (
                  <section>
                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Listed Products ({vendorProducts.length})</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 200, overflowY: 'auto' }}>
                      {vendorProducts.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: '#F9FAFB', borderRadius: 10 }}>
                          <img src={p.images[0]} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{p.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{p.category} · ₹{p.price.toLocaleString('en-IN')} · Stock: {p.stock}</p>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>{p.sold} sold</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #E5E7EB' }}>
                  {v.status !== 'approved' && (
                    <button onClick={() => { updateVendorStatus(v.id, 'approved'); addNotification({ id: `n_${Date.now()}`, userId: v.userId, title: '🎉 Vendor Approved!', message: `Your vendor application for "${v.businessName}" has been approved! You can now start listing products.`, read: false, createdAt: new Date().toISOString(), type: 'vendor' }); setSelectedVendor(null); }} style={{ flex: 1, padding: '0.875rem', borderRadius: 12, border: 'none', background: '#10B981', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><Check size={16} /> Approve Vendor</button>
                  )}
                  {v.status !== 'rejected' && (
                    <button onClick={() => { updateVendorStatus(v.id, 'rejected'); addNotification({ id: `n_${Date.now()}`, userId: v.userId, title: 'Application Update', message: `Your application for "${v.businessName}" was not approved at this time.`, read: false, createdAt: new Date().toISOString(), type: 'vendor' }); setSelectedVendor(null); }} style={{ flex: 1, padding: '0.875rem', borderRadius: 12, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><X size={16} /> Reject Application</button>
                  )}
                  {v.status === 'approved' && (
                    <div style={{ flex: 1, padding: '0.875rem', borderRadius: 12, background: '#D1FAE5', color: '#065F46', fontWeight: 700, textAlign: 'center', fontSize: '0.95rem' }}>✓ Currently Active Vendor</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Orders */}
      {tab === 'orders' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>All Platform Orders</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Order ID</th><th>Buyer</th><th>Vendor</th><th>Total</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {[...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(o => {
                  const vendor = vendors.find(v => v.userId === o.sellerId);
                  return (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>#{o.id.slice(-8)}</td>
                      <td>{o.buyerName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{vendor?.businessName || o.sellerId}</td>
                      <td style={{ fontWeight: 600 }}>₹{o.total.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--warning)' }}>₹{o.commission.toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'shipped' ? 'badge-primary' : o.status.includes('refund') ? 'badge-danger' : 'badge-muted'}`}>{o.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refunds */}
      {tab === 'refunds' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Refund Requests</h3>
          {refundRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No pending refund requests.</p>
          ) : refundRequests.map(o => (
            <div key={o.id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Order #{o.id.slice(-8)}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Buyer: {o.buyerName} · Amount: ₹{o.total.toLocaleString('en-IN')}</p>
                  {o.refundReason && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Reason: {o.refundReason}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-success" onClick={() => { updateOrderStatus(o.id, 'refunded'); addNotification({ id: `n_${Date.now()}`, userId: o.buyerId, title: 'Refund Approved', message: `Your refund for order #${o.id} has been approved. Amount: ₹${o.total.toLocaleString('en-IN')}`, read: false, createdAt: new Date().toISOString(), type: 'refund' }); }}>
                    <Check size={14} /> Approve Refund
                  </button>
                  <button className="btn-danger" onClick={() => { updateOrderStatus(o.id, 'delivered'); addNotification({ id: `n_${Date.now()}`, userId: o.buyerId, title: 'Refund Rejected', message: `Your refund request for order #${o.id} was reviewed and rejected.`, read: false, createdAt: new Date().toISOString(), type: 'refund' }); }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {tab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Add New Category</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input className="input" style={{ width: 60 }} value={newCategoryIcon} onChange={e => setNewCategoryIcon(e.target.value)} placeholder="Icon" />
              <input className="input" style={{ flex: 1, minWidth: 200 }} value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Category name" />
              <button className="btn-primary" onClick={() => { if (newCategory.trim()) { addCategory({ id: `cat_${Date.now()}`, name: newCategory.trim(), icon: newCategoryIcon, subcategories: [] }); setNewCategory(''); setNewCategoryIcon('📦'); } }}>
                <Check size={14} /> Add
              </button>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Categories & Subcategories ({categories.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.map(c => (
                <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div onClick={() => setExpandedCat(expandedCat === c.id ? null : c.id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--surface)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{products.filter(p => p.category === c.name).length} products · {c.subcategories.length} subcategories</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expandedCat === c.id ? '▲' : '▼'}</span>
                  </div>
                  {expandedCat === c.id && (
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: '#FAFAFA' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>SUBCATEGORIES</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {c.subcategories.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No subcategories yet</span>}
                        {c.subcategories.map(sub => (
                          <span key={sub} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: '#F3F4F6', borderRadius: 999, fontSize: '0.85rem', fontWeight: 500 }}>
                            {sub}
                            <button onClick={() => updateCategory(c.id, { subcategories: c.subcategories.filter(s => s !== sub) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="input" style={{ flex: 1, height: 36 }} value={newSubcat} onChange={e => setNewSubcat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newSubcat.trim()) { updateCategory(c.id, { subcategories: [...c.subcategories, newSubcat.trim()] }); setNewSubcat(''); } }} placeholder="Add subcategory..." />
                        <button className="btn-primary" style={{ height: 36, padding: '0 0.875rem', fontSize: '0.85rem' }} onClick={() => { if (newSubcat.trim()) { updateCategory(c.id, { subcategories: [...c.subcategories, newSubcat.trim()] }); setNewSubcat(''); } }}><Check size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Platform Settings</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Commission Rate (%)</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="input" type="number" min={0} max={50} value={newCommission} onChange={e => setNewCommission(e.target.value)} style={{ maxWidth: 100 }} />
              <button className="btn-primary" onClick={() => setCommissionRate(Number(newCommission))}><Check size={14} /> Save</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Current: {commissionRate}% — Vendor receives {100 - commissionRate}% of sale</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(108,62,244,0.1)', borderRadius: 10, border: '1px solid rgba(108,62,244,0.2)' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Platform Stats</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Total Users: {users.length}</span>
              <span>Total Products: {products.length}</span>
              <span>Total Vendors: {vendors.length}</span>
              <span>Total Orders: {orders.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
