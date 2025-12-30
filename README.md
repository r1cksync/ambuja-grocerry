# Ambuja Neotia Grocery App

A full-stack grocery e-commerce application built for Ambuja Neotia employees. This is a BigBasket/Zepto clone featuring:

- **User Side**: Browse products, search, add to cart, checkout, track orders
- **Vendor/Admin Side**: Manage products, categories, orders, and customers

## Tech Stack

### Backend
- **Next.js 14** - API Routes
- **TypeScript** - Type-safe development
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **AWS S3** - File storage
- **Groq LLM** - AI Chatbot assistant

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Project Structure

```
ambuja-neotia-grocery-app/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── lib/            # Utility functions
│   │   │   ├── auth.ts     # JWT authentication
│   │   │   ├── groq.ts     # AI chatbot
│   │   │   ├── mongodb.ts  # Database connection
│   │   │   └── s3.ts       # AWS S3 utilities
│   │   ├── models/         # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   ├── Category.ts
│   │   │   ├── Cart.ts
│   │   │   ├── Order.ts
│   │   │   ├── Coupon.ts
│   │   │   └── Review.ts
│   │   └── pages/api/      # API routes
│   │       ├── auth/       # Authentication
│   │       ├── products/   # Product CRUD
│   │       ├── categories/ # Category CRUD
│   │       ├── cart/       # Shopping cart
│   │       ├── orders/     # Order management
│   │       ├── chat/       # AI assistant
│   │       ├── upload/     # File uploads
│   │       └── user/       # User profile
│   └── package.json
│
└── frontend/               # Frontend App
    ├── src/
    │   ├── components/     # React components
    │   │   ├── layout/     # Header, Footer, etc.
    │   │   ├── product/    # Product cards, grid
    │   │   ├── cart/       # Cart sidebar
    │   │   ├── chat/       # AI chatbot
    │   │   └── vendor/     # Admin components
    │   ├── pages/          # Next.js pages
    │   │   ├── vendor/     # Admin pages
    │   │   ├── category/   # Category pages
    │   │   ├── product/    # Product pages
    │   │   ├── orders/     # Order pages
    │   │   └── ...
    │   ├── lib/            # Utilities
    │   │   ├── api.ts      # API client
    │   │   └── utils.ts    # Helper functions
    │   ├── store/          # Zustand store
    │   └── styles/         # Global styles
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- AWS S3 bucket
- Groq API key

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/ambuja-grocery
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
GROQ_API_KEY=your-groq-api-key
```

5. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Features

### User Features
- 🛒 Browse and search products
- 📦 Category-based navigation
- 🛍️ Shopping cart with real-time updates
- 💳 Multiple payment methods (COD, Online)
- 📍 Multiple delivery addresses
- 🎫 Coupon codes
- 📦 Order tracking
- 🤖 AI-powered shopping assistant (chatbot)
- 👤 User profile management

### Vendor/Admin Features
- 📊 Dashboard with analytics
- 📦 Product management (CRUD)
- 📂 Category management
- 📋 Order management with status updates
- 👥 Customer management
- 🎫 Coupon management
- 📈 Sales reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `GET /api/products/:slug` - Get product by slug
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:slug` - Update product (admin)
- `DELETE /api/products/:slug` - Delete product (admin)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Get category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:slug` - Update category (admin)
- `DELETE /api/categories/:slug` - Delete category (admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id` - Update order status

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/addresses` - Get addresses
- `POST /api/user/addresses` - Add address
- `PUT /api/user/addresses` - Update address
- `DELETE /api/user/addresses` - Delete address

### Chat (AI)
- `POST /api/chat` - Send message to AI assistant
- `POST /api/chat/recipe` - Get recipe suggestions

## User Roles

1. **User** (default): Can browse products, place orders, manage profile
2. **Admin**: Full access to vendor panel, can manage all resources

## License

This project is proprietary software developed for Ambuja Neotia.
