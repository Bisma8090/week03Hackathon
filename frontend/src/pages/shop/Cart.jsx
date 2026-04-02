import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../../api/cart';
import { getProducts } from '../../api/products';
import Navbar from '../../components/layout/Navbar';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Loading...</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-serif flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-12 py-8 md:py-12 flex flex-col lg:flex-row gap-10 md:gap-12 items-start flex-grow">

        {/* Left — Cart Items */}
        <div className="w-full lg:flex-1">
          <h1 className="font-serif text-2xl md:text-[1.8rem] text-gray-900 mb-6 md:mb-8 font-normal">
            My bag
          </h1>

          {cart.items.length === 0 ? (
            <div>
              <p className="text-gray-400 text-sm md:text-[0.9rem] mb-6 font-sans">Your bag is empty.</p>
              <Link to="/collections"
                className="bg-gray-900 text-white px-6 md:px-7 py-3 text-xs md:text-[0.8rem] tracking-widest no-underline inline-block font-sans hover:bg-black transition-colors">
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item._id} className="flex flex-col sm:flex-row gap-4 sm:gap-5 pb-6 mb-6 border-b border-gray-100">
                {/* Image */}
                <div className="w-24 h-24 sm:w-[100px] sm:h-[100px] bg-orange-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover mix-blend-multiply" />
                  ) : (
                    <span className="text-3xl sm:text-4xl">🍵</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between pt-1">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm sm:text-[0.95rem] text-gray-900 font-serif mb-0 pr-4">
                        {item.product?.name}
                      </p>
                      {/* Updated Currency Symbol */}
                      <p className="text-sm sm:text-[0.95rem] text-gray-900 font-sans font-medium mb-0 whitespace-nowrap">
                        ${item.variant.price * item.quantity}
                      </p>
                    </div>
                    <p className="text-xs sm:text-[0.8rem] text-gray-500 mb-1 font-sans">
                      Weight: {item.variant.name}
                    </p>
                    {/* Updated Currency Symbol */}
                    <p className="text-xs sm:text-[0.8rem] text-gray-500 font-sans">
                      ${item.variant.price} / item
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-300 bg-white">
                      <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-8 h-9 sm:w-[32px] sm:h-[36px] bg-transparent border-none cursor-pointer text-lg text-gray-600 hover:bg-gray-50">−</button>
                      <span className="w-8 sm:w-[32px] text-center text-[13px] sm:text-[0.9rem] text-gray-800 font-sans">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-8 h-9 sm:w-[32px] sm:h-[36px] bg-transparent border-none cursor-pointer text-lg text-gray-600 hover:bg-gray-50">+</button>
                    </div>

                    <button onClick={() => handleRemove(item._id)}
                      className="bg-transparent border-none cursor-pointer text-[10px] sm:text-[0.75rem] text-gray-500 p-0 underline tracking-wider hover:text-gray-800 transition-colors font-sans">
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right — Order Summary */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 lg:mt-[52px]">
          <div className="bg-gray-50 p-6 md:p-8 mb-6 font-sans">
            <h3 className="font-serif text-lg text-gray-900 mb-6 font-normal">
              Order summary
            </h3>

            <div className="flex justify-between mb-3">
              <span className="text-sm text-gray-500">Subtotal</span>
              {/* Updated Currency Symbol */}
              <span className="text-sm text-gray-900">${cart.totalPrice}</span>
            </div>
            <div className="flex justify-between mb-5 pb-5 border-b border-gray-200">
              <span className="text-sm text-gray-500">Delivery</span>
              <span className="text-sm text-gray-900">Calculate at checkout</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="text-base text-gray-900 font-medium">Total</span>
              {/* Updated Currency Symbol */}
              <span className="text-base text-gray-900 font-medium">${cart.totalPrice}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={cart.items.length === 0}
              className={`w-full bg-gray-900 text-white border-none p-4 text-[13px] tracking-widest transition-colors font-sans
                ${cart.items.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black'}`}
            >
              CHECK OUT
            </button>
          </div>

          <div className="text-center font-sans">
            <p className="text-[11px] text-gray-500 tracking-wider mb-3">WE ACCEPT</p>
            <div className="flex justify-center gap-2 mb-4">
                {['VISA', 'MC', 'AMEX', 'PAY'].map((brand) => (
                  <div key={brand} className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-600 border border-gray-200">
                    {brand}
                  </div>
                ))}
            </div>
            <p className="text-[11px] text-gray-400">
              🔒 Safe & secure payments
            </p>
          </div>
        </div>
      </div>

      {/* Popular Cross sell */}
      {popularProducts.length > 0 && (
        <div className="bg-orange-50/20 py-12 px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-xl md:text-[1.4rem] text-gray-900 text-center mb-8 md:mb-10 font-normal">
              Popular With Women
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-12 md:px-12">
              {popularProducts.map((p, index) => (
                <Link key={p._id} to={`/product/${p._id}`} className={`no-underline text-inherit text-center group ${index === 2 ? 'col-span-2 lg:col-span-1 hidden sm:block' : ''}`}>
                  <div className="h-32 md:h-40 flex items-center justify-center mb-4 mix-blend-multiply overflow-hidden bg-white/50 group-hover:bg-white transition-colors">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 p-4" />
                    ) : (
                      <span className="text-[3rem] md:text-[4rem]">🍵</span>
                    )}
                  </div>
                  <p className="text-[13px] md:text-[0.85rem] text-gray-800 mb-1 font-serif group-hover:text-black">{p.name}</p>
                  <p className="text-[10px] md:text-[0.75rem] text-gray-500 mb-1.5 font-sans track-wider uppercase">{p.category.replace('-', ' ')}</p>
                  {/* Updated Currency Symbol in cross-sell */}
                  <p className="text-[13px] md:text-[0.8rem] text-gray-800 font-sans font-medium mb-0">
                    ${p.variants[0]?.price}
                    <span className="text-[10px] md:text-[0.7rem] text-gray-400 font-normal ml-1">/ {p.variants[0]?.name}</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer code remains same */}
    </div>
  );
};

export default Cart;