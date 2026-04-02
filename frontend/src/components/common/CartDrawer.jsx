import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../../api/cart';

const CartDrawer = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Updated delivery fee to a dollar-appropriate value
  const DELIVERY = 5.00; 

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await updateCartItem(itemId, { quantity: newQty });
      // Merge updated cart but preserve product population from existing state
      const updatedCart = res.data;
      setCart((prev) => ({
        ...updatedCart,
        items: updatedCart.items.map((updatedItem) => {
          const existing = prev.items.find((i) => i._id === updatedItem._id);
          return existing ? { ...updatedItem, product: existing.product } : updatedItem;
        }),
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating quantity');
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

  const handlePurchase = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 998,
          }}
        />
      )}

      {/* Drawer */}
      <div className="cart-drawer" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '380px',
        backgroundColor: '#fff',
        zIndex: 999,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', color: '#1a1a1a', fontWeight: 'normal', margin: 0 }}>
            My Bag
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#666', padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading ? (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '40px', fontSize: '0.85rem' }}>Loading...</p>
          ) : cart.items.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '40px', fontSize: '0.85rem' }}>Your bag is empty</p>
          ) : (
            cart.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '16px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>

                {/* Image */}
                <div style={{ width: '64px', height: '64px', backgroundColor: '#f5f5f5', flexShrink: 0, overflow: 'hidden' }}>
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍵</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.82rem', color: '#333', marginBottom: '2px', lineHeight: '1.3' }}>
                    {item.product?.name} - {item.variant.name}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#333', padding: '0' }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: '0.85rem', color: '#333', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#333', padding: '0' }}
                      >
                        +
                      </button>
                    </div>
                    {/* Updated to $ */}
                    <p style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500' }}>
                      ${(item.variant.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#999', padding: '0', marginTop: '4px', letterSpacing: '0.05em', textDecoration: 'underline' }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — Totals + Purchase */}
        {cart.items.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#555' }}>Subtotal</span>
              {/* Updated to $ */}
              <span style={{ fontSize: '0.85rem', color: '#333' }}>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
              <span style={{ fontSize: '0.85rem', color: '#555' }}>Delivery</span>
              {/* Updated to $ */}
              <span style={{ fontSize: '0.85rem', color: '#333' }}>${DELIVERY.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.95rem', color: '#1a1a1a', fontWeight: '500' }}>Total</span>
              {/* Updated to $ */}
              <span style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>${(cart.totalPrice + DELIVERY).toFixed(2)}</span>
            </div>
            <button
              onClick={handlePurchase}
              style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: 'none',
                padding: '16px',
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                cursor: 'pointer',
              }}
            >
              PURCHASE
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;