import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';

import { useState, useEffect, useContext } from 'react';
import PageLoader from './components/PageLoader';
import { AuthContext } from './context/AuthContext';

import './styles/index.css';

// ✅ AppContent - inside AuthProvider and BrowserRouter
const AppContent = () => {
  const { isAdmin, loading } = useContext(AuthContext);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Wait for both page loader AND auth to be ready
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Show page loader while loading
  if (appLoading || loading) {
    return <PageLoader />;
  }

  return (
    <>
      {/* Show Navbar for everyone EXCEPT admin */}
      {!isAdmin && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />

        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />

        {/* Seller Routes */}
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/add-product" element={<AddProduct />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show Footer for everyone EXCEPT admin */}
      {!isAdmin && <Footer />}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

// ✅ App - AuthProvider wraps everything from the start
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;