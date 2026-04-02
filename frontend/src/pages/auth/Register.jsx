import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import Navbar from '../../components/layout/Navbar';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser(form);
      navigate('/login', { state: { message: 'Account created! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen flex flex-col">
      <Navbar />
      
      {/* Responsive Padding: Mobile par py-10, Desktop par py-20 */}
      <div className="flex-grow flex items-center justify-center py-10 md:py-20 px-4 md:px-6">
        
        {/* Responsive Width: Mobile par 100%, max-width 420px desktop par */}
        <div className="w-full max-w-[420px] bg-white p-6 md:p-12 shadow-sm border border-gray-100 rounded-sm">

          {/* Header Section: Adjusted margins for mobile */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="font-serif text-2xl md:text-[32px] text-gray-900 mb-3 md:mb-4 font-normal tracking-tight">
              Create Account
            </h1>
            <p className="text-[12px] md:text-[14px] text-gray-400 font-light tracking-[0.15em] uppercase px-2">
              Join the tea community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 text-[12px] md:text-[13px] border-l-2 border-red-500">
                {error}
              </div>
            )}

            {/* Input Groups */}
            <div className="space-y-5 md:space-y-6">
              <div className="relative">
                <label className="block text-[10px] text-gray-400 mb-1 md:mb-2 ml-1 tracking-[0.2em] uppercase font-bold">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full border-b border-gray-100 py-2 md:py-3 text-[14px] focus:outline-none focus:border-gray-900 transition-all duration-300 bg-transparent placeholder:text-gray-200"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] text-gray-400 mb-1 md:mb-2 ml-1 tracking-[0.2em] uppercase font-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full border-b border-gray-100 py-2 md:py-3 text-[14px] focus:outline-none focus:border-gray-900 transition-all duration-300 bg-transparent placeholder:text-gray-200"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] text-gray-400 mb-1 md:mb-2 ml-1 tracking-[0.2em] uppercase font-bold">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full border-b border-gray-100 py-2 md:py-3 text-[14px] focus:outline-none focus:border-gray-900 transition-all duration-300 bg-transparent placeholder:text-gray-200"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gray-900 text-white py-3.5 md:py-4 mt-2 text-[11px] md:text-[12px] tracking-[0.2em] font-medium transition-all duration-500
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black hover:shadow-lg active:scale-[0.98]'}`}
            >
              {loading ? 'PROCESSING...' : 'REGISTER'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 md:mt-12 pt-6 border-t border-gray-50">
            <p className="text-[12px] md:text-[13px] text-gray-400">
              Already a member?{' '}
              <Link to="/login" className="text-gray-900 font-medium hover:underline underline-offset-8 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;