import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Flag, Trash2 } from 'lucide-react';
import {
  getProductReviews,
  getProductReviewsAdmin,
  addReview,
  addReply,
  deleteReply,
  toggleLike,
  flagReview,
  deleteReview,
} from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => onChange && onChange(star)}
        style={{
          fontSize: 22,
          cursor: onChange ? 'pointer' : 'default',
          color: star <= value ? '#f6ad55' : '#e2e8f0',
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const ReviewSection = ({ productId, highlightReviewId, highlightReplyId }) => {
  const { user } = useAuth();
  const { notifications, liveLikes, liveReplyAdded } = useSocket();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // New review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reply state per review
  const [replyText, setReplyText] = useState({});
  const [replyOpen, setReplyOpen] = useState({});

  // Ref map for scrolling to a specific review or reply
  const reviewRefs = useRef({});
  const replyRefs = useRef({});

  const fetchReviews = async () => {
    try {
      setFetchError('');
      const res = isAdmin
        ? await getProductReviewsAdmin(productId)
        : await getProductReviews(productId);
      setReviews(res.data);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, isAdmin]);

  // Real-time: refetch when any relevant event arrives for this product
  useEffect(() => {
    const latest = notifications[0];
    if (!latest || latest.productId !== productId) return;
    const refetchTypes = ['new_review', 'review_added', 'reply', 'like', 'unlike', 'flagged', 'deleted'];
    if (refetchTypes.includes(latest.type)) {
      fetchReviews();
    }
  }, [notifications]);

  // Real-time: refetch when a reply is added to any review on this product
  useEffect(() => {
    if (liveReplyAdded && liveReplyAdded.productId === productId) {
      fetchReviews();
    }
  }, [liveReplyAdded]);

  // Auto-expand replies section if a replyId is highlighted
  useEffect(() => {
    if (!highlightReplyId || loading || reviews.length === 0) return;
    // Find which review contains this reply
    const parentReview = reviews.find((r) =>
      r.replies?.some((rep) => rep._id?.toString() === highlightReplyId)
    );
    if (parentReview) {
      // Auto-open replies for that review
      setReplyOpen((prev) => ({ ...prev, [parentReview._id]: true }));
    }
  }, [highlightReplyId, loading, reviews]);

  // Scroll to and highlight the target review or reply after reviews load
  useEffect(() => {
    if (loading) return;

    const doScroll = (el) => {
      if (!el) return;
      // Use double rAF to ensure DOM has painted after state updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
    };

    if (highlightReplyId) {
      // Small delay to let reply expand render
      setTimeout(() => {
        doScroll(replyRefs.current[highlightReplyId]);
      }, 150);
      return;
    }

    if (highlightReviewId) {
      doScroll(reviewRefs.current[highlightReviewId]);
    }
  }, [highlightReviewId, highlightReplyId, loading, reviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return setError('Please login to add a review');
    setSubmitting(true);
    setError('');
    try {
      await addReview({ productId, rating, comment });
      setComment('');
      setRating(5);
      setSuccessMsg('Your review was submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    try {
      await addReply(reviewId, { text });
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
      setReplyOpen((prev) => ({ ...prev, [reviewId]: false }));
      fetchReviews();
    } catch {
      // silent
    }
  };

  const handleLike = async (reviewId) => {
    if (!user) return;
    try {
      const res = await toggleLike(reviewId);
      // Optimistically update local state — socket will also broadcast like_update
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id !== reviewId) return r;
          const alreadyLiked = r.likes?.some(
            (id) => id === user._id || id?.toString() === user._id
          );
          const updatedLikes = alreadyLiked
            ? r.likes.filter((id) => id !== user._id && id?.toString() !== user._id)
            : [...(r.likes || []), user._id];
          return { ...r, likes: updatedLikes };
        })
      );
    } catch {
      // silent
    }
  };

  const handleFlag = async (reviewId) => {
    try {
      await flagReview(reviewId);
      fetchReviews();
    } catch {
      // silent
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      fetchReviews();
    } catch {
      // silent
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await deleteReply(reviewId, replyId);
      fetchReviews();
    } catch {
      // silent
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        Customer Reviews
      </h2>
      {avgRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <StarRating value={Math.round(avgRating)} />
          <span style={{ fontSize: 14, color: '#666' }}>
            {avgRating} / 5 ({reviews.length} reviews)
          </span>
        </div>
      )}

      {/* Add Review Form */}
      {user && !isAdmin && (
        <form onSubmit={handleSubmitReview} style={{
          background: '#fafafa', border: '1px solid #eee',
          borderRadius: 8, padding: 20, marginBottom: 32,
        }}>
          <p style={{ fontWeight: 600, marginBottom: 12 }}>Write a Review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            required
            rows={3}
            style={{
              width: '100%', marginTop: 12, padding: '10px 12px',
              border: '1px solid #ddd', borderRadius: 6,
              fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          {error && <p style={{ color: '#e53e3e', fontSize: 13, marginTop: 6 }}>{error}</p>}
          {successMsg && (
            <p style={{ color: '#38a169', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
              ✅ {successMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 12, padding: '8px 20px',
              background: '#1A1A1A', color: '#fff',
              border: 'none', borderRadius: 6,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading reviews...</p>
      ) : fetchError ? (
        <p style={{ color: '#e53e3e', fontSize: 13 }}>⚠️ {fetchError}</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#888' }}>No reviews yet. Be the first!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {reviews.map((review) => {
            const likedByMe = user && review.likes?.some(
              (id) => id === user._id || id?.toString() === user._id
            );
            // Use real-time like count from socket if available, else fall back to DB value
            const likesCount = liveLikes[review._id] ?? review.likes?.length ?? 0;
            const isHighlighted = highlightReviewId === review._id?.toString();
            return (
              <div
                key={review._id}
                id={`review-${review._id}`}
                ref={(el) => { reviewRefs.current[review._id?.toString()] = el; }}
                style={{
                  border: isHighlighted ? '2px solid #c8a96e' : '1px solid #eee',
                  borderRadius: 8,
                  padding: 16,
                  background: isHighlighted ? '#fffbf3' : '#fff',
                  transition: 'border 0.3s, background 0.3s',
                }}
              >
                {/* Review Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{review.userName}</span>
                    {isAdmin && review.isFlagged && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, color: '#fff',
                        background: '#e53e3e', borderRadius: 4, padding: '1px 6px',
                      }}>Flagged</span>
                    )}
                    <StarRating value={review.rating} />
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p style={{ marginTop: 8, fontSize: 14, color: '#333' }}>{review.comment}</p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
                  {/* Like */}
                  <button
                    onClick={() => handleLike(review._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: likedByMe ? '#e53e3e' : '#888', fontSize: 13,
                    }}
                  >
                    <Heart size={14} fill={likedByMe ? '#e53e3e' : 'none'} />
                    {likesCount}
                  </button>

                  {/* Reply toggle */}
                  {user && (
                    <button
                      onClick={() => setReplyOpen((prev) => ({ ...prev, [review._id]: !prev[review._id] }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#888', fontSize: 13,
                      }}
                    >
                      <MessageCircle size={14} />
                      Reply
                    </button>
                  )}

                  {/* Admin actions */}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleFlag(review._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f6ad55' }}
                        title="Flag review"
                      >
                        <Flag size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>

                {/* Reply input */}
                {replyOpen[review._id] && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <input
                      value={replyText[review._id] || ''}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [review._id]: e.target.value }))}
                      placeholder="Write a reply..."
                      style={{
                        flex: 1, padding: '6px 10px',
                        border: '1px solid #ddd', borderRadius: 6, fontSize: 13,
                      }}
                    />
                    <button
                      onClick={() => handleReply(review._id)}
                      style={{
                        padding: '6px 14px', background: '#1A1A1A',
                        color: '#fff', border: 'none', borderRadius: 6,
                        cursor: 'pointer', fontSize: 13,
                      }}
                    >
                      Send
                    </button>
                  </div>
                )}

                {/* Replies — always show if present */}
                {review.replies?.length > 0 && (
                  <div style={{ marginTop: 12, paddingLeft: 16, borderLeft: '2px solid #eee' }}>
                    {review.replies.map((reply, i) => {
                      const isMyReply = user && reply.userId?.toString() === user._id;
                      const isHighlightedReply = highlightReplyId === reply._id?.toString();
                      return (
                        <div
                          key={reply._id || i}
                          ref={(el) => { replyRefs.current[reply._id?.toString()] = el; }}
                          style={{
                            marginBottom: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            background: isHighlightedReply ? '#fffbf3' : 'transparent',
                            border: isHighlightedReply ? '1px solid #c8a96e' : '1px solid transparent',
                            borderRadius: 6,
                            padding: isHighlightedReply ? '6px 8px' : '0',
                            transition: 'background 0.3s, border 0.3s',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{reply.userName}</span>
                            <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                            <p style={{ fontSize: 13, color: '#555', margin: '2px 0 0' }}>{reply.text}</p>
                          </div>
                          {(isMyReply || isAdmin) && (
                            <button
                              onClick={() => handleDeleteReply(review._id, reply._id)}
                              title="Delete reply"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '0 4px', flexShrink: 0 }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
