import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../../api/cart';
import { placeOrder } from '../../api/orders';
import { getProducts } from '../../api/products';
import Navbar from '../../components/layout/Navbar';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    country: 'United States', // Updated default country
  });
  const navigate = useNavigate();
  
  // Updated delivery fee to a dollar amount (e.g., $5.00)
  const DELIVERY = 5.00; 

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCart(),
      getProducts({ limit: 3, sortBy: 'rating' }),
    ])
      .then(([cartRes, productsRes]) => {
        setCart(cartRes.data);
        setPopularProducts(productsRes.data.products);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await updateCartItem(itemId, { quantity: newQty });
      setCart(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const res = await removeFromCart(itemId);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      setError('Please fill all delivery fields');
      return;
    }
    setPlacing(true);
    setError('');
    try {
      await placeOrder({ shippingAddress: form });
      navigate('/my-orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar />

      {/* Stepper */}
      <div style={{ borderBottom: '1px solid #eee', padding: '16px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[
            { num: 1, label: 'MY BAG' },
            { num: 2, label: 'DELIVERY' },
            { num: 3, label: 'REVIEW & PAYMENT' },
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {i > 0 && <div style={{ width: '40px', height: '1px', backgroundColor: '#ddd' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: step >= s.num ? '#1a1a1a' : '#fff',
                  border: '1px solid #1a1a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', color: step >= s.num ? '#fff' : '#1a1a1a',
                  fontWeight: '600',
                }}>
                  {s.num}
                </span>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: step >= s.num ? '#1a1a1a' : '#aaa' }}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 48px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px', alignItems: 'start' }}>

        {/* Left — Cart Items / Delivery Form */}
        <div>
          {step === 1 && (
            <div>
              {cart.items.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Your bag is empty</p>
              ) : (
                cart.items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '16px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: '72px', height: '72px', backgroundColor: '#f5f5f5', flexShrink: 0, overflow: 'hidden' }}>
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍵</div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.82rem', color: '#333', marginBottom: '2px' }}>
                        {item.product?.name} - {item.variant.name}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '8px' }}>
                        ${item.variant.price}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#333' }}>−</button>
                          <span style={{ fontSize: '0.85rem', color: '#333' }}>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#333' }}>+</button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500' }}>
                          ${(item.variant.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button onClick={() => handleRemove(item._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#999', padding: '0', marginTop: '6px', textDecoration: 'underline', letterSpacing: '0.05em' }}>
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))
              )}

              {cart.items.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>Subtotal</span>
                  <span style={{ fontSize: '0.85rem', color: '#333' }}>${cart.totalPrice.toFixed(2)}</span>
                </div>
              )}

              <Link to="/collections"
                style={{ display: 'inline-block', border: '1px solid #ddd', padding: '10px 24px', fontSize: '0.78rem', letterSpacing: '0.08em', color: '#555', textDecoration: 'none' }}>
                BACK TO SHOPPING
              </Link>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '24px', fontWeight: 'normal' }}>
                Delivery Information
              </h3>

              {[
                { label: 'Full Name', key: 'fullName', placeholder: 'Your full name' },
                { label: 'Phone', key: 'phone', placeholder: '+1 (000) 000-0000' },
                { label: 'Address', key: 'address', placeholder: 'Street address' },
                { label: 'City', key: 'city', placeholder: 'City' },
                { label: 'Country', key: 'country', placeholder: 'United States' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#555', marginBottom: '6px' }}>{field.label}</label>
                  <input
                    type="text"
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ width: '100%', border: '1px solid #ddd', padding: '10px 14px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              {error && (
                <p style={{ fontSize: '0.82rem', color: '#e53e3e', marginBottom: '16px' }}>{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Right — Order Summary */}
        <div>
          <div style={{ border: '1px solid #eee', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '20px', fontWeight: 'normal' }}>
              Order summary
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#555' }}>Subtotal</span>
              <span style={{ fontSize: '0.82rem', color: '#333' }}>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
              <span style={{ fontSize: '0.82rem', color: '#555' }}>Delivery</span>
              <span style={{ fontSize: '0.82rem', color: '#333' }}>${DELIVERY.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.95rem', color: '#1a1a1a', fontWeight: '500' }}>Total</span>
              <span style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>${(cart.totalPrice + DELIVERY).toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '20px' }}>
              Estimated shipping time: 2-5 days
            </p>

            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                disabled={cart.items.length === 0}
                style={{ width: '100%', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '14px', fontSize: '0.82rem', letterSpacing: '0.12em', cursor: 'pointer', opacity: cart.items.length === 0 ? 0.5 : 1 }}
              >
                CHECK OUT
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                style={{ width: '100%', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '14px', fontSize: '0.82rem', letterSpacing: '0.12em', cursor: 'pointer', opacity: placing ? 0.7 : 1 }}
              >
                {placing ? 'PLACING ORDER...' : 'PLACE ORDER'}
              </button>
            )}
          </div>

          <div style={{ border: '1px solid #eee', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '16px', fontWeight: 'normal' }}>
              Delivery and return
            </h3>
            {[
              'Order before 13:00 and we will ship the same day.',
              'Orders made after Friday 13:00 are processed on Monday.',
              'To return your articles, please contact us first.',
              'Postal charges for return are not reimbursed.',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <span style={{ color: '#555', fontSize: '0.78rem', flexShrink: 0 }}>›</span>
                <p style={{ fontSize: '0.78rem', color: '#666', margin: 0, lineHeight: '1.5' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular this season */}
      {popularProducts.length > 0 && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 48px 56px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#1a1a1a', textAlign: 'center', marginBottom: '32px', fontWeight: 'normal' }}>
            Popular this season
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {popularProducts.map((p, index) => (
              <Link key={p._id} to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
                <div style={{ backgroundColor: index === 2 ? '#f0f0f0' : 'transparent', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '4rem' }}>🍵</span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#444', marginBottom: '2px' }}>{p.name}</p>
                <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px' }}>{p.category.replace('-', ' ')}</p>
                <p style={{ fontSize: '0.8rem', color: '#555' }}>
                  ${p.variants[0]?.price}
                  <span style={{ fontSize: '0.72rem', color: '#aaa' }}> / {p.variants[0]?.name}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#F4F4F4', color: '#0a0909', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>COLLECTIONS</h4>
            {['Black Tea', 'Green Tea', 'White Tea', 'Herbal Tea', 'Matcha', 'Chai', 'Oolong', 'Rooibos'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#0b0b0b', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>LEARN</h4>
            {['About us', 'About our teas', 'Tea academy'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#050505', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CUSTOMER SERVICE</h4>
            {['Ordering and payment', 'Delivery', 'Privacy and policy', 'Terms & Conditions'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#080808', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CONTACT US</h4>
            <p style={{ fontSize: '0.8rem', color: '#020202', marginBottom: '6px' }}>📍 123 Tea Lane, New York, NY</p>
            <p style={{ fontSize: '0.8rem', color: '#050404', marginBottom: '6px' }}>✉ Email: info@teahouse.com</p>
            <p style={{ fontSize: '0.8rem', color: '#020202', marginBottom: '6px' }}>📞 Tel: +1 (555) 000-0000</p>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid #333', paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#080808' }}>© 2026 TEAHOUSE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;