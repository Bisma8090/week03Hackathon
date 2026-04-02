import { useState, useRef, useEffect } from 'react';
import { Bell, Trash2, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { deleteReview, flagReview } from '../../api/reviews';

const NotificationBell = () => {
  const { notifications, markAllRead, clearNotifications, removeNotification } = useSocket();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) markAllRead();
  };

  // Navigate to product page and scroll to the specific review/reply via hash
  const handleNotificationClick = (n) => {
    setOpen(false);
    if (n.productId) {
      let hash = '';
      if (n.type === 'reply' && n.replyId) {
        hash = `#reply-${n.replyId}`;
      } else if (n.reviewId) {
        hash = `#review-${n.reviewId}`;
      }
      navigate(`/product/${n.productId}${hash}`);
    }
  };

  const handleAdminDelete = async (e, n) => {
    e.stopPropagation();
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(n.reviewId);
      removeNotification(n.id);
    } catch {
      // silent
    }
  };

  const handleAdminFlag = async (e, n) => {
    e.stopPropagation();
    try {
      await flagReview(n.reviewId);
      removeNotification(n.id);
    } catch {
      // silent
    }
  };

  const getIcon = (type) => {
    if (type === 'review_submitted') return '✅';
    if (type === 'review_added') return '✅';
    if (type === 'new_review') return '⭐';
    if (type === 'reply') return '💬';
    if (type === 'like') return '❤️';
    if (type === 'unlike') return '🤍';
    if (type === 'flagged') return '🚩';
    if (type === 'deleted') return '🗑️';
    if (type === 'product_update') return '📦';
    return '🔔';
  };

  const isClickable = (n) => !!n.productId;

  // Show "Click to view review" hint only for non-self notifications
  const getHint = (n) => {
    if (!n.productId) return null;
    if (n.type === 'review_submitted') return 'Click to view your review';
    return 'Click to view review';
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: '#e53e3e', color: '#fff',
            borderRadius: '50%', fontSize: '10px',
            width: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          width: 340, maxHeight: 420, overflowY: 'auto',
          background: '#fff', border: '1px solid #eee',
          borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          zIndex: 200,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '10px 14px',
            borderBottom: '1px solid #eee', position: 'sticky', top: 0,
            background: '#fff',
          }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                style={{ fontSize: 11, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: 16, color: '#888', fontSize: 13, textAlign: 'center' }}>
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => isClickable(n) && handleNotificationClick(n)}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #f5f5f5',
                  background: n.read ? '#fff' : '#fef9f0',
                  fontSize: 13,
                  cursor: isClickable(n) ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (isClickable(n)) e.currentTarget.style.background = '#fdf0e0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = n.read ? '#fff' : '#fef9f0';
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{getIcon(n.type)}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                  {isClickable(n) && (
                    <span style={{ fontSize: 11, color: '#aaa', marginTop: 2, display: 'block' }}>
                      {getHint(n)}
                    </span>
                  )}
                  {/* Admin inline actions for new review notifications */}
                  {isAdmin && n.reviewId && (n.type === 'new_review' || n.type === 'reply') && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleAdminFlag(e, n)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 3,
                          fontSize: 11, color: '#f6ad55',
                          background: 'none', border: '1px solid #f6ad55',
                          borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
                        }}
                      >
                        <Flag size={10} /> Flag
                      </button>
                      <button
                        onClick={(e) => handleAdminDelete(e, n)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 3,
                          fontSize: 11, color: '#e53e3e',
                          background: 'none', border: '1px solid #e53e3e',
                          borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
