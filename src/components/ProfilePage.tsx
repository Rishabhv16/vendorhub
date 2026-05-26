'use client';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { MapPin, Plus, LogOut, Store, CheckCircle, ChevronRight } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Food & Grocery', 'Toys'];

export default function ProfilePage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { currentUser, setCurrentUser, addresses, addAddress, vendors, addVendor, addNotification } = useStore();
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ label: '', street: '', city: '', state: '', pincode: '' });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vBusiness, setVBusiness] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vCategory, setVCategory] = useState('Electronics');
  const [vGst, setVGst] = useState('');
  const [vSubmitted, setVSubmitted] = useState(false);

  if (!currentUser) return null;
  const mine = addresses.filter(a => a.userId === currentUser.id);
  const myVendor = vendors.find(v => v.userId === currentUser.id);

  const save = () => {
    if (!f.label || !f.street || !f.city) return;
    addAddress({ id: `a_${Date.now()}`, userId: currentUser.id, ...f, isDefault: mine.length === 0 });
    setAdding(false); setF({ label: '', street: '', city: '', state: '', pincode: '' });
  };

  const submitVendorApp = () => {
    if (!vBusiness.trim()) return;
    addVendor({
      id: `vendor_${Date.now()}`,
      userId: currentUser.id,
      businessName: vBusiness.trim(),
      description: vDesc.trim() || `${vBusiness} — quality products`,
      category: vCategory,
      location: currentUser.location || 'India',
      gstNumber: vGst.trim(),
      status: 'pending',
      totalRevenue: 0,
      totalOrders: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      payoutHistory: [],
    });
    addNotification({
      id: `n_${Date.now()}`,
      userId: 'admin1',
      title: '🏪 New Vendor Application',
      message: `${vBusiness} (${currentUser.name}) has applied to become a vendor.`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'vendor',
    });
    setVSubmitted(true);
    setShowVendorForm(false);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>My Profile</h1>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <img src={currentUser.avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)' }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{currentUser.name}</p>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{currentUser.email}</p>
            {currentUser.phone && <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>📱 {currentUser.phone}</p>}
            {currentUser.location && <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>📍 {currentUser.location}</p>}
            <span className={`badge ${currentUser.role === 'admin' ? 'badge-red' : currentUser.role === 'seller' ? 'badge-gold' : 'badge-purple'}`} style={{ marginTop: '0.4rem' }}>{currentUser.role}</span>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => { setCurrentUser(null); onNavigate('home'); }}><LogOut size={13} /> Sign Out</button>
      </div>

      {/* Become a Vendor — only for buyers who haven't applied yet */}
      {currentUser.role === 'buyer' && !myVendor && !vSubmitted && (
        <div style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1px solid #FDE68A', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={24} color="#FFFFFF" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#92400E', fontSize: '1rem' }}>Start Selling on VendorHub</p>
                <p style={{ color: '#B45309', fontSize: '0.85rem' }}>Apply to become a vendor — free to join</p>
              </div>
            </div>
            <button onClick={() => setShowVendorForm(!showVendorForm)} style={{ padding: '0.625rem 1.25rem', background: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Apply Now <ChevronRight size={16} />
            </button>
          </div>
          {showVendorForm && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #FDE68A', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="Business / Store Name *" value={vBusiness} onChange={e => setVBusiness(e.target.value)} style={{ background: '#FFFFFF' }} />
              <textarea className="input" placeholder="Describe what you sell..." value={vDesc} onChange={e => setVDesc(e.target.value)} style={{ minHeight: 64, resize: 'none', background: '#FFFFFF' }} />
              <select className="input" value={vCategory} onChange={e => setVCategory(e.target.value)} style={{ background: '#FFFFFF' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="input" placeholder="GST Number (optional)" value={vGst} onChange={e => setVGst(e.target.value)} style={{ background: '#FFFFFF' }} />
              <button onClick={submitVendorApp} style={{ padding: '0.75rem', background: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
                Submit Application
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vendor application status */}
      {(myVendor || vSubmitted) && currentUser.role === 'buyer' && (
        <div style={{ background: myVendor?.status === 'approved' ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${myVendor?.status === 'approved' ? '#86EFAC' : '#FDE68A'}`, borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={20} color={myVendor?.status === 'approved' ? '#10B981' : '#F59E0B'} />
            <div>
              <p style={{ fontWeight: 700, color: myVendor?.status === 'approved' ? '#065F46' : '#92400E' }}>
                {myVendor?.status === 'approved' ? 'Vendor Application Approved!' : 'Application Under Review'}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                {myVendor?.status === 'approved' ? `${myVendor.businessName} is live on VendorHub.` : 'Admin will review your application shortly.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentUser.role === 'buyer' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>Saved Addresses</h3>
            <button className="btn btn-outline-purple btn-sm" onClick={() => setAdding(!adding)}><Plus size={13} /> Add</button>
          </div>
          {adding && (
            <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="Label (Home / Office)" value={f.label} onChange={e => setF(p => ({ ...p, label: e.target.value }))} />
              <input className="input" placeholder="Street address" value={f.street} onChange={e => setF(p => ({ ...p, street: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <input className="input" placeholder="City" value={f.city} onChange={e => setF(p => ({ ...p, city: e.target.value }))} />
                <input className="input" placeholder="State" value={f.state} onChange={e => setF(p => ({ ...p, state: e.target.value }))} />
                <input className="input" placeholder="Pincode" value={f.pincode} onChange={e => setF(p => ({ ...p, pincode: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={save}>Save Address</button>
              </div>
            </div>
          )}
          {mine.map(a => (
            <div key={a.id} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={15} color="var(--purple-light)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.label} {a.isDefault && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Default</span>}</p>
                <p style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{a.street}, {a.city}, {a.state} — {a.pincode}</p>
              </div>
            </div>
          ))}
          {mine.length === 0 && !adding && <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No saved addresses yet.</p>}
        </div>
      )}
    </div>
  );
}
