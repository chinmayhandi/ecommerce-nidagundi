import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts & Components
import UserLayout from './components/UserLayout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import OrderConfirmed from './pages/OrderConfirmed'
import MyOrders from './pages/MyOrders'
import OrderDetails from './pages/OrderDetails'
import Wishlist from './pages/Wishlist'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import AddProduct from './pages/admin/AddProduct'
import ManageProducts from './pages/admin/ManageProducts'
import ManageOrders from './pages/admin/ManageOrders'
import ManageCustomers from './pages/admin/ManageCustomers'
import ManagePincodes from './pages/admin/ManagePincodes'
import Coupons from './pages/admin/Coupons'
import Reviews from './pages/admin/Reviews'

function App() {
  const { user, loading } = useAuth();

  console.log('App render:', { user, loading });

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* User Layout Routes */}
        <Route element={<UserLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-confirmed" element={<OrderConfirmed />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/my-orders/:id" element={<OrderDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>
        </Route> {/* End of UserLayout */}

        {/* Admin Login/Register (No layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Admin Layout Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products/add" element={<AddProduct />} />
            <Route path="/admin/products" element={<ManageProducts />} />
            <Route path="/admin/orders" element={<ManageOrders />} />
            <Route path="/admin/customers" element={<ManageCustomers />} />
            <Route path="/admin/pincodes" element={<ManagePincodes />} />
            <Route path="/admin/coupons" element={<Coupons />} />
            <Route path="/admin/reviews" element={<Reviews />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
