import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { cartService } from '../services/cartService';
import { Loading } from '../components/Loading';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(id);
      setProduct(productData);

      try {
        const inventoryData = await inventoryService.getInventory(id);
        setInventory(inventoryData);
      } catch (error) {
        // Inventory might not exist
        setInventory(null);
      }
    } catch (error) {
      showToast(
        error.response?.data?.error || 'Failed to load product',
        'error'
      );
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const availableStock = inventory?.available_stock || 0;
    if (availableStock === 0) {
      showToast('Product is out of stock', 'error');
      return;
    }

    if (quantity > availableStock) {
      showToast(
        `Only ${availableStock} items available in stock`,
        'error'
      );
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addItem(product.id, quantity);
      showToast('Item added to cart successfully!', 'success');
      setQuantity(1);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to add item to cart';
      showToast(errorMessage, 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 text-lg">Product not found</p>
      </div>
    );
  }

  const availableStock = inventory?.available_stock || 0;
  const isOutOfStock = availableStock === 0;
  const maxQuantity = Math.min(availableStock, 10);

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <button
        onClick={() => navigate('/products')}
        className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-neutral-200 rounded-xl flex items-center justify-center">
              <span className="text-neutral-400 text-lg">No Image</span>
            </div>
          )}
        </div>

        <div className="card">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            {product.name}
          </h1>

          <div className="mb-6">
            <span className="text-4xl font-bold text-primary-600">
              ${product.price?.toFixed(2) || '0.00'}
            </span>
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                Description
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Stock Information
            </h2>
            {inventory ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Available:</span>
                  <span
                    className={`font-semibold ${
                      isOutOfStock ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {availableStock} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Stock:</span>
                  <span className="font-semibold text-neutral-800">
                    {inventory.total_stock} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Reserved:</span>
                  <span className="font-semibold text-neutral-800">
                    {inventory.reserved_stock} units
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500">Inventory not available</p>
            )}
          </div>

          {!isOutOfStock && (
            <div className="mb-6">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), maxQuantity));
                }}
                className="input w-32"
              />
              <p className="text-sm text-neutral-500 mt-1">
                Maximum {maxQuantity} items
              </p>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className={`btn btn-primary w-full ${
              isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : addingToCart
              ? 'Adding...'
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </>
  );
};

