'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, X, AlertCircle } from 'lucide-react';

// Extend Window to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutModalProps {
  total: number;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutModal({ total, buyerName, buyerEmail, buyerPhone, onSuccess, onClose }: CheckoutModalProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'paying' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    initiatePayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initiatePayment() {
    setStatus('loading');
    setErrorMsg('');

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay SDK. Check your internet connection.');

      // 2. Create order on server (keeps secret key safe)
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `vh_${Date.now()}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Could not create payment order.');
      }

      const { orderId, amount } = await res.json();

      // 3. Open Razorpay checkout popup
      setStatus('paying');
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'VendorHub',
        description: 'Hyperlocal Marketplace',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIxMCIgZmlsbD0iIzExMTgyNyIvPjxwYXRoIGQ9Ik0xMiAxNGwxNiAwTTEyIDIwbDEwIDBNMTIgMjZsNiAwIiBzdHJva2U9IiMxMEI5ODEiIHN0cm9rZVdpZHRoPSIyLjUiIHN0cm9rZUxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
        order_id: orderId,
        prefill: {
          name: buyerName,
          email: buyerEmail || '',
          contact: buyerPhone || '',
        },
        theme: {
          color: '#111827',
        },
        modal: {
          ondismiss: () => {
            setStatus('ready');
            onClose();
          },
        },
        handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // Payment successful — pass payment ID to parent
          onSuccess(response.razorpay_payment_id);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setStatus('error');
        setErrorMsg(response.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();

    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#FFFFFF', width: '100%', maxWidth: 400, borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ background: '#111827', padding: '1.5rem', color: '#FFFFFF', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFFFFF' }}>
            <X size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#111827" />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, margin: 0, fontSize: '1rem' }}>VendorHub Checkout</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: 0 }}>Powered by Razorpay</p>
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</div>
        </div>

        {/* Body */}
        <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <Loader2 size={48} color="#111827" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
              <p style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Preparing Checkout...</p>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Connecting to Razorpay securely</p>
            </>
          )}

          {status === 'paying' && (
            <>
              <div style={{ width: 64, height: 64, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <ShieldCheck size={32} color="#10B981" />
              </div>
              <p style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Razorpay Checkout Opened</p>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Complete your payment in the Razorpay popup window.</p>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem', fontSize: '0.85rem', color: '#6B7280' }}>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>🧪 Test Card Details</p>
                <p>Card: <strong>4111 1111 1111 1111</strong></p>
                <p>Expiry: <strong>Any future date</strong></p>
                <p>CVV: <strong>Any 3 digits</strong></p>
                <p>OTP: <strong>Enter any value</strong></p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: 64, height: 64, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <AlertCircle size={32} color="#EF4444" />
              </div>
              <p style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Payment Failed</p>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{errorMsg}</p>
              <button onClick={initiatePayment} style={{ width: '100%', padding: '0.875rem', background: '#111827', color: '#FFFFFF', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                Try Again
              </button>
              <button onClick={onClose} style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12, fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
