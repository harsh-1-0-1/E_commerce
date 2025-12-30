# Quick Start Guide

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd E_comm_FE
   npm install
   ```

2. **Start Backend Server**
   Make sure the backend is running on `http://localhost:8000`
   ```bash
   cd ../E_comm_BE
   uvicorn main:app --reload
   ```

3. **Start Frontend Development Server**
   ```bash
   cd E_comm_FE
   npm run dev
   ```

4. **Access the Application**
   Open your browser to `http://localhost:3000`

## First Steps

1. **Login**: Use existing user credentials or register a new user
2. **Browse Products**: View all available products with inventory information
3. **View Product Details**: Click on any product to see details and add to cart
4. **Manage Cart**: Add, update quantities, or remove items
5. **Admin Features**: If logged in as admin, access `/admin/inventory` to manage stock

## Default User Roles

- **Regular User**: Can browse products, add to cart, and view cart
- **Admin**: Can do everything a regular user can, plus manage inventory

## API Endpoints Used

- `POST /users/login` - User authentication
- `GET /users/me` - Get current user
- `GET /products/` - List all products
- `GET /products/:id` - Get product details
- `GET /inventory/:product_id` - Get inventory for a product
- `POST /inventory/` - Create inventory (admin)
- `PUT /inventory/:product_id` - Update inventory (admin)
- `GET /cart/` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:id` - Update cart item quantity
- `DELETE /cart/items/:id` - Remove cart item
- `DELETE /cart/` - Clear cart

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running: `uvicorn main:app --reload` (or your preferred method)
- Check backend is on port 8000
- Verify CORS is enabled for `http://localhost:3000`
- Check `.env` file if using custom API URL

### Authentication Issues
- Clear browser localStorage if tokens are corrupted
- Check browser console for API errors
- Verify backend JWT configuration

### Inventory Not Showing
- Inventory must be created by admin first
- Products without inventory will show "0 available"
- Admin can create inventory from `/admin/inventory` page

