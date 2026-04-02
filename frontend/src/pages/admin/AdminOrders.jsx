import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import Navbar from '../../components/layout/Navbar';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders()
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status } : o)
      );
    } catch (err) {
      alert('Error updating status');
    }
  };

  const statusColor = (status) => {
    const colors = {
      pending: { bg: '#fff8e1', color: '#f59e0b' },
      processing: { bg: '#e3f2fd', color: '#3b82f6' },
      shipped: { bg: '#e8f5e9', color: '#22c55e' },
      delivered: { bg: '#f0fdf4', color: '#16a34a' },
      cancelled: { bg: '#fff1f2', color: '#ef4444' },
    };
    return colors[status] || { bg: '#f5f5f5', color: '#888' };
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar />
      <div className="admin-page-pad" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 48px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Link to="/admin" style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none' }}>← Dashboard</Link>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a', fontWeight: 'normal', margin: 0 }}>
            Orders
          </h1>
        </div>

        <div className="admin-table-wrap" style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#aaa' }}>Loading...</p>
          ) : orders.length === 0 ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#aaa' }}>No orders yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9f9f9' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Address', 'Status', 'Date', 'Update'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', letterSpacing: '0.08em', color: '#888', fontWeight: '600', borderBottom: '1px solid #eee' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#555' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#333' }}>
                      {order.user?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#555' }}>
                      {order.items?.length} item(s)
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#333', fontWeight: '500' }}>
                      Rs. {order.totalPrice}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: '#888' }}>
                      {order.shippingAddress?.city}, {order.shippingAddress?.country}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem',
                        backgroundColor: statusColor(order.status).bg,
                        color: statusColor(order.status).color,
                        fontWeight: '500',
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: '#888' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        style={{ border: '1px solid #ddd', padding: '4px 8px', fontSize: '0.75rem', color: '#333', outline: 'none', cursor: 'pointer' }}
                      >
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;