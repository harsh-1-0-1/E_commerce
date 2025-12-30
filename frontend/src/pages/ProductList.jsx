import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { Loading } from '../components/Loading';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState({});
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getProducts();
      setProducts(productsData || []);

      // Fetch inventory for each product
      const inventoryPromises = productsData.map(async (product) => {
        try {
          const inventory = await inventoryService.getInventory(product.id);
          return { productId: product.id, inventory };
        } catch (error) {
          // Inventory might not exist yet
          return { productId: product.id, inventory: null };
        }
      });

      const inventoryResults = await Promise.all(inventoryPromises);
      const inventoryMap = {};
      inventoryResults.forEach(({ productId, inventory }) => {
        inventoryMap[productId] = inventory;
      });
      setInventories(inventoryMap);
    } catch (error) {
      showToast(
        error.response?.data?.error || 'Failed to load products',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStock = (productId) => {
    const inventory = inventories[productId];
    if (!inventory) return 0;
    return inventory.available_stock || 0;
  };

  if (loading) {
    return <Loading />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 text-lg">No products available</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Products</h1>
        <p className="text-neutral-600">Browse our collection</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const availableStock = getAvailableStock(product.id);
          const isOutOfStock = availableStock === 0;

          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative mb-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-neutral-200 rounded-lg flex items-center justify-center">
                    <span className="text-neutral-400">No Image</span>
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute top-2 right-2 badge badge-danger">
                    Out of Stock
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-600">
                  ${product.price?.toFixed(2) || '0.00'}
                </span>
                <span className="text-sm text-neutral-500">
                  {availableStock} available
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};

