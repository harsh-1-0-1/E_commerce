# E-Commerce Frontend

A modern React frontend for the E-Commerce backend, built with Vite, React Router, Axios, and Tailwind CSS.

## Features

- 🔐 **Authentication**: JWT-based login with protected routes
- 🛍️ **Product Browsing**: Browse products with real-time inventory information
- 🛒 **Shopping Cart**: Add, update, and remove items from cart
- 📦 **Inventory Management**: Admin panel for managing product inventory
- 🎨 **Modern UI**: Clean, minimalistic design with Tailwind CSS
- 📱 **Responsive**: Mobile-first responsive design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running on `http://localhost:8000` (or configure via environment variable)

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure API URL:
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` if your backend runs on a different URL

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

If not set, defaults to `http://localhost:8000`.

## Project Structure

```
E_comm_FE/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── Loading.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Toast.jsx
│   │   └── ToastContainer.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useToast.js
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   └── AdminInventory.jsx
│   ├── services/        # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── inventoryService.js
│   │   └── cartService.js
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles and Tailwind
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend integrates with the backend API. All API responses follow the standardized format:

```json
{
  "status_code": 200,
  "message": "Success message",
  "data": { ... },
  "error": null
}
```

### Authentication

- JWT tokens are stored in `localStorage`
- Tokens are automatically included in API requests via Axios interceptors
- Unauthorized responses (401) automatically redirect to login

### API Services

- **authService**: Login, register, get current user
- **productService**: Get products and product details
- **inventoryService**: Get, create, and update inventory
- **cartService**: Manage cart items

## Routes

- `/login` - Login page
- `/products` - Product listing page
- `/products/:id` - Product detail page
- `/cart` - Shopping cart page
- `/admin/inventory` - Admin inventory management (admin only)

## Design System

The UI uses a soothing, minimalistic color palette:

- **Primary**: Teal (`#14b8a6`)
- **Neutral**: Gray scale (`#fafafa` to `#171717`)
- **Accent**: Teal, Indigo, Slate, Emerald

All components follow consistent spacing, rounded corners, and smooth transitions.

## Development

### Code Style

- ESLint is configured for React best practices
- Components use functional components with hooks
- Services handle all API communication
- Error handling is consistent across the app

### Adding New Features

1. Create API service methods in `src/services/`
2. Create page components in `src/pages/`
3. Add routes in `src/App.jsx`
4. Update navigation in `src/components/Layout.jsx`

## Troubleshooting

### CORS Issues

Make sure the backend CORS middleware allows requests from `http://localhost:3000`.

### Authentication Issues

- Check that tokens are being stored in localStorage
- Verify the backend JWT secret matches
- Check browser console for API errors

### API Connection Issues

- Ensure backend is running on the configured URL (default: `http://localhost:8000`)
- Check network tab for failed requests
- Verify API endpoints match backend routes
- Check `.env` file if using custom API URL

