import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { AdminInventory } from './pages/AdminInventory';
import { OrderSuccess } from './pages/OrderSuccess';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/products" replace /> : <Login />
          }
        />
        <Route
          path="/"
          element={
            <Layout>
              {isAuthenticated ? (
                <Navigate to="/products" replace />
              ) : (
                <Navigate to="/login" replace />
              )}
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Layout>
                <Cart />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminInventory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId/success"
          element={
            <ProtectedRoute>
              <Layout>
                <OrderSuccess />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

