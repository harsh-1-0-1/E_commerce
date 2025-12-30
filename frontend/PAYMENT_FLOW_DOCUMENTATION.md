# Payment Flow Documentation

## Overview

This document describes the complete payment flow implementation in the frontend, including integration with the Razorpay payment gateway and backend APIs.

---

## Payment Provider

**Razorpay** (Test Mode)
- Payment gateway integrated via Razorpay Checkout SDK
- Uses test keys provided by backend
- Supports card payments, UPI, netbanking, wallets, etc. (in test mode)

---

## Complete Payment Flow

### Flow Diagram

```
Cart Page
    ↓
[User clicks "Proceed to Checkout"]
    ↓
[Validate Cart] → Check items exist, quantities > 0
    ↓
[Create Order] → POST /orders/
    ↓
[Create Payment Session] → POST /payments/create-session
    ↓
[Open Razorpay Checkout] → Razorpay modal opens
    ↓
[User completes payment] → Razorpay processes payment
    ↓
[Payment Success Handler] → Verify payment with backend
    ↓
[Verify Payment] → POST /payments/verify
    ↓
[Clear Cart] → DELETE /cart/
    ↓
[Redirect to Success Page] → /orders/:orderId/success
```

---

## API Endpoints Used

### 1. Create Order
**Endpoint**: `POST /orders/`

**Request Payload**:
```json
{
  "shipping_address": null,
  "payment_method": "razorpay"
}
```

**Response**:
```json
{
  "status_code": 201,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_items": 2,
    "subtotal": "100.00",
    "tax": "18.00",
    "discount": "0.00",
    "grand_total": "118.00",
    "status": "PENDING",
    "items": [...]
  }
}
```

**Backend Behavior**:
- Creates order from current cart
- Validates inventory availability
- Reserves inventory stock
- Calculates subtotal, tax (18%), discount, grand_total
- Clears cart items (moves to order)
- Returns order object with ID

---

### 2. Create Payment Session
**Endpoint**: `POST /payments/create-session`

**Request Payload**:
```json
{
  "order_id": 1
}
```

**Response**:
```json
{
  "status_code": 201,
  "message": "Payment session created successfully",
  "data": {
    "razorpay_order_id": "order_xxxxxxxxxxxxx",
    "amount": 11800,
    "currency": "INR",
    "key_id": "rzp_test_xxxxxxxxxxxx",
    "order_id": 1
  }
}
```

**Backend Behavior**:
- Validates order exists and belongs to user
- Checks order is not already paid
- Creates Razorpay order (idempotent - reuses if PENDING payment exists)
- Creates local Payment record with status "PENDING"
- Returns Razorpay order details needed for checkout

**Important Notes**:
- Amount is in **paise** (smallest currency unit)
- `key_id` is Razorpay public key (safe to expose in frontend)
- Session creation is **idempotent** - safe to retry

---

### 3. Verify Payment
**Endpoint**: `POST /payments/verify`

**Request Payload**:
```json
{
  "order_id": 1,
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response**:
```json
{
  "status_code": 200,
  "message": "Payment verified successfully",
  "data": {
    "id": 1,
    "order_id": 1,
    "user_id": 1,
    "status": "SUCCESS",
    "amount": "118.00",
    "currency": "INR"
  }
}
```

**Backend Behavior**:
- Validates payment session exists
- Verifies Razorpay signature (prevents tampering)
- Marks payment as "SUCCESS"
- Updates order status to "PAID"
- Handles race conditions (idempotent verification)
- Returns payment confirmation

**Security**:
- Signature verification ensures payment data hasn't been tampered with
- Backend validates all payment details before marking as success
- Frontend should NEVER trust payment success without backend verification

---

## Frontend Implementation

### 1. Payment Service (`src/services/paymentService.js`)

Centralized service for all payment-related API calls:

```javascript
paymentService.createOrder(orderData)
paymentService.createPaymentSession(orderId)
paymentService.verifyPayment(paymentData)
paymentService.getOrder(orderId)
```

---

### 2. Cart Page Checkout (`src/pages/Cart.jsx`)

**Checkout Handler Flow**:

1. **Validation**:
   - Checks cart has items
   - Validates all quantities > 0
   - Shows error toast if validation fails

2. **Order Creation**:
   - Calls `paymentService.createOrder()`
   - Shows "Creating order..." toast
   - Receives order object with ID

3. **Payment Session Creation**:
   - Calls `paymentService.createPaymentSession(order.id)`
   - Shows "Initializing payment..." toast
   - Receives Razorpay order details

4. **Razorpay Checkout Initialization**:
   - Checks `window.Razorpay` is loaded
   - Creates Razorpay options object:
     ```javascript
     {
       key: paymentSession.key_id,
       amount: paymentSession.amount, // in paise
       currency: paymentSession.currency,
       order_id: paymentSession.razorpay_order_id,
       handler: successCallback,
       modal: { ondismiss: cancelCallback }
     }
     ```
   - Opens Razorpay checkout modal

5. **Payment Success Handler**:
   - Called when Razorpay reports success
   - Shows "Verifying payment..." toast
   - Calls `paymentService.verifyPayment()` with payment details
   - On success:
     - Clears cart (`cartService.clearCart()`)
     - Navigates to `/orders/:orderId/success`
   - On failure:
     - Shows error toast
     - Keeps user on cart page

6. **Payment Failure Handler**:
   - Razorpay `payment.failed` event handler
   - Shows error toast with failure reason
   - User can retry checkout

7. **Payment Cancellation**:
   - User closes Razorpay modal
   - `modal.ondismiss` callback fires
   - Shows "Payment cancelled" toast
   - User remains on cart page

---

### 3. Order Success Page (`src/pages/OrderSuccess.jsx`)

**Features**:
- Displays order confirmation
- Shows order details (items, totals, status)
- Displays order ID and date
- Shows shipping address (if provided)
- Provides navigation to:
  - Continue shopping (`/products`)
  - View all orders (`/orders`) - future feature

**Data Loading**:
- Gets order ID from URL params (`/orders/:orderId/success`)
- Falls back to location state (from navigation)
- Calls `paymentService.getOrder(orderId)`
- Shows loading state while fetching
- Handles errors gracefully

---

## Error Handling

### Cart Validation Errors
- **Empty cart**: "Your cart is empty"
- **Invalid quantities**: "Please update item quantities"

### Order Creation Errors
- **Cart not found**: Backend returns 400
- **Insufficient inventory**: Backend validates stock
- **Network errors**: Generic error message shown

### Payment Session Errors
- **Order not found**: 404 error
- **Order already paid**: 400 error (prevents duplicate payment)
- **Network errors**: Generic error message

### Payment Verification Errors
- **Signature verification failed**: Backend rejects invalid signatures
- **Payment session not found**: 404 error
- **Network errors**: Payment may have succeeded but verification failed

### User Actions
- **Payment cancelled**: User closes modal
- **Payment failed**: Razorpay reports failure (insufficient funds, card declined, etc.)

---

## Security Considerations

### ✅ Implemented Security Measures

1. **Backend Verification**:
   - All payments verified on backend
   - Signature verification prevents tampering
   - Frontend never trusts payment success alone

2. **No Secret Keys in Frontend**:
   - Only Razorpay public key (`key_id`) used
   - Secret key stays on backend
   - Payment verification happens server-side

3. **Idempotent Operations**:
   - Order creation is idempotent
   - Payment session creation reuses existing sessions
   - Payment verification handles duplicate attempts

4. **User Authentication**:
   - All API calls include JWT token
   - Backend validates user ownership
   - Orders tied to authenticated user

### ⚠️ Security Notes

- **Test Mode**: Currently using Razorpay test keys
- **Production**: Must switch to live keys and update backend config
- **HTTPS Required**: Payment gateway requires HTTPS in production
- **PCI Compliance**: Razorpay handles card data (frontend never sees it)

---

## State Management

### Loading States
- `checkoutLoading`: Prevents duplicate checkout attempts
- `loading`: Cart and order data loading
- `updating`: Individual cart item updates

### Error States
- Toast notifications for all errors
- User-friendly error messages
- Graceful degradation

### Success States
- Cart cleared after successful payment
- Order stored in backend
- Success page shows confirmation

---

## Cart and Inventory Updates

### During Order Creation
1. Backend validates inventory availability
2. Reserves inventory (moves from `available_stock` to `reserved_stock`)
3. Cart items moved to order items
4. Cart cleared on backend

### After Payment Success
1. Frontend clears cart via API call
2. Backend marks order as "PAID"
3. Inventory remains reserved (will be updated when order ships/cancels)

### If Payment Fails
1. Order remains in "PENDING" status
2. Inventory remains reserved
3. User can retry payment or cancel order (future feature)

---

## Razorpay Integration

### SDK Loading
- Razorpay script loaded in `index.html`:
  ```html
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  ```

### Checkout Options
```javascript
{
  key: "rzp_test_xxxxxxxxxxxx",        // Public key from backend
  amount: 11800,                         // Amount in paise
  currency: "INR",
  name: "E-Commerce Store",
  description: "Order #1",
  order_id: "order_xxxxxxxxxxxxx",        // Razorpay order ID
  handler: function(response) { ... },    // Success callback
  prefill: { ... },                      // User details (optional)
  theme: { color: "#4F46E5" },           // Brand color
  modal: {
    ondismiss: function() { ... }        // Cancel callback
  }
}
```

### Payment Response
```javascript
{
  razorpay_order_id: "order_xxxxxxxxxxxxx",
  razorpay_payment_id: "pay_xxxxxxxxxxxxx",
  razorpay_signature: "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

---

## Testing the Payment Flow

### Test Cards (Razorpay Test Mode)

**Success Cards**:
- `4111 1111 1111 1111` - Any CVV, any future expiry
- `5555 5555 5555 4444` - Visa test card

**Failure Cards**:
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 0069` - Expired card

**Test UPI**:
- `success@razorpay` - Always succeeds
- `failure@razorpay` - Always fails

### Testing Steps

1. **Add items to cart**
2. **Click "Proceed to Checkout"**
3. **Verify order creation** (check network tab)
4. **Verify payment session creation** (check network tab)
5. **Complete payment** with test card
6. **Verify payment verification** (check network tab)
7. **Verify cart cleared** (check cart page)
8. **Verify success page** shows order details

---

## Assumptions Made

1. **Shipping Address**: Currently optional (null). Can be extended later with address form.

2. **Payment Method**: Hardcoded to "razorpay". Can be extended for multiple payment methods.

3. **Currency**: Assumes INR (Indian Rupees). Backend returns currency, but frontend doesn't handle multiple currencies.

4. **Order Status**: Success page shows order status. Assumes "PAID" status means successful payment.

5. **Cart Clearing**: Cart is cleared after successful payment. If clearing fails, order still succeeds (logged but not blocking).

6. **Error Recovery**: If payment verification fails, user can retry checkout. Order remains in PENDING status.

7. **Razorpay SDK**: Assumes Razorpay SDK loads before checkout attempt. No fallback if SDK fails to load.

---

## Future Enhancements

1. **Order History Page**: List all user orders (`/orders`)
2. **Order Details Page**: View individual order details
3. **Shipping Address Form**: Collect address during checkout
4. **Multiple Payment Methods**: Support other gateways
5. **Order Cancellation**: Allow canceling pending orders
6. **Retry Payment**: Retry failed payments
7. **Payment Status Polling**: Check payment status if verification fails
8. **Email Notifications**: Send order confirmation emails
9. **Order Tracking**: Track order shipment status

---

## Troubleshooting

### Payment Modal Not Opening
- Check Razorpay script loaded in `index.html`
- Check browser console for errors
- Verify `window.Razorpay` exists

### Payment Verification Fails
- Check network tab for API errors
- Verify backend is running
- Check JWT token is valid
- Check Razorpay signature matches

### Cart Not Clearing
- Check network tab for API call
- Verify cart service API endpoint
- Check browser console for errors

### Order Not Found on Success Page
- Verify order ID in URL
- Check order was created successfully
- Verify user owns the order

---

## API Request/Response Examples

### Create Order Request
```http
POST /orders/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "shipping_address": null,
  "payment_method": "razorpay"
}
```

### Create Payment Session Request
```http
POST /payments/create-session
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "order_id": 1
}
```

### Verify Payment Request
```http
POST /payments/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "order_id": 1,
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

---

## Files Modified/Created

### New Files
- `src/services/paymentService.js` - Payment API service
- `src/pages/OrderSuccess.jsx` - Order success page
- `PAYMENT_FLOW_DOCUMENTATION.md` - This documentation

### Modified Files
- `index.html` - Added Razorpay script
- `src/pages/Cart.jsx` - Added checkout functionality
- `src/App.jsx` - Added OrderSuccess route

---

## Summary

The payment flow is now fully functional:

1. ✅ Cart validation before checkout
2. ✅ Order creation from cart
3. ✅ Payment session creation
4. ✅ Razorpay checkout integration
5. ✅ Payment verification
6. ✅ Cart clearing on success
7. ✅ Success page with order details
8. ✅ Comprehensive error handling
9. ✅ Loading states throughout
10. ✅ Security best practices

The implementation follows production-ready patterns with proper error handling, security measures, and user feedback.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: ✅ Complete and Functional

