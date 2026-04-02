import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, X, Package, LogOut, LayoutDashboard } from 'lucide-react';
import CartDrawer from '../common/CartDrawer';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // NAV LINKS
  const adminNavLinks = [
    { label: 'DASHBOARD', path: '/admin' },
    { label: 'PRODUCTS', path: '/admin/products' },
    { label: 'ORDERS', path: '/admin/orders' },
    { label: 'USERS', path: '/admin/users' },
  ];

  const userNavLinks = [
    { label: 'TEA COLLECTIONS', path: '/collections' },
    { label: 'ACCESSORIES', path: '/' },
    { label: 'BLOG', path: '/' },
    { label: 'CONTACT US', path: '/' },
  ];

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  return (
    <>
      <nav style={{
        borderBottom: '1px solid #eee',
        padding: '16px 20px',
        backgroundColor: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>

          {/* LEFT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-only"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
            >
              <Menu size={24} />
            </button>

            <Link to={isAdmin ? '/admin' : '/'} style={{ textDecoration: 'none' }}>
              <span style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#1A1A1A',
                letterSpacing: '0.05em'
              }}>
                BRAND NAME
              </span>
            </Link>
          </div>

          {/* CENTER */}
          <div className="desktop-only" style={{ display: 'flex', gap: '30px' }}>
            {navLinks.map((item) => (
              <Link key={item.label} to={item.path}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: '#1A1A1A',
                  textDecoration: 'none'
                }}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>

            {!isAdmin && (
              <button onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'none', border: 'none' }}>
                <Search size={20} />
              </button>
            )}

            {/* USER MENU */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ background: 'none', border: 'none' }}>
                <User size={20} />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: '#fff',
                  padding: '10px',
                  border: '1px solid #eee'
                }}>
                  {user ? (
                    <>
                      <p>{user.name}</p>

                      {isAdmin ? (
                        <Link to="/admin">Dashboard</Link>
                      ) : (
                        <Link to="/my-orders">My Orders</Link>
                      )}

                      <button onClick={handleLogout}>Logout</button>
                    </>
                  ) : (
                    <Link to="/login">Login</Link>
                  )}
                </div>
              )}
            </div>

            {!isAdmin && (
              <button onClick={() => user ? setCartOpen(true) : navigate('/login')}>
                <ShoppingBag size={20} />
              </button>
            )}

            {/* Notification Bell — visible to logged-in users */}
            {user && <NotificationBell />}
          </div>
        </div>

        {/* SEARCH */}
        {searchOpen && (
          <input placeholder="Search..." style={{ width: '100%' }} />
        )}
      </nav>

      {!isAdmin && (
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      )}

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div style={{ width: '250px', background: '#fff', height: '100%' }}>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X />
            </button>

            {navLinks.map((item) => (
              <Link key={item.label} to={item.path}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;