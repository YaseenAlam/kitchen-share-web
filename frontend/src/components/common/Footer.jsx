import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍳</span>
              <span className="font-display text-xl" style={{ color: 'var(--color-primary)' }}>
                Kitchen Share
              </span>
            </Link>
            <p className="text-sm mb-4" style={{ color: 'var(--color-gray-600)' }}>
              Discover delicious homemade food from talented cooks in your neighborhood. 
              Fresh, local, made with love.
            </p>
            <div className="flex gap-4">
              <span className="text-xl cursor-pointer hover:scale-110 transition-transform">📸</span>
              <span className="text-xl cursor-pointer hover:scale-110 transition-transform">🐦</span>
              <span className="text-xl cursor-pointer hover:scale-110 transition-transform">📘</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--color-dark)' }}>Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:underline" style={{ color: 'var(--color-gray-600)' }}>
                  Browse Dishes
                </Link>
              </li>
              <li>
                <Link to="/cook-setup" className="text-sm hover:underline" style={{ color: 'var(--color-gray-600)' }}>
                  Become a Cook
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm hover:underline" style={{ color: 'var(--color-gray-600)' }}>
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4" style={{ color: 'var(--color-dark)' }}>Support</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                  📧 help@kitchenshare.com
                </span>
              </li>
              <li>
                <span className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                  📍 La Mirada, CA
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
            © {new Date().getFullYear()} Kitchen Share. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: 'var(--color-gray-400)' }}>
            Made with ❤️ for neighbors
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;