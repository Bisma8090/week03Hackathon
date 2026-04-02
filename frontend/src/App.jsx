import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Shop Pages
import Home from './pages/shop/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Collections from './pages/shop/Collections';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import MyOrders from './pages/shop/MyOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* --- USER PROTECTED ROUTES --- */}
          {/* These require a login, admins are redirected to /admin */}
          <Route path="/cart" element={
            <ProtectedRoute userOnly>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute userOnly>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute userOnly>
              <MyOrders />
            </ProtectedRoute>
          } />

          {/* --- ADMIN ONLY ROUTES --- */}
          {/* These strictly require admin or superadmin roles */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['superadmin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <AdminReviews />
            </ProtectedRoute>
          } />

          {/* --- 404 CATCH ALL --- */}
          {/* Redirects any unknown route back to home or a 404 page */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;