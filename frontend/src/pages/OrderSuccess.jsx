import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { Loading } from '../components/Loading';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';
import { Link } from 'react-router-dom';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    // Get orderId from URL params or location state
    const id = orderId || location.state?.orderId;
    if (id) {
      loadOrder(id);
    } else {
      showToast('Order ID not found', 'error');
      navigate('/cart');
    }
  }, [orderId, location.state]);

  const loadOrder = async (id) => {
    try {
      setLoading(true);
      const orderData = await paymentService.getOrder(id);
      setOrder(orderData);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to load order details';
      showToast(errorMessage, 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Order Not Found
          </h1>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-neutral-600 text-lg">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                Order #{order.order?.order_id || orderId}
              </h2>
              <p className="text-neutral-600">
                Status:{' '}
                <span className="font-semibold text-emerald-600">
                  {order.order?.status || 'PAID'}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-neutral-600 text-sm">Order Date</p>
              <p className="font-semibold">
                {order.order?.created_at
                  ? new Date(order.order.created_at).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.product_id || index}
                    className="flex justify-between items-start py-3 border-b border-neutral-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-800">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        Quantity: {item.quantity} × ${item.unit_price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-800">
                        ${item.total_price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.pricing && (
            <div className="border-t border-neutral-200 pt-6 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold">
                    ${order.pricing.subtotal?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-semibold">
                    ${order.pricing.tax?.toFixed(2)}
                  </span>
                </div>
                {order.pricing.discount && order.pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Discount</span>
                    <span className="font-semibold text-emerald-600">
                      -${order.pricing.discount?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="text-lg font-semibold text-neutral-800">
                    Total
                  </span>
                  <span className="text-xl font-bold text-primary-600">
                    ${order.pricing.grand_total?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {order.order?.shipping_address && (
            <div className="border-t border-neutral-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Shipping Address
              </h3>
              <p className="text-neutral-600">{order.order.shipping_address}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
          <button
            onClick={() => navigate('/orders')}
            className="btn btn-primary"
          >
            View All Orders
          </button>
        </div>
      </div>
    </>
  );
};

