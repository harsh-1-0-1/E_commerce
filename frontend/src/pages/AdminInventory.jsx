import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { Loading } from '../components/Loading';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

export const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [formData, setFormData] = useState({});
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        error.response?.data?.error || 'Failed to load data',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInventory = async (productId) => {
    const totalStock = parseInt(formData[productId]?.totalStock) || 0;
    if (totalStock <= 0) {
      showToast('Total stock must be greater than 0', 'error');
      return;
    }

    try {
      await inventoryService.createInventory(productId, totalStock);
      showToast('Inventory created successfully', 'success');
      setFormData({ ...formData, [productId]: {} });
      await loadData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to create inventory';
      showToast(errorMessage, 'error');
    }
  };

  const handleUpdateInventory = async (productId) => {
    const totalStock = parseInt(formData[productId]?.totalStock) || 0;
    if (totalStock < 0) {
      showToast('Total stock cannot be negative', 'error');
      return;
    }

    try {
      await inventoryService.updateInventory(productId, totalStock);
      showToast('Inventory updated successfully', 'success');
      setEditing({ ...editing, [productId]: false });
      setFormData({ ...formData, [productId]: {} });
      await loadData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to update inventory';
      showToast(errorMessage, 'error');
    }
  };

  const startEdit = (productId, currentStock) => {
    setEditing({ ...editing, [productId]: true });
    setFormData({
      ...formData,
      [productId]: { totalStock: currentStock },
    });
  };

  const cancelEdit = (productId) => {
    setEditing({ ...editing, [productId]: false });
    setFormData({ ...formData, [productId]: {} });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          Inventory Management
        </h1>
        <p className="text-neutral-600">
          Manage stock levels for all products
        </p>
      </div>

      <div className="space-y-4">
        {products.map((product) => {
          const inventory = inventories[product.id];
          const isEditing = editing[product.id];

          return (
            <div key={product.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Product ID: {product.id}
                  </p>

                  {inventory ? (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-neutral-500">Total Stock</p>
                        <p className="text-lg font-semibold text-neutral-800">
                          {inventory.total_stock}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">
                          Available Stock
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            inventory.available_stock > 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {inventory.available_stock}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">
                          Reserved Stock
                        </p>
                        <p className="text-lg font-semibold text-neutral-800">
                          {inventory.reserved_stock}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-500 mb-4">
                      No inventory record found
                    </p>
                  )}
                </div>

                <div className="ml-6">
                  {inventory ? (
                    <>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            min="0"
                            value={formData[product.id]?.totalStock || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [product.id]: {
                                  totalStock: e.target.value,
                                },
                              })
                            }
                            className="input w-32"
                            placeholder="Total stock"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateInventory(product.id)
                              }
                              className="btn btn-primary text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => cancelEdit(product.id)}
                              className="btn btn-secondary text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit(product.id, inventory.total_stock)
                          }
                          className="btn btn-outline"
                        >
                          Update Stock
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="number"
                        min="1"
                        value={formData[product.id]?.totalStock || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [product.id]: {
                              totalStock: e.target.value,
                            },
                          })
                        }
                        className="input w-32"
                        placeholder="Initial stock"
                      />
                      <button
                        onClick={() => handleCreateInventory(product.id)}
                        className="btn btn-primary w-full text-sm"
                      >
                        Create Inventory
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

