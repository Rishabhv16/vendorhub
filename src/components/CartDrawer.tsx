'use client';
import { useStore } from '@/lib/store';
import { X, ShoppingCart, Trash2, Plus, Minus, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import CheckoutModal from './CheckoutModal';

interface CartDrawerProps {
  onClose: () => void;
  onCheckout?: () => void;
}

export default function CartDrawer({ onClose, onCheckout }: CartDrawerProps) {
  const { cart, products, removeFromCart, updateCartQty, clearCart, currentUser, addresses, orders, addOrder, addNotification, commissionRate } = useStore();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [selectedAddress, setSelectedAddress] = useState(addresses.find(a => a.userId === currentUser?.id && a.isDefault)?.id || '');
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const cartProducts = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(i => i.product);

  const subtotal = cartProducts.reduce((sum, i) => sum + (i.product!.price * i.quantity), 0);
  const delivery = subtotal > 0 ? (subtotal > 2000 ? 0 : 99) : 0;
  const total = subtotal + delivery;
  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`;

  const userAddresses = addresses.filter(a => a.userId === currentUser?.id);

  const handleCheckoutClick = () => {
    if (!selectedAddress || !currentUser) return;
    setShowPaymentModal(true);
  };


  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    
    const addr = addresses.find(a => a.id === selectedAddress)!;

    // Group items by seller
    const bySeller: Record<string, typeof cartProducts> = {};
    cartProducts.forEach(item => {
      const sellerId = item.product!.sellerId;
      if (!bySeller[sellerId]) bySeller[sellerId] = [];
      bySeller[sellerId].push(item);
    });

    Object.entries(bySeller).forEach(([sellerId, items]) => {
      const orderTotal = items.reduce((s, i) => s + i.product!.price * i.quantity, 0);
      const commission = Math.round(orderTotal * commissionRate / 100);
      const orderId = `ord_${Date.now()}_${sellerId}`;
      addOrder({
        id: orderId,
        buyerId: currentUser!.id,
        buyerName: currentUser!.name,
        sellerId,
        items: items.map(i => ({ productId: i.productId, productName: i.product!.name, price: i.product!.price, quantity: i.quantity, image: i.product!.images[0] })),
        total: orderTotal,
        commission,
        vendorEarnings: orderTotal - commission,
        status: 'placed',
        address: addr,
        paymentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      addNotification({ id: `n_${Date.now()}`, userId: sellerId, title: 'New Order!', message: `Order #${orderId} received for ${formatPrice(orderTotal)}`, read: false, createdAt: new Date().toISOString(), type: 'order' });
    });

    clearCart();
    setStep('success');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ width: 480, maxWidth: '100vw', background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart size={20} color="var(--primary-light)" />
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {step === 'cart' ? `Cart (${cart.reduce((s,i)=>s+i.quantity,0)})` : step === 'checkout' ? 'Checkout' : 'Order Placed!'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={40} color="var(--success)" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Order Placed!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your order has been placed successfully. Payment ID: pay_test_{Date.now().toString().slice(-6)}</p>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Continue Shopping</button>
            </div>
          )}

          {step === 'cart' && (
            <>
              {cartProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartProducts.map(({ product, quantity, productId }) => product && (
                    <div key={productId} style={{ display: 'flex', gap: '1rem', background: 'var(--surface2)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border)' }}>
                      <img src={product.images[0]} alt={product.name} style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }}
                        onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=72&background=232142&color=8B5CF6`; }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{product.sellerName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{formatPrice(product.price * quantity)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button onClick={() => updateCartQty(productId, Math.max(1, quantity - 1))} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}><Minus size={12} /></button>
                            <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                            <button onClick={() => updateCartQty(productId, quantity + 1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}><Plus size={12} /></button>
                            <button onClick={() => removeFromCart(productId)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} color="var(--primary-light)" /> Delivery Address</h3>
                {userAddresses.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No saved addresses. Please add one in your profile.</p>
                ) : userAddresses.map(addr => (
                  <div key={addr.id} onClick={() => setSelectedAddress(addr.id)} style={{ background: selectedAddress === addr.id ? 'rgba(108,62,244,0.1)' : 'var(--surface2)', border: `2px solid ${selectedAddress === addr.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, padding: '1rem', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.2s' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{addr.label} {addr.isDefault && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Default</span>}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '1rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Order Summary</h3>
                {cartProducts.map(({ product, quantity }) => product && (
                  <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{product.name.substring(0, 30)}... ×{quantity}</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
                <hr className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                  <span style={{ color: delivery === 0 ? 'var(--success)' : 'var(--text)' }}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total</span><span style={{ color: 'var(--primary-light)', fontSize: '1.1rem' }}>{formatPrice(total)}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} color="var(--success)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 500 }}>Sandbox Payment — Razorpay/Stripe (Test Mode)</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && cartProducts.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            {step === 'cart' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-light)' }}>{formatPrice(total)}</span>
                </div>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }} onClick={() => setStep('checkout')}>
                  Proceed to Checkout
                </button>
              </>
            )}
            {step === 'checkout' && (
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }} onClick={handleCheckoutClick} disabled={!selectedAddress || processing}>
                {processing ? '⏳ Processing...' : `Pay ${formatPrice(total)} · Secure Checkout`}
              </button>
            )}
          </div>
        )}
      </div>

      {showPaymentModal && (
        <CheckoutModal 
          total={total}
          buyerName={currentUser?.name || ''}
          buyerEmail={currentUser?.email || ''}
          buyerPhone={(currentUser as any)?.phone || ''}
          onSuccess={handlePaymentSuccess} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </div>
  );
}
