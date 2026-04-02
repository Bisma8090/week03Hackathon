import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || '';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      const userData = res.data.user || res.data;
      login(userData, res.data.token);
      if (location.state?.from) {
        navigate(location.state.from);
      } else if (userData.role === 'admin' || userData.role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />
      
      {/* Wrapper: Mobile par kam padding (py-8), Desktop par zyada (py-16) */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 md:py-16">
        
        {/* Card: Mobile par padding px-6, Desktop par px-12 */}
        <div className="w-full max-w-[420px] bg-white rounded-[24px] md:rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8 md:px-12 md:py-14">
          
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm font-medium px-2">
              Please enter your details to sign in
            </p>
          </div>

          {successMessage && (
            <div className="w-full mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-[11px] md:text-xs font-bold flex items-center gap-3">
              ✓ {successMessage}
            </div>
          )}

          {error && (
            <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] md:text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full h-12 md:h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-slate-900 text-sm focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <Link to="/forgot" className="text-[11px] font-bold text-slate-900 hover:opacity-70 transition-opacity">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 md:h-14 pl-12 pr-12 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-slate-900 text-sm focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 md:h-14 bg-slate-900 text-white rounded-xl md:rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
              </button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="mt-8 md:mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account? {' '}
              <Link to="/register" className="text-slate-900 font-bold hover:underline decoration-2 underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;