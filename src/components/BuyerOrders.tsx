'use client';
import { useStore } from '@/lib/store';
import { Package, CheckCircle, Truck, MapPin, Clock, Star, RotateCcw, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import StarRating from './StarRating';

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = { placed: 'Order Placed', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', refund_requested: 'Refund Requested', refunded: 'Refunded' };
const STATUS_ICONS: Record<string, React.ReactNode> = {
  placed: <Clock size={14} />, confirmed: <CheckCircle size={14} />, shipped: <Truck size={14} />, delivered: <Package size={14} />,
};

interface BuyerOrdersProps {
  onNavigate: (page: string) => void;
}

export default function BuyerOrders({ onNavigate }: BuyerOrdersProps) {
  const { orders, currentUser, updateOrderStatus, products, addReview, reviews } = useStore();
  const [reviewModal, setReviewModal] = useState<{ orderId: string; productId: string; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [refundModal, setRefundModal] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const userOrders = orders.filter(o => o.buyerId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const submitReview = () => {
    if (!reviewModal || !currentUser) return;
    addReview({ id: `r_${Date.now()}`, productId: reviewModal.productId, userId: currentUser.id, userName: currentUser.name, rating: reviewRating, comment: reviewComment, createdAt: new Date().toISOString() });
    setReviewModal(null); setReviewComment('');
  };

  const submitRefund = () => {
    if (!refundModal) return;
    updateOrderStatus(refundModal, 'refund_requested', refundReason);
    setRefundModal(null); setRefundReason('');
  };

  const hasReviewed = (productId: string) => reviews.some(r => r.productId === productId && r.userId === currentUser?.id);

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'var(--success)';
    if (status === 'cancelled' || status === 'refunded') return 'var(--danger)';
    if (status === 'refund_requested') return 'var(--warning)';
    return 'var(--primary-light)';
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.5rem' }}>My Orders</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{userOrders.length} orders total</p>

      {userOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ marginBottom: '1rem' }}>No orders yet</p>
          <button className="btn-primary" onClick={() => onNavigate('home')}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {userOrders.map(order => {
            const stepIdx = STATUS_STEPS.indexOf(order.status);
            return (
              <div key={order.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order #{order.id}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '1rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: getStatusColor(order.status), background: `${getStatusColor(order.status)}20`, padding: '0.3rem 0.75rem', borderRadius: 999 }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Order Tracking Bar */}
                {!['cancelled', 'refund_requested', 'refunded'].includes(order.status) && (
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : i === STATUS_STEPS.length - 1 ? 'flex-end' : 'center', position: 'relative' }}>
                          {i > 0 && <div style={{ position: 'absolute', top: 14, right: '50%', left: '-50%', height: 2, background: i <= stepIdx ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />}
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= stepIdx ? 'var(--gradient)' : 'var(--surface2)', border: `2px solid ${i <= stepIdx ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, color: i <= stepIdx ? 'white' : 'var(--text-muted)', fontSize: '0.75rem', transition: 'all 0.3s' }}>
                            {STATUS_ICONS[step]}
                          </div>
                          <span style={{ fontSize: '0.7rem', marginTop: '0.35rem', color: i <= stepIdx ? 'var(--text)' : 'var(--text-muted)', fontWeight: i === stepIdx ? 700 : 400 }}>{STATUS_LABELS[step]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div style={{ padding: '1rem 1.5rem' }}>
                  {order.items.map(item => (
                    <div key={item.productId} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <img src={item.image} alt={item.productName} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                        onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.productName)}&size=56&background=232142&color=8B5CF6`; }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        {order.status === 'delivered' && !hasReviewed(item.productId) && (
                          <button className="btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', marginTop: '0.25rem' }} onClick={() => setReviewModal({ orderId: order.id, productId: item.productId, productName: item.productName })}>
                            <Star size={10} /> Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {order.address.city}, {order.address.state}
                    </div>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontWeight: 700 }}>Total: ₹{order.total.toLocaleString('en-IN')}</span>
                    {order.status === 'delivered' && (
                      <button className="btn-danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setRefundModal(order.id)}>
                        <RotateCcw size={12} /> Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Review: {reviewModal.productName.substring(0, 40)}</h3>
            <StarRating rating={reviewRating} size={24} interactive onChange={setReviewRating} />
            <textarea className="input" style={{ marginTop: '1rem', minHeight: 100, resize: 'none' }} placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="modal-overlay" onClick={() => setRefundModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Request Refund</h3>
            <textarea className="input" style={{ minHeight: 100, resize: 'none' }} placeholder="Reason for refund..." value={refundReason} onChange={e => setRefundReason(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRefundModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={submitRefund}>Request Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
