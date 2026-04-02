import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles, userOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  // Admin/superadmin should not access user-only shop pages
  if (userOnly && (user.role === 'admin' || user.role === 'superadmin')) {
    return <Navigate to="/admin" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;