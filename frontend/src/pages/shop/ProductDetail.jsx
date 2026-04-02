import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getProductById, getProducts } from '../../api/products';
import { addToCart } from '../../api/cart';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import ReviewSection from '../../components/common/ReviewSection';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract reviewId from URL hash e.g. #review-<id> or #reply-<replyId>
  const highlightReviewId = location.hash?.startsWith('#review-')
    ? location.hash.replace('#review-', '')
    : null;
  const highlightReplyId = location.hash?.startsWith('#reply-')
    ? location.hash.replace('#reply-', '')
    : null;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((res) => {
        setProduct(res.data);
        setSelectedVariant(res.data.variants[0]);
        return getProducts({ category: res.data.category, limit: 4 });
      })
      .then((res) => {
        setRelatedProducts(res.data.products.filter((p) => p._id !== id));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedVariant) return;
    setAddingToCart(true);
    try {
      await addToCart({ productId: product._id, variantName: selectedVariant.name, quantity });
      setCartMessage('Added to bag!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      setCartMessage(err.response?.data?.message || 'Failed to add');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Loading...</p>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Product not found</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 48px', fontSize: '0.7rem', color: '#999', letterSpacing: '0.05em', borderBottom: '1px solid #f0f0f0' }}>
        <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>HOME</Link>
        {' / '}
        <Link to="/collections" style={{ color: '#999', textDecoration: 'none' }}>COLLECTIONS</Link>
        {' / '}
        <Link to={`/collections?category=${product.category}`} style={{ color: '#999', textDecoration: 'none' }}>
          {product.category.toUpperCase().replace('-', ' ')}
        </Link>
        {' / '}
        <span style={{ color: '#555' }}>{product.name.toUpperCase()}</span>
      </div>

      {/* Product Main */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 48px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

        {/* Left — Image */}
        <div style={{ backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', minHeight: '380px' }}>
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{ width: '100%', maxHeight: '360px', objectFit: 'contain' }}
            />
          ) : (
            <span style={{ fontSize: '8rem' }}>🍵</span>
          )}
        </div>

        {/* Right — Info */}
        <div style={{ paddingTop: '8px' }}>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#1a1a1a', marginBottom: '12px', lineHeight: '1.2', fontWeight: 'normal' }}>
            {product.name}
          </h1>

          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '20px', lineHeight: '1.6' }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem' }}>🌐</span>
              <span style={{ fontSize: '0.8rem', color: '#555' }}>Origin: Iran</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem' }}>🏷️</span>
              <span style={{ fontSize: '0.8rem', color: '#555' }}>Organic</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem' }}>🌿</span>
              <span style={{ fontSize: '0.8rem', color: '#555' }}>Vegan</span>
            </div>
          </div>

          {/* Price — Updated to Dollars */}
          <p style={{ fontSize: '2rem', color: '#1a1a1a', marginBottom: '20px', fontWeight: '400' }}>
            ${selectedVariant?.price}
          </p>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '12px' }}>Variants</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.variants.map((variant) => (
                <button
                  key={variant._id}
                  onClick={() => { if (variant.stock > 0) setSelectedVariant(variant); }}
                  style={{
                    width: '72px',
                    padding: '10px 6px 8px',
                    border: selectedVariant?._id === variant._id ? '1px solid #c8a96e' : '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: variant.stock > 0 ? 'pointer' : 'not-allowed',
                    opacity: variant.stock > 0 ? 1 : 0.4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    outline: 'none',
                  }}
                >
                  <div style={{
                    width: '36px', height: '44px',
                    border: '1px solid #ccc',
                    borderRadius: '4px 4px 6px 6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#f9f9f9',
                    fontSize: '0.55rem', color: '#666',
                  }}>
                    {variant.name.replace('g', '').replace('kg', 'k')}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#555', textAlign: 'center', lineHeight: '1.2' }}>
                    {variant.name} bag
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: '40px', height: '48px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
              >
                −
              </button>
              <span style={{ width: '40px', textAlign: 'center', fontSize: '0.95rem', color: '#333' }}>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{ width: '40px', height: '48px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariant || selectedVariant.stock === 0}
              style={{
                flex: 1,
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: 'none',
                height: '48px',
                fontSize: '0.82rem',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: addingToCart ? 0.7 : 1,
              }}
            >
              <span>🛍️</span>
              {addingToCart ? 'ADDING...' : selectedVariant?.stock === 0 ? 'OUT OF STOCK' : 'ADD TO BAG'}
            </button>
          </div>

          {cartMessage && (
            <p style={{ fontSize: '0.82rem', color: cartMessage.includes('Failed') || cartMessage.includes('Only') ? '#e53e3e' : '#38a169', marginTop: '8px' }}>
              {cartMessage}
            </p>
          )}
          {selectedVariant && (
            <p style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '6px' }}>
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} items in stock` : 'Out of stock'}
            </p>
          )}
        </div>
      </div>

      {/* Steeping + About Section */}
      <div style={{ backgroundColor: '#f5f5f5', padding: '48px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>

          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '28px', fontWeight: 'normal' }}>
              Steeping instructions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { icon: '🫖', label: 'SERVING SIZE:', value: '2 tsp per cup, 6 tsp per pot' },
                { icon: '🌡️', label: 'WATER TEMPERATURE:', value: '100°C' },
                { icon: '⏱️', label: 'STEEPING TIME:', value: '3 - 5 minutes' },
                { icon: '🔴', label: 'COLOR AFTER 3 MINUTES', value: '' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #e5e5e5', padding: '14px 0' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0, width: '24px' }}>{item.icon}</span>
                  <p style={{ fontSize: '0.82rem', color: '#444', margin: 0 }}>
                    <strong style={{ fontWeight: '600', fontSize: '0.78rem' }}>{item.label}</strong>
                    {item.value && <span style={{ color: '#666' }}> {item.value}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '28px', fontWeight: 'normal' }}>
              About this tea
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '28px', borderBottom: '1px solid #e5e5e5', paddingBottom: '20px' }}>
              {[
                { label: 'FLAVOR', value: product.flavor || 'Spicy' },
                { label: 'QUALITIES', value: 'Smoothing' },
                { label: 'CAFFEINE', value: 'Medium' },
                { label: 'ALLERGENS', value: 'Nuts-free' },
              ].map((item, index) => (
                <div key={item.label} style={{ borderLeft: index > 0 ? '1px solid #ddd' : 'none', paddingLeft: index > 0 ? '16px' : '0' }}>
                  <p style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#999', marginBottom: '6px', fontWeight: '600' }}>{item.label}</p>
                  <p style={{ fontSize: '0.85rem', color: '#333', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '12px', fontWeight: 'normal' }}>
              Ingredient
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: '1.7', margin: 0 }}>
              Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.
            </p>
          </div>
        </div>
      </div>

      {/* You may also like — Updated to Dollars */}
      {relatedProducts.length > 0 && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '56px 48px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', color: '#1a1a1a', textAlign: 'center', marginBottom: '40px', fontWeight: 'normal' }}>
            You may also like
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {relatedProducts.slice(0, 3).map((p, index) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
              >
                <div style={{
                  backgroundColor: index === 2 ? '#f0f0f0' : 'transparent',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  {p.images && p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '4rem' }}>🍵</span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#444', marginBottom: '2px', lineHeight: '1.4' }}>{p.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '6px' }}>{p.category.replace('-', ' ')}</p>
                <p style={{ fontSize: '0.82rem', color: '#555' }}>
                  ${p.variants[0]?.price}
                  <span style={{ fontSize: '0.75rem', color: '#aaa' }}> / {p.variants[0]?.name}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 48px 56px' }}>
        <ReviewSection productId={id} highlightReviewId={highlightReviewId} highlightReplyId={highlightReplyId} />
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#F4F4F4', color: '#0f0e0e', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>COLLECTIONS</h4>
            {['Black Tea', 'Green Tea', 'White Tea', 'Herbal Tea', 'Matcha', 'Chai', 'Oolong', 'Rooibos'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#010101', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>LEARN</h4>
            {['About us', 'About our teas', 'Tea academy'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#100f0f', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CUSTOMER SERVICE</h4>
            {['Ordering and payment', 'Delivery', 'Privacy and policy', 'Terms & Conditions'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#000000', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CONTACT US</h4>
            <p style={{ fontSize: '0.8rem', color: '#101010', marginBottom: '6px' }}>📍 3 Falahi St, Posdaran Ave</p>
            <p style={{ fontSize: '0.8rem', color: '#060505', marginBottom: '6px' }}>✉ Email: info@teahouse.com</p>
            <p style={{ fontSize: '0.8rem', color: '#0d0101', marginBottom: '6px' }}>📞 Tel: +1-555-000-0000</p>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid #333', paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#060606' }}>© 2026 TEAHOUSE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;