import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, cancelOrder } from '../../api/orders';
import Navbar from '../../components/layout/Navbar';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
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
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '32px', fontWeight: 'normal' }}>
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '24px' }}>You have no orders yet.</p>
            <Link to="/collections"
              style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '12px 28px', fontSize: '0.8rem', letterSpacing: '0.12em', textDecoration: 'none', display: 'inline-block' }}>
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => (
              <div key={order._id} style={{ border: '1px solid #eee', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '4px' }}>Order ID: {order._id}</p>
                    <p style={{ fontSize: '0.82rem', color: '#555' }}>
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.95rem', color: '#1a1a1a', fontWeight: '500', marginBottom: '4px' }}>
                      Total: Rs. {order.totalPrice}
                    </p>
                    <span style={{
                      display: 'inline-block', padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px',
                      backgroundColor: order.status === 'delivered' ? '#e6fffa' : order.status === 'cancelled' ? '#fff5f5' : '#ebf8ff',
                      color: order.status === 'delivered' ? '#38a169' : order.status === 'cancelled' ? '#e53e3e' : '#3182ce',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', backgroundColor: '#f9f6f1', overflow: 'hidden' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍵</div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: '#333', marginBottom: '4px' }}>{item.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#888' }}>
                          Variant: {item.variant.name} | Qty: {item.quantity} | Unit Price: Rs. {item.variant.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.status === 'pending' && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'right' }}>
                    <button
                      onClick={() => handleCancel(order._id)}
                      style={{ background: 'none', border: 'none', color: '#e53e3e', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>© 2026 TEAHOUSE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MyOrders;