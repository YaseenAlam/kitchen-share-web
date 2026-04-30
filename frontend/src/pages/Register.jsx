import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || 'Registration failed');
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
            Join your local food community
          </h1>
          
          <p className="text-xl text-white/80 mb-12 leading-relaxed">
            Whether you're a home cook ready to share your recipes or a food lover looking for authentic meals — there's a place for you here.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">1</div>
              <p className="text-lg text-white">Create your free account</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">2</div>
              <p className="text-lg text-white">Browse dishes or become a cook</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">3</div>
              <p className="text-lg text-white">Connect with your neighbors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
                Create Account
              </h2>
              <p className="mt-2" style={{ color: 'var(--color-gray-500)' }}>
                Start your food journey today
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Google Sign Up */}
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google signup failed')}
                shape="rectangular"
                size="large"
                text="signup_with"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm" style={{ color: 'var(--color-gray-400)' }}>or sign up with email</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="yourname"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="you@example.com"
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.password2}
                  onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-6" style={{ color: 'var(--color-gray-600)' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-gray-400)' }}>
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;