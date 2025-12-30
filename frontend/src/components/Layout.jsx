import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                E-Commerce
              </Link>
            </div>
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/products"
                    className="text-neutral-700 hover:text-primary-600 transition-colors"
                  >
                    Products
                  </Link>
                  <Link
                    to="/cart"
                    className="text-neutral-700 hover:text-primary-600 transition-colors"
                  >
                    Cart
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/inventory"
                      className="text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      Inventory
                    </Link>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-600">
                      {user?.full_name || user?.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

