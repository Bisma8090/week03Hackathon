import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/products';
import Navbar from '../../components/layout/Navbar';

const collections = [
  { name: 'BLACK TEA', category: 'black-tea', img: 'https://images.pexels.com/photos/227908/pexels-photo-227908.jpeg' },
  { name: 'GREEN TEA', category: 'green-tea', img: 'https://images.pexels.com/photos/5974071/pexels-photo-5974071.jpeg' },
  { name: 'WHITE TEA', category: 'white-tea', img: 'https://images.pexels.com/photos/230490/pexels-photo-230490.jpeg' },
  { name: 'MATCHA', category: 'green-tea', img: 'https://images.pexels.com/photos/3123792/pexels-photo-3123792.jpeg' },
  { name: 'HERBAL TEA', category: 'herbal-tea', img: 'https://images.pexels.com/photos/4563760/pexels-photo-4563760.jpeg' },
  { name: 'CHAI', category: 'black-tea', img: 'https://images.pexels.com/photos/6415233/pexels-photo-6415233.jpeg' },
  { name: 'OOLONG', category: 'oolong-tea', img: 'https://images.pexels.com/photos/5591738/pexels-photo-5591738.jpeg' },
  { name: 'FOODGE', category: 'herbal-tea', img: 'https://images.pexels.com/photos/2461314/pexels-photo-2461314.jpeg' },
  { name: 'TEAWARE', category: 'white-tea', img: 'https://images.pexels.com/photos/10703315/pexels-photo-10703315.jpeg' },
];

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts({ limit: 6, sortBy: 'rating' })
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'sans-serif' }}>
      <Navbar />

      {/* Hero Section */}
<section className="hero-grid">
  {/* Left - Image */}
  <div className="hero-img" style={{ overflow: 'hidden' }}>
    <img
      src="https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=300"
      alt="Tea"
      style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '500px' }}
    />
  </div>
  {/* Right - Text */}
  <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px 60px 60px', backgroundColor: '#fff' }}>
    <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.8rem', lineHeight: '1.2', color: '#1a1a1a', marginBottom: '1.5rem' }}>
      Every day is unique,<br />just like our tea
    </h1>
    <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '360px' }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mattis lorem vitae ante diam ornare. Donec orci.
    </p>
    <div>
      <Link to="/collections"
        style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '14px 36px', fontSize: '0.8rem', letterSpacing: '0.12em', textDecoration: 'none', display: 'inline-block' }}>
        EXPLORE TEAS
      </Link>
    </div>
  </div>
</section>

{/* Gap */}
<div style={{ height: '24px', backgroundColor: '#fff' }} />

{/* Features Bar — gray background */}
<section style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '20px 0' }}>
  <div className="features-bar" style={{ maxWidth: '1000px', margin: '0 auto' }}>
    {[
      { icon: '🌿', text: '400+ KINDS OF LOOSELEAF TEA' },
      { icon: '✓', text: 'CERTIFICATED ORGANIC TEAS' },
      { icon: '🚚', text: 'FREE DELIVERY' },
      { icon: '🎁', text: 'SAMPLE FOR ALL TEAS' },
    ].map((f, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1rem' }}>{f.icon}</span>
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#555' }}>{f.text}</span>
      </div>
    ))}
  </div>
  <div style={{ textAlign: 'center', marginTop: '16px' }}>
    <Link to="/collections"
      style={{ border: '1px solid #ccc', padding: '8px 28px', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#333', textDecoration: 'none', display: 'inline-block', backgroundColor: '#fff' }}>
      LEARN MORE
    </Link>
  </div>
</section>
  

      {/* Collections Grid */}
<section style={{ padding: '48px 0', backgroundColor: '#fff' }}>
  <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
    <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#1a1a1a', textAlign: 'center', marginBottom: '32px' }}>
      Our Collections
    </h2>

    <div className="collections-home-grid">
      {collections.map((col) => (
        <Link
          key={col.name}
          to={`/collections?category=${col.category}`}
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden' }}>
            <img
              src={col.img}
              alt={col.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
              onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', letterSpacing: '0.12em', color: '#333', marginTop: '8px' }}>
            {col.name}
          </p>
        </Link>
      ))}
    </div>
  </div>
</section>
      {/* Footer */}
      <footer style={{ backgroundColor: '#F4F4F4', color: '#0c0b0b', padding: '48px 32px 24px' }}>
        <div className="max-w-5xl mx-auto footer-grid mb-8">
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>COLLECTIONS</h4>
            {['Black Tea', 'Green Tea', 'White Tea', 'Herbal Tea', 'Matcha', 'Chai', 'Oolong', 'Rooibos', 'Teaware'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#141313', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>LEARN</h4>
            {['Our story', 'Blog', 'About our teas', 'Tea academy'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#131313', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CUSTOMER SERVICE</h4>
            {['Track your order', 'Shipping', 'Privacy policy', 'Terms & conditions'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#0c0c0c', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CONTACT US</h4>
            <p style={{ fontSize: '0.8rem', color: '#060505', marginBottom: '6px' }}>📍 3 South Tea Pleasure Ave, P.O. Box 456, City Name</p>
            <p style={{ fontSize: '0.8rem', color: '#060606', marginBottom: '6px' }}>✉ info@teahouse.com</p>
            <p style={{ fontSize: '0.8rem', color: '#090909', marginBottom: '6px' }}>📞 +92-300-0000000</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto" style={{ borderTop: '1px solid #333', paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#0e0d0d' }}>© 2026 TEAHOUSE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;