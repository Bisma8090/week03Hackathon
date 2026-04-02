import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct, createProduct } from '../../api/products';
import Navbar from '../../components/layout/Navbar';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '', 
    description: '', 
    category: 'green-tea',
    flavor: '', 
    rating: 4.0, 
    images: [''], // URL isi array mein jayega
    variants: [{ name: '250g', price: 15.00, stock: 50 }],
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://week03-hackathon.vercel.app';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    getProducts({ limit: 50 })
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const handleAddVariant = () => {
    setForm((prev) => ({ 
      ...prev, 
      variants: [...prev.variants, { name: '', price: 0, stock: 0 }] 
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...form.variants];
    updated[index][field] = field === 'price' || field === 'stock' ? Number(value) : value;
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  // Simplified handleSubmit (No FormData needed for just URLs)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ab hum direct form object bhej sakte hain
      const productData = {
        ...form,
        // Ensure image array is correct
        images: [form.images[0]]
      };

      await createProduct(productData);
      
      alert("Product Created Successfully!");
      setShowForm(false);
      setForm({
        name: '', description: '', category: 'green-tea', flavor: '', rating: 4.0, images: [''],
        variants: [{ name: '250g', price: 15.00, stock: 50 }],
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating product');
    }
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar />
      <div className="admin-page-pad" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 48px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a', margin: 0 }}>Product Inventory</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 24px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {showForm ? 'CANCEL' : '+ ADD PRODUCT'}
          </button>
        </div>

        {showForm && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #eee', padding: '28px', borderRadius: '8px', marginBottom: '24px' }}>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '6px' }}>Product Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    style={{ width: '100%', border: '1px solid #ddd', padding: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '6px' }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', border: '1px solid #ddd', padding: '8px' }}>
                    {['green-tea', 'black-tea', 'white-tea', 'herbal-tea', 'oolong-tea'].map((c) => (
                      <option key={c} value={c}>{c.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '6px' }}>Image URL Only</label>
                <input 
                  value={form.images[0]} 
                  onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                  placeholder="https://images.pexels.com/..."
                  required
                  style={{ width: '100%', border: '1px solid #ddd', padding: '8px', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '6px' }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={2}
                  style={{ width: '100%', border: '1px solid #ddd', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '10px' }}>Variants</label>
                {form.variants.map((variant, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    <input placeholder="Size" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} style={{ border: '1px solid #ddd', padding: '8px' }} />
                    <input placeholder="Price" type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} style={{ border: '1px solid #ddd', padding: '8px' }} />
                    <input placeholder="Stock" type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} style={{ border: '1px solid #ddd', padding: '8px' }} />
                  </div>
                ))}
              </div>

              <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '12px 32px', cursor: 'pointer' }}>
                SAVE PRODUCT
              </button>
            </form>
          </div>
        )}

        {/* Responsive Table */}
        <div className="admin-table-wrap" style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.72rem' }}>PRODUCT</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.72rem' }}>CATEGORY</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.72rem' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={product.images[0]} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.82rem' }}>{product.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.78rem' }}>{product.category}</td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => handleDelete(product._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;