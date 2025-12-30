import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { productService } from '../services/productService';
import { paymentService } from '../services/paymentService';
import { Loading } from '../components/Loading';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

export const Cart = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);

      if (cartData?.items) {
        const productPromises = cartData.items.map(async (item) => {
          try {
            const product = await productService.getProduct(item.product_id);
            return { productId: item.product_id, product };
          } catch {
            return { productId: item.product_id, product: null };
          }
        });

        const productResults = await Promise.all(productPromises);
        const productMap = {};
        productResults.forEach(({ productId, product }) => {
          productMap[productId] = product;
        });
        setProducts(productMap);
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdating({ ...updating, [itemId]: true });
      const updatedCart = await cartService.updateItem(itemId, newQuantity);
      setCart(updatedCart);
      showToast('Cart updated', 'success');
    } catch (error) {
      showToast(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update cart',
        'error'
      );
      loadCart();
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      await loadCart();
      showToast('Item removed from cart', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to remove item', 'error');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      await cartService.clearCart();
      await loadCart();
      showToast('Cart cleared', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to clear cart', 'error');
    }
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) {
      showToast('Your cart is empty', 'error');
      return;
    }

    for (const item of cart.items) {
      if (!item.quantity || item.quantity < 1) {
        showToast('Please update item quantities', 'error');
        return;
      }
    }

    setCheckoutLoading(true);

    try {
      showToast('Creating order...', 'info');

      // Step 1: Create order from cart
      // Backend returns: { order: { order_id: 12, ... }, pricing: {...}, items: [...] }
      const orderResponse = await paymentService.createOrder({
        shipping_address: null,
        payment_method: 'razorpay',
      });

      // Extract order_id from nested response structure
      const orderId = orderResponse?.order?.order_id;
      if (!orderId) {
        throw new Error('Order ID not found in response');
      }

      console.log('[Checkout] Order created successfully:', { orderId, orderResponse });

      showToast('Initializing payment...', 'info');

      // Step 2: Create payment session with Razorpay
      // This calls POST /payments/create-session with { order_id: orderId }
      const paymentSession = await paymentService.createPaymentSession(orderId);
      
      console.log('[Checkout] Payment session created:', { 
        razorpay_order_id: paymentSession.razorpay_order_id,
        amount: paymentSession.amount,
        key_id: paymentSession.key_id 
      });

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      // Step 3: Initialize Razorpay checkout modal
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }

      const options = {
        key: paymentSession.key_id, // Razorpay public key from backend
        amount: paymentSession.amount, // Amount in paise
        currency: paymentSession.currency,
        name: 'E-Commerce Store',
        description: `Order #${orderId}`,
        order_id: paymentSession.razorpay_order_id, // Razorpay order ID (not our order_id)
        handler: async function (response) {
          // Step 4: Payment successful - verify with backend
          try {
            setCheckoutLoading(true);
            showToast('Verifying payment...', 'info');

            console.log('[Payment] Razorpay success response:', response);

            // Verify payment signature and update order status
            await paymentService.verifyPayment({
              order_id: orderId, // Our internal order ID
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log('[Payment] Payment verified successfully');

            // Step 5: Clear cart after successful payment
            try {
              await cartService.clearCart();
              console.log('[Payment] Cart cleared');
            } catch (cartError) {
              console.error('[Payment] Failed to clear cart:', cartError);
              // Don't block success flow if cart clearing fails
            }

            // Step 6: Navigate to success page
            navigate(`/orders/${orderId}/success`, {
              state: { orderId },
            });
          } catch (error) {
            console.error('[Payment] Verification failed:', error);
            const errorMessage =
              error.response?.data?.error ||
              error.response?.data?.message ||
              'Payment verification failed. Please contact support.';
            showToast(errorMessage, 'error');
            setCheckoutLoading(false);
          }
        },
        theme: { color: '#4F46E5' },
        modal: {
          ondismiss: () => {
            // User closed the payment modal without completing payment
            console.log('[Payment] User cancelled payment');
            showToast('Payment cancelled', 'info');
            setCheckoutLoading(false);
          },
        },
      };

      // Create Razorpay instance and set up event handlers
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure events
      razorpay.on('payment.failed', (response) => {
        console.error('[Payment] Razorpay payment failed:', response);
        const errorMessage =
          response.error?.description || 'Payment failed. Please try again.';
        showToast(errorMessage, 'error');
        setCheckoutLoading(false);
      });

      // Open Razorpay checkout modal
      console.log('[Checkout] Opening Razorpay checkout modal');
      razorpay.open();
      
    } catch (error) {
      // Handle errors during order creation or payment session creation
      console.error('[Checkout] Error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to initiate checkout. Please try again.';
      showToast(errorMessage, 'error');
      setCheckoutLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!cart?.items?.length) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">Your Cart</h1>
          <p className="text-neutral-500 text-lg mb-6">Your cart is empty</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Your Cart</h1>
        <p className="text-neutral-600">
          {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your
          cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = products[item.product_id];
            const productName =
              product?.name || `Product #${item.product_id}`;

            return (
              <div key={item.id} className="card flex items-center gap-6">
                <div className="flex-1">
                  <Link
                    to={`/products/${item.product_id}`}
                    className="text-xl font-semibold text-neutral-800 hover:text-primary-600"
                  >
                    {productName}
                  </Link>
                  <p className="text-neutral-600 mt-1">
                    ${item.unit_price.toFixed(2)} each
                  </p>
                </div>

                <div className="text-right w-24">
                  <p className="font-semibold text-neutral-800">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="border-t pt-4 flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                ${cart.summary.total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="btn btn-primary w-full mt-6"
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
