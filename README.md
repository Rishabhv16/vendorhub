# 🛍️ VendorHub — Multi-Vendor Marketplace Platform

> A full-stack, production-ready multi-vendor e-commerce marketplace built with Next.js 16, Firebase, and AI-powered features.

---

## 🚀 Live Demo

**[🌐 https://vendorhub-indol.vercel.app](https://vendorhub-indol.vercel.app)**

---

## 📸 Overview

**VendorHub** is a modern multi-vendor marketplace that connects **Buyers**, **Sellers**, and **Admins** on a single unified platform. Vendors can register, list products, and manage orders — while buyers enjoy a seamless shopping experience powered by AI-driven pricing suggestions and real-time data.

---

## ✨ Key Features

### 🧑‍💼 Multi-Role System
- **Buyer** — Browse products, wishlist items, add to cart, checkout, track orders, write reviews
- **Seller/Vendor** — Register store, manage product listings, view sales analytics, handle order fulfillment
- **Admin** — Approve/reject vendor applications, moderate the marketplace, oversee all activity

### 🛒 Shopping Experience
- Product catalog with search & category filters
- Product detail pages with star ratings & reviews
- Shopping cart drawer with quantity management
- Checkout modal with **Razorpay** payment integration
- Order tracking & history for buyers
- Wishlist functionality

### 🤖 AI-Powered Features
- **AI Price Suggest** — Gemini AI analyzes product data to recommend optimal pricing for vendors
- Smart product categorization

### 🏪 Vendor Dashboard
- Sales analytics with charts (Recharts)
- Product management (add/edit/delete listings)
- Order management with status updates
- Revenue tracking

### 🛡️ Admin Dashboard
- Vendor approval workflow (Pending → Approved / Rejected)
- Vendor profile modal with full registration details
- Platform-wide product and order oversight

### ⚡ Technical Highlights
- Real-time updates with **Firebase Firestore**
- Authentication with **Firebase Auth** (Email/Password + Google)
- Smooth animations with **Framer Motion**
- Global state management with **Zustand**
- Fully typed with **TypeScript**
- Responsive, mobile-first UI with **Tailwind CSS v4**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Payments | Razorpay |
| AI | Google Gemini API |
| State | Zustand |
| Animations | Framer Motion |
| UI Components | Radix UI |
| Charts | Recharts |

---

## 📁 Project Structure

```
vendorhub/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/price-suggest/   # Gemini AI pricing endpoint
│   │   │   └── razorpay/           # Payment API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AdminDashboard.tsx      # Admin control panel
│   │   ├── AuthModal.tsx           # Login / Register modal
│   │   ├── BuyerHome.tsx           # Buyer marketplace feed
│   │   ├── BuyerOrders.tsx         # Order history & tracking
│   │   ├── CartDrawer.tsx          # Sliding cart sidebar
│   │   ├── CheckoutModal.tsx       # Checkout & payment flow
│   │   ├── LandingPage.tsx         # Public landing page
│   │   ├── Navbar.tsx              # Top navigation
│   │   ├── ProductCard.tsx         # Product listing card
│   │   ├── ProductDetail.tsx       # Product detail view
│   │   ├── ProfilePage.tsx         # User profile
│   │   ├── SellerDashboard.tsx     # Vendor control panel
│   │   ├── StarRating.tsx          # Review rating component
│   │   ├── WishlistPage.tsx        # Saved items
│   │   └── ...
│   └── lib/
│       ├── firebase.ts             # Firebase config
│       ├── firebaseService.ts      # Firestore data layer
│       └── store.ts                # Zustand global state
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- Razorpay account (for payments)
- Google Gemini API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vendorhub.git
cd vendorhub

# Install dependencies
npm install

# Create environment variables
cp .env.example .env.local
# Fill in your credentials (see below)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file with the following:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🎯 User Flows

### As a Buyer
1. Land on the homepage → Sign up / Log in
2. Browse products, filter by category, search
3. View product details & read reviews
4. Add to cart → Checkout with Razorpay
5. Track order status in Order History

### As a Seller
1. Register as a Vendor (pending admin approval)
2. Once approved → access Seller Dashboard
3. Add products with AI price suggestions
4. Manage incoming orders & update fulfillment status
5. View revenue analytics

### As an Admin
1. Log in with admin credentials
2. Review pending vendor applications
3. Approve or reject with one click
4. Monitor all platform activity

---

## 🏆 Built For

This project was built as part of a hackathon to demonstrate a scalable, production-ready multi-vendor marketplace with modern tooling, real payments, and AI features.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 👨‍💻 Author

**Rishabh**
- GitHub: [@Rishabhv16](https://github.com/Rishabhv16)
- Email: rishabh19v16@gmail.com
