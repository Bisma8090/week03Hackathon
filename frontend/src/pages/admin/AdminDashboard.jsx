import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/admin';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    Promise.all([getDashboard(), getAllOrders()])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setOrders(ordersRes.data.orders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      // Re-fetch stats so counts update
      getDashboard().then((res) => setStats(res.data)).catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
      </div>
    );

  return (
    <div className="bg-[#f9f9f9] min-h-screen font-sans">
      <Navbar />

      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 md:p-12">
        {/* Header - Vertical on mobile, horizontal on laptop */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <h1 className="font-serif text-2xl md:text-[1.8rem] text-[#1a1a1a] font-normal text-center md:text-left">
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/admin/products"
              className="px-5 py-2.5 bg-[#1a1a1a] text-white no-underline text-[0.7rem] md:text-[0.8rem] tracking-widest text-center flex-1 md:flex-none"
            >
              MANAGE PRODUCTS
            </Link>
            <Link
              to="/admin/orders"
              className="px-5 py-2.5 border border-gray-300 text-gray-600 no-underline text-[0.7rem] md:text-[0.8rem] tracking-widest text-center flex-1 md:flex-none"
            >
              MANAGE ORDERS
            </Link>
            <Link
              to="/admin/reviews"
              className="px-5 py-2.5 border border-gray-300 text-gray-600 no-underline text-[0.7rem] md:text-[0.8rem] tracking-widest text-center flex-1 md:flex-none"
            >
              MANAGE REVIEWS
            </Link>
            {isSuperAdmin && (
              <Link
                to="/admin/users"
                className="px-5 py-2.5 border border-gray-300 text-gray-600 no-underline text-[0.7rem] md:text-[0.8rem] tracking-widest text-center flex-1 md:flex-none"
              >
                MANAGE USERS
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards - 1 column on mobile, 2 on tablet, 4 on laptop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { 
              label: 'Total Revenue', 
              value: `$${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
              icon: '💰'
            },
            { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦' },
            { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
            { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🍵' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.7rem] tracking-widest text-gray-400 font-bold uppercase">{stat.label}</span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-2xl md:text-[1.8rem] text-[#1a1a1a] font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Order Status Breakdown - 2 columns on mobile, 4 on laptop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending', value: stats?.orderStats?.pending || 0, color: '#f59e0b' },
            { label: 'Processing', value: stats?.orderStats?.processing || 0, color: '#3b82f6' },
            { label: 'Shipped', value: stats?.orderStats?.shipped || 0, color: '#22c55e' },
            { label: 'Delivered', value: stats?.orderStats?.delivered || 0, color: '#16a34a' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between items-center gap-1 shadow-sm">
              <span className="text-[0.8rem] text-gray-500">{stat.label}</span>
              <span className="text-lg font-semibold" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Low Stock Warning */}
        {stats?.lowStockProducts?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-8 shadow-sm">
            <p className="text-[0.82rem] text-amber-800 font-bold mb-2 flex items-center gap-2">
              <span>⚠️</span> Low Stock Alert
            </p>
            <div className="space-y-1">
              {stats.lowStockProducts.map((p) => (
                <p key={p._id} className="text-[0.78rem] text-amber-700">
                  <span className="font-medium">{p.name}</span> — {p.variants.map((v) => `${v.name}: ${v.stock} left`).join(', ')}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders Table Container */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
          <div className="p-5 border-bottom border-gray-100 flex justify-between items-center">
            <h2 className="font-serif text-lg text-[#1a1a1a] font-normal">
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-[0.75rem] text-gray-400 no-underline hover:text-black">
              View all →
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-[0.85rem]">No orders yet</p>
          ) : (
            /* Responsive Table Wrapper */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} className="p-4 text-left text-[0.7rem] tracking-widest text-gray-400 font-bold uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-[0.78rem] text-gray-500">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4 text-[0.78rem] text-gray-800 font-medium">
                        {order.user?.name || 'N/A'}
                      </td>
                      <td className="p-4 text-[0.78rem] text-gray-500">
                        {order.items?.length} item(s)
                      </td>
                      <td className="p-4 text-[0.78rem] text-gray-800 font-semibold">
                        ${(order.totalPrice || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-tighter"
                          style={{
                            backgroundColor: statusColor(order.status).bg,
                            color: statusColor(order.status).color,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-[0.78rem] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="border border-gray-200 p-1.5 text-[0.75rem] text-gray-700 outline-none cursor-pointer bg-white rounded"
                        >
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;