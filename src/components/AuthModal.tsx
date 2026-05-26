'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { X, User, Store, Shield, CheckCircle, Eye, EyeOff, MapPin, Building2, FileText, Phone } from 'lucide-react';

interface AuthModalProps { onClose: () => void; onSuccess: () => void; }

type Screen = 'login' | 'register_buyer' | 'register_seller' | 'pending';

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { users, setCurrentUser, addUser, vendors, addVendor, addNotification } = useStore();
  const [screen, setScreen] = useState<Screen>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Buyer Register state
  const [bName, setBName] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bLocation, setBLocation] = useState('');
  const [bPassword, setBPassword] = useState('');
  const [bError, setBError] = useState('');

  // Seller Register state
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sLocation, setSLocation] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessDesc, setBusinessDesc] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Electronics');
  const [gstNumber, setGstNumber] = useState('');
  const [sError, setSError] = useState('');

  const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Food & Grocery', 'Toys'];

  // --- LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const u = users.find(x => x.email.toLowerCase() === loginEmail.toLowerCase());
    if (!u) { setLoginError('No account found with this email. Please register first.'); return; }
    // Password check (stored as metadata on user or just match)
    const storedPwd = (u as any).password;
    if (storedPwd && storedPwd !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }
    setCurrentUser(u);
    onSuccess();
    onClose();
  };

  // Quick preset logins
  const loginAs = (role: 'buyer' | 'seller' | 'admin') => {
    const u = users.find(x => x.role === role);
    if (u) { setCurrentUser(u); onSuccess(); onClose(); }
  };

  // --- REGISTER BUYER ---
  const handleRegisterBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    setBError('');
    if (!bName.trim() || !bEmail.trim() || !bPassword.trim()) { setBError('Please fill in all required fields.'); return; }
    if (users.find(u => u.email.toLowerCase() === bEmail.toLowerCase())) { setBError('An account with this email already exists. Please log in.'); return; }
    if (bPassword.length < 6) { setBError('Password must be at least 6 characters.'); return; }

    const newUser = {
      id: `buyer_${Date.now()}`,
      name: bName.trim(),
      email: bEmail.trim().toLowerCase(),
      role: 'buyer' as const,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${bName}`,
      location: bLocation.trim() || 'India',
      phone: bPhone.trim(),
      createdAt: new Date().toISOString(),
      password: bPassword, // stored for login matching
    };
    addUser(newUser as any);
    setCurrentUser(newUser as any);
    onSuccess();
    onClose();
  };

  // --- REGISTER SELLER ---
  const handleRegisterSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setSError('');
    if (!sName.trim() || !sEmail.trim() || !sPassword.trim() || !businessName.trim()) { setSError('Please fill in all required fields.'); return; }
    if (users.find(u => u.email.toLowerCase() === sEmail.toLowerCase())) { setSError('An account with this email already exists. Please log in.'); return; }
    if (sPassword.length < 6) { setSError('Password must be at least 6 characters.'); return; }

    const userId = `seller_${Date.now()}`;

    const newUser = {
      id: userId,
      name: sName.trim(),
      email: sEmail.trim().toLowerCase(),
      role: 'seller' as const,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sName}`,
      location: sLocation.trim() || 'India',
      phone: sPhone.trim(),
      createdAt: new Date().toISOString(),
      password: sPassword,
    };

    const newVendor = {
      id: `vendor_${Date.now()}`,
      userId,
      businessName: businessName.trim(),
      description: businessDesc.trim() || `${businessName} - Quality products at great prices`,
      category: businessCategory,
      location: sLocation.trim() || 'India',
      gstNumber: gstNumber.trim(),
      status: 'pending' as const,
      totalRevenue: 0,
      totalOrders: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      payoutHistory: [],
    };

    addUser(newUser as any);
    addVendor(newVendor);

    // Notify admin
    addNotification({
      id: `n_${Date.now()}`,
      userId: 'admin1',
      title: '🏪 New Vendor Application',
      message: `${businessName} (${sName}) has applied to become a vendor. Review and approve/reject in the Admin panel.`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'vendor',
    });

    // Log them in immediately (but they'll see pending state in seller dashboard)
    setCurrentUser(newUser as any);
    setScreen('pending');
  };

  // ───────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}><X size={16} /></button>

        {/* ── PENDING APPROVAL SCREEN ── */}
        {screen === 'pending' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: 72, height: 72, background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Store size={36} color="#D97706" />
            </div>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Application Submitted!</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your vendor application for <strong style={{ color: '#111827' }}>{businessName}</strong> has been sent to the admin team for review. You will be notified once approved.
            </p>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>What happens next?</p>
              {['Admin reviews your application (usually within 24hrs)', 'You receive a notification once approved', 'Start listing products and earning!'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#10B981', minWidth: 20 }}>{i+1}.</span>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>{step}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onSuccess(); onClose(); }}>
              Go to My Dashboard
            </button>
          </div>
        )}

        {/* ── LOGIN SCREEN ── */}
        {screen === 'login' && (
          <>
            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: '#111827', marginBottom: '2rem' }}>Welcome back</h2>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Email address</label>
                <input className="input" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {loginError && <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 500 }}>{loginError}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>Log In</button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              New to VendorHub?{' '}
              <button onClick={() => setScreen('register_buyer')} style={{ color: '#111827', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Create an account</button>
              {' '}or{' '}
              <button onClick={() => setScreen('register_seller')} style={{ color: '#D97706', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sell with us</button>
            </p>

            <div style={{ textAlign: 'center', position: 'relative', marginBottom: '1.5rem' }}>
              <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB' }} />
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#FFFFFF', padding: '0 1rem', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>QUICK DEMO</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => loginAs('buyer')}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', flexShrink: 0 }}><User size={16} /></div>
                <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>Demo Buyer</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>arjun@buyer.com</p>
                </div>
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => loginAs('seller')}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}><Store size={16} /></div>
                <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>Demo Seller</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>ravi@seller.com</p>
                </div>
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => loginAs('admin')}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}><Shield size={16} /></div>
                <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>Demo Admin</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>admin@vendorhub.com</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── REGISTER BUYER SCREEN ── */}
        {screen === 'register_buyer' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => setScreen('login')} style={{ background: '#F3F4F6', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280', fontSize: '1.2rem' }}>←</button>
              <div>
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Create Buyer Account</h2>
                <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Start shopping from local vendors</p>
              </div>
            </div>

            <form onSubmit={handleRegisterBuyer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Full Name *</label>
                <input className="input" placeholder="e.g. Rahul Sharma" value={bName} onChange={e => setBName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Email Address *</label>
                <input className="input" type="email" placeholder="you@example.com" value={bEmail} onChange={e => setBEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Password *</label>
                <input className="input" type="password" placeholder="Min 6 characters" value={bPassword} onChange={e => setBPassword(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Phone</label>
                  <input className="input" placeholder="9XXXXXXXXX" value={bPhone} onChange={e => setBPhone(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>City</label>
                  <input className="input" placeholder="Mumbai" value={bLocation} onChange={e => setBLocation(e.target.value)} />
                </div>
              </div>
              {bError && <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 500, background: '#FEF2F2', padding: '0.6rem 1rem', borderRadius: 8 }}>{bError}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <User size={16} /> Create Account & Start Shopping
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6B7280' }}>
                Want to sell?{' '}
                <button type="button" onClick={() => setScreen('register_seller')} style={{ color: '#D97706', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Apply as a Vendor →</button>
              </p>
            </form>
          </>
        )}

        {/* ── REGISTER SELLER SCREEN ── */}
        {screen === 'register_seller' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => setScreen('login')} style={{ background: '#F3F4F6', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280', fontSize: '1.2rem' }}>←</button>
              <div>
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Apply as a Vendor</h2>
                <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Your store will go live after admin approval</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSeller} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Section: Personal Info */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Personal Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input className="input" placeholder="Full Name *" value={sName} onChange={e => setSName(e.target.value)} required />
                  <input className="input" type="email" placeholder="Email Address *" value={sEmail} onChange={e => setSEmail(e.target.value)} required />
                  <input className="input" type="password" placeholder="Password (min 6 chars) *" value={sPassword} onChange={e => setSPassword(e.target.value)} required />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input className="input" placeholder="Phone Number" value={sPhone} onChange={e => setSPhone(e.target.value)} />
                    <input className="input" placeholder="City / Location *" value={sLocation} onChange={e => setSLocation(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* Section: Business Info */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Business Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input className="input" placeholder="Business / Store Name *" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
                  <textarea className="input" placeholder="Brief description of your business..." value={businessDesc} onChange={e => setBusinessDesc(e.target.value)} style={{ minHeight: 72, resize: 'none' }} />
                  <select className="input" value={businessCategory} onChange={e => setBusinessCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input className="input" placeholder="GST Number (optional)" value={gstNumber} onChange={e => setGstNumber(e.target.value)} />
                </div>
              </div>

              <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#15803D' }}>
                <CheckCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
                Your application will be reviewed by our admin team. You'll receive a notification once approved.
              </div>

              {sError && <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 500, background: '#FEF2F2', padding: '0.6rem 1rem', borderRadius: 8 }}>{sError}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
                <Store size={16} /> Submit Vendor Application
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6B7280' }}>
                Just shopping?{' '}
                <button type="button" onClick={() => setScreen('register_buyer')} style={{ color: '#111827', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Create a buyer account →</button>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
