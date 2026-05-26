'use client';
import { useStore } from '@/lib/store';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead } = useStore();
  const mine = notifications.filter(n => n.userId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unread = mine.filter(n => !n.read);

  const typeIcon: Record<string, string> = { order: '📦', vendor: '🏪', refund: '💰', system: '⚙️', low_stock: '⚠️' };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={24} color="var(--primary-light)" />
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>Notifications</h1>
          {unread.length > 0 && <span className="badge badge-primary">{unread.length} new</span>}
        </div>
        {unread.length > 0 && (
          <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => unread.forEach(n => markNotificationRead(n.id))}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {mine.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mine.map(n => (
            <div key={n.id} onClick={() => markNotificationRead(n.id)} style={{ background: n.read ? 'var(--surface)' : 'rgba(108,62,244,0.08)', border: `1px solid ${n.read ? 'var(--border)' : 'rgba(108,62,244,0.3)'}`, borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</p>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{n.message}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
