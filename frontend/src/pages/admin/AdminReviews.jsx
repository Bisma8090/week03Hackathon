import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Trash2, MessageCircle, Heart, ExternalLink } from 'lucide-react';
import { getAllReviewsAdmin, flagReview, deleteReview } from '../../api/reviews';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/layout/Navbar';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | flagged | clean
  const { notifications, liveReplyAdded } = useSocket();
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      setError('');
      const res = await getAllReviewsAdmin();
      setReviews(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews. Check if reviews service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  // Refetch on new review or reply notifications
  useEffect(() => {
    const latest = notifications[0];
    if (!latest) return;
    if (['new_review', 'reply'].includes(latest.type)) fetchReviews();
  }, [notifications]);

  useEffect(() => {
    if (liveReplyAdded) fetchReviews();
  }, [liveReplyAdded]);

  const handleFlag = async (reviewId) => {
    try {
      await flagReview(reviewId);
      setReviews((prev) => prev.map((r) => r._id === reviewId ? { ...r, isFlagged: true } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to flag review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'flagged') return r.isFlagged;
    if (filter === 'clean') return !r.isFlagged;
    return true;
  });

  const flaggedCount = reviews.filter((r) => r.isFlagged).length;

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a', margin: 0 }}>
              Manage Reviews
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#999', marginTop: 4 }}>
              {reviews.length} total · {flaggedCount} flagged
            </p>
          </div>
          <button
            onClick={fetchReviews}
            style={{ padding: '8px 20px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.78rem', borderRadius: 4 }}
          >
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['all', 'All'], ['flagged', `Flagged (${flaggedCount})`], ['clean', 'Clean']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '6px 16px', fontSize: '0.78rem', cursor: 'pointer', borderRadius: 4,
                border: filter === val ? '1px solid #1a1a1a' : '1px solid #ddd',
                background: filter === val ? '#1a1a1a' : '#fff',
                color: filter === val ? '#fff' : '#555',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: 6, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: '0.82rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>Loading reviews...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>No reviews found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((review) => (
              <div
                key={review._id}
                style={{
                  background: '#fff',
                  border: review.isFlagged ? '1px solid #fca5a5' : '1px solid #eee',
                  borderRadius: 8,
                  padding: '16px 20px',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{review.userName}</span>
                      <span style={{ fontSize: '0.78rem', color: '#f6ad55' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      {review.isFlagged && (
                        <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
                          FLAGGED
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: '#bbb' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#333', lineHeight: 1.5 }}>
                      {review.comment}
                    </p>
                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#aaa' }}>
                        <Heart size={12} /> {review.likes?.length ?? 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#aaa' }}>
                        <MessageCircle size={12} /> {review.replies?.length ?? 0} {review.replies?.length === 1 ? 'reply' : 'replies'}
                      </span>
                      <button
                        onClick={() => navigate(`/product/${review.productId}#review-${review._id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <ExternalLink size={11} /> View on product
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {!review.isFlagged && (
                      <button
                        onClick={() => handleFlag(review._id)}
                        title="Flag review"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 12px', fontSize: '0.75rem',
                          border: '1px solid #f6ad55', color: '#d97706',
                          background: '#fffbeb', borderRadius: 4, cursor: 'pointer',
                        }}
                      >
                        <Flag size={12} /> Flag
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review._id)}
                      title="Delete review"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 12px', fontSize: '0.75rem',
                        border: '1px solid #fca5a5', color: '#dc2626',
                        background: '#fff1f2', borderRadius: 4, cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {review.replies?.length > 0 && (
                  <div style={{ marginTop: 12, paddingLeft: 16, borderLeft: '2px solid #f0f0f0' }}>
                    {review.replies.map((reply, i) => (
                      <div key={reply._id || i} style={{ fontSize: '0.8rem', color: '#555', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: '#333' }}>{reply.userName}</span>
                        <span style={{ color: '#bbb', marginLeft: 6, fontSize: '0.72rem' }}>
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                        <p style={{ margin: '2px 0 0', color: '#666' }}>{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
