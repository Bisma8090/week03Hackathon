import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../api/products';
import Navbar from '../../components/layout/Navbar';

const flavors = [
  { label: 'Spicy', value: 'cinnamon' },
  { label: 'Classic', value: 'classic' },
  { label: 'Floral', value: 'floral' },
  { label: 'Mint', value: 'mint' },
  { label: 'Jasmine', value: 'jasmine' },
];

const Collections = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    flavor: '',
    origin: '',
    qualities: '',
    caffeine: '',
    isOrganic: false,
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    page: 1,
  });

  const [openSections, setOpenSections] = useState({
    collections: true,
    origin: true,
    flavor: true,
    qualities: true,
    caffeine: true,
    allergens: true,
  });

  useEffect(() => {
    setLoading(true);
    const params = {
      page: filters.page,
      limit: 9,
      sortBy: filters.sortBy,
    };
    if (categoryFromUrl) params.category = categoryFromUrl;
    if (filters.flavor) params.flavor = filters.flavor;
    if (filters.origin) params.origin = filters.origin;
    if (filters.qualities) params.qualities = filters.qualities;
    if (filters.caffeine) params.caffeine = filters.caffeine;
    if (filters.isOrganic) params.isOrganic = 'true';
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    getProducts(params)
      .then((res) => {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [categoryFromUrl, filters]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const SidebarSection = ({ title, sectionKey, count, children }) => (
    <div style={{ borderBottom: '1px solid #eee', marginBottom: '4px' }}>
      <div
        onClick={() => toggleSection(sectionKey)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#333', fontWeight: '600' }}>
          {title}
          {count > 0 && (
            <span style={{ marginLeft: '6px', backgroundColor: '#333', color: '#fff', borderRadius: '50%', padding: '1px 5px', fontSize: '0.65rem' }}>
              {count}
            </span>
          )}
        </span>
        <span style={{ fontSize: '0.9rem', color: '#999' }}>
          {openSections[sectionKey] ? '−' : '+'}
        </span>
      </div>
      {openSections[sectionKey] && (
        <div style={{ paddingBottom: '10px' }}>
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxItem = ({ label, checked, onChange }) => (
    <div
      onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', cursor: 'pointer' }}
    >
      <div style={{
        width: '11px', height: '11px',
        border: '1px solid #ccc',
        backgroundColor: checked ? '#333' : '#fff',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '8px' }}>✓</span>}
      </div>
      <span style={{ fontSize: '0.78rem', color: checked ? '#333' : '#888' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Navbar />

      {/* Banner */}
      <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1613987108430-b4bb3863e595?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Collections Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      {/* Breadcrumb */}
      <div className="collections-breadcrumb" style={{ padding: '10px 48px', fontSize: '0.72rem', color: '#999', letterSpacing: '0.05em' }}>
        <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>HOME</Link>
        {' / '}
        <Link to="/collections" style={{ color: '#999', textDecoration: 'none' }}>COLLECTIONS</Link>
        {categoryFromUrl && (
          <span> / {categoryFromUrl.toUpperCase().replace('-', ' ')}</span>
        )}
      </div>

      {/* Main Layout */}
      <div className="collections-layout">

        {/* Sidebar */}
        <div className="collections-sidebar" style={{ width: '180px', flexShrink: 0, paddingTop: '8px' }}>

          <SidebarSection title="COLLECTIONS" sectionKey="collections" count={categoryFromUrl ? 1 : 0}>
            {[
              { label: 'All Teas', value: '' },
              { label: 'Black Tea', value: 'black-tea' },
              { label: 'Green Tea', value: 'green-tea' },
              { label: 'White Tea', value: 'white-tea' },
              { label: 'Herbal Tea', value: 'herbal-tea' },
              { label: 'Oolong Tea', value: 'oolong-tea' },
            ].map((cat) => (
              <Link
                key={cat.label}
                to={cat.value ? `/collections?category=${cat.value}` : '/collections'}
                style={{
                  display: 'block',
                  padding: '5px 0 5px 8px',
                  fontSize: '0.78rem',
                  color: categoryFromUrl === cat.value ? '#1a1a1a' : '#888',
                  fontWeight: categoryFromUrl === cat.value ? '600' : '400',
                  borderLeft: categoryFromUrl === cat.value ? '2px solid #333' : '2px solid transparent',
                  textDecoration: 'none',
                }}
              >
                {cat.label}
              </Link>
            ))}
          </SidebarSection>

          <SidebarSection title="ORIGIN" sectionKey="origin" count={filters.origin ? 1 : 0}>
            {['India', 'China', 'Japan', 'South Africa'].map((o) => (
              <CheckboxItem
                key={o}
                label={o}
                checked={filters.origin === o}
                onChange={() => setFilters((prev) => ({
                  ...prev,
                  origin: prev.origin === o ? '' : o,
                  page: 1,
                }))}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="FLAVOUR" sectionKey="flavor" count={filters.flavor ? 1 : 0}>
            {flavors.map((f) => (
              <CheckboxItem
                key={f.value}
                label={f.label}
                checked={filters.flavor === f.value}
                onChange={() => setFilters((prev) => ({
                  ...prev,
                  flavor: prev.flavor === f.value ? '' : f.value,
                  page: 1,
                }))}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="QUALITIES" sectionKey="qualities" count={filters.qualities ? 1 : 0}>
            {['Energy', 'Relax', 'Protein', 'Digestion'].map((q) => (
              <CheckboxItem
                key={q}
                label={q}
                checked={filters.qualities === q}
                onChange={() => setFilters((prev) => ({
                  ...prev,
                  qualities: prev.qualities === q ? '' : q,
                  page: 1,
                }))}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="CAFFEINE" sectionKey="caffeine" count={filters.caffeine ? 1 : 0}>
            {['No Caffeine', 'Low Caffeine', 'Medium Caffeine', 'High Caffeine'].map((c) => (
              <CheckboxItem
                key={c}
                label={c}
                checked={filters.caffeine === c}
                onChange={() => setFilters((prev) => ({
                  ...prev,
                  caffeine: prev.caffeine === c ? '' : c,
                  page: 1,
                }))}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="ALLERGENS" sectionKey="allergens" count={0}>
            {['Gluten Free', 'Dairy Free', 'Nut Free', 'Soy Free'].map((a) => (
              <CheckboxItem key={a} label={a} checked={false} onChange={() => {}} />
            ))}
          </SidebarSection>

          {/* Organic Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#333', fontWeight: '600' }}>ORGANIC</span>
            <div
              onClick={() => setFilters((prev) => ({ ...prev, isOrganic: !prev.isOrganic, page: 1 }))}
              style={{
                width: '32px', height: '18px',
                backgroundColor: filters.isOrganic ? '#333' : '#ccc',
                borderRadius: '9px', cursor: 'pointer', position: 'relative',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{
                width: '14px', height: '14px', backgroundColor: '#fff', borderRadius: '50%',
                position: 'absolute', top: '2px',
                left: filters.isOrganic ? '16px' : '2px',
                transition: 'left 0.2s',
              }} />
            </div>
          </div>

          {/* Price Filter ($) */}
          <div style={{ paddingTop: '12px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#333', fontWeight: '600', marginBottom: '8px' }}>PRICE ($)</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value, page: 1 }))}
                style={{ width: '72px', border: '1px solid #ddd', padding: '4px 6px', fontSize: '0.75rem', outline: 'none' }}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value, page: 1 }))}
                style={{ width: '72px', border: '1px solid #ddd', padding: '4px 6px', fontSize: '0.75rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Products Area */}
        <div style={{ flex: 1 }}>

          {/* Sort bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '0.08em', marginRight: '8px' }}>SORT BY</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }))}
              style={{ border: 'none', fontSize: '0.8rem', color: '#333', cursor: 'pointer', outline: 'none' }}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#aaa' }}>Loading...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#aaa' }}>No products found</div>
          ) : (
            <div className="collections-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ backgroundColor: '#f9f6f1', aspectRatio: '1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '4rem' }}>🍵</span>
                    )}
                  </div>
                  <div style={{ paddingTop: '10px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '2px' }}>{product.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px' }}>
                      {product.category.replace('-', ' ')}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#333' }}>
                      ${(product.variants[0]?.price || 0).toFixed(2)}
                      <span style={{ fontSize: '0.72rem', color: '#aaa' }}> / {product.variants[0]?.name}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                  style={{
                    width: '32px', height: '32px',
                    border: p === filters.page ? '1px solid #333' : '1px solid #ddd',
                    backgroundColor: p === filters.page ? '#333' : '#fff',
                    color: p === filters.page ? '#fff' : '#333',
                    fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#F4F4F4', color: '#060505', padding: '48px 32px 24px' }}>
        <div className="footer-grid" style={{ maxWidth: '1100px', margin: '0 auto', marginBottom: '32px' }}>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>COLLECTIONS</h4>
            {['Black Tea', 'Green Tea', 'White Tea', 'Herbal Tea', 'Matcha', 'Chai', 'Oolong', 'Rooibos'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#0b0a0a', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>LEARN</h4>
            {['About us', 'About our teas', 'Tea academy'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#0e0d0d', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CUSTOMER SERVICE</h4>
            {['Ordering and payment', 'Delivery', 'Privacy and policy', 'Terms & Conditions'].map((item) => (
              <p key={item} style={{ fontSize: '0.8rem', color: '#070707', marginBottom: '6px' }}>{item}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '16px' }}>CONTACT US</h4>
            <p style={{ fontSize: '0.8rem', color: '#080808', marginBottom: '6px' }}>📍 3 South Tea Pleasure Ave</p>
            <p style={{ fontSize: '0.8rem', color: '#0e0d0d', marginBottom: '6px' }}>✉ info@teahouse.com</p>
            <p style={{ fontSize: '0.8rem', color: '#060606', marginBottom: '6px' }}>📞 +1-800-TEA-TIME</p>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid #333', paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#070707' }}>© 2026 TEAHOUSE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Collections;