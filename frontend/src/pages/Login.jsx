import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Clean Marketing */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-5xl">🍳</span>
            <span className="font-display text-3xl font-bold text-white">Kitchen Share</span>
          </div>
          
          <h1 className="font-display text-5xl font-bold text-white mb-6 leading-tight">
            Homemade food from your neighbors
          </h1>
          
          <p className="text-xl text-white/80 mb-12 leading-relaxed">
            Connect with local home cooks and discover authentic, delicious meals made with love — right in your neighborhood.
          </p>

          <div className="flex items-center gap-8 text-white/90">
            <div className="text-center">
              <p className="text-4xl font-bold">500+</p>
              <p className="text-sm text-white/70">Home Cooks</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <p className="text-4xl font-bold">2,000+</p>
              <p className="text-sm text-white/70">Dishes</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <p className="text-4xl font-bold">4.9★</p>
              <p className="text-sm text-white/70">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🍳</span>
            <h1 className="font-display text-3xl font-bold mt-2" style={{ color: 'var(--color-primary)' }}>
              Kitchen Share
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--color-dark)' }}>
                Welcome Back
              </h2>
              <p className="mt-2" style={{ color: 'var(--color-gray-500)' }}>
                Sign in to continue
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Email Address or Username
                </label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="Username or you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm" style={{ color: 'var(--color-gray-400)' }}>or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                shape="rectangular"
                size="large"
              />
            </div>

            {/* Sign Up Link */}
            <p className="text-center mt-8" style={{ color: 'var(--color-gray-600)' }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;