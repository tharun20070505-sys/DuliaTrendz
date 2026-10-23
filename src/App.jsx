import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts & Nav
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Customer Pages (1 - 28)
import Home from './pages/Home';
import Shop from './pages/Shop';
import AllProducts from './pages/AllProducts';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import NewArrivals from './pages/NewArrivals';
import Bestsellers from './pages/Bestsellers';
import Collections from './pages/Collections';
import Sale from './pages/Sale';
import SearchResults from './pages/SearchResults';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import MyProfile from './pages/MyProfile';
import SavedAddresses from './pages/SavedAddresses';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

// Admin Pages (29 - 43)
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Inventory from './pages/admin/Inventory';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import CollectionsAdmin from './pages/admin/CollectionsAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import CustomersAdmin from './pages/admin/CustomersAdmin';
import ReviewsAdmin from './pages/admin/ReviewsAdmin';
import CouponsAdmin from './pages/admin/CouponsAdmin';
import HomepageManagement from './pages/admin/HomepageManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import StoreSettingsAdmin from './pages/admin/StoreSettingsAdmin';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Customer Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="w-8 h-8 border-2 border-burgundy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Protected Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal text-champagne">
        <div className="w-8 h-8 border-2 border-champagne border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Customer Layout Wrapper
const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

// 404 Not Found Page
const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-xs uppercase tracking-widest text-burgundy font-bold mb-2">
        Error 404
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mb-4">
        Page Not Found
      </h1>
      <p className="text-xs text-charcoal/60 max-w-md mb-6 leading-relaxed">
        The haute couture collection or boutique page you are looking for has been moved or is unavailable.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-burgundy hover:bg-burgundy-dark text-white rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
      >
        Return to Boutique
      </Link>
    </div>
  );
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ================= CUSTOMER ROUTES ================= */}
        <Route
          path="/"
          element={
            <CustomerLayout>
              <Home />
            </CustomerLayout>
          }
        />
        <Route
          path="/shop"
          element={
            <CustomerLayout>
              <Shop />
            </CustomerLayout>
          }
        />
        <Route
          path="/products"
          element={
            <CustomerLayout>
              <AllProducts />
            </CustomerLayout>
          }
        />
        <Route
          path="/all-products"
          element={
            <CustomerLayout>
              <AllProducts />
            </CustomerLayout>
          }
        />
        <Route
          path="/add-product"
          element={<Navigate to="/admin/products/new" replace />}
        />
        <Route
          path="/category/:slug"
          element={
            <CustomerLayout>
              <Category />
            </CustomerLayout>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <CustomerLayout>
              <ProductDetails />
            </CustomerLayout>
          }
        />
        <Route
          path="/new-arrivals"
          element={
            <CustomerLayout>
              <NewArrivals />
            </CustomerLayout>
          }
        />
        <Route
          path="/bestsellers"
          element={
            <CustomerLayout>
              <Bestsellers />
            </CustomerLayout>
          }
        />
        <Route
          path="/collections"
          element={
            <CustomerLayout>
              <Collections />
            </CustomerLayout>
          }
        />
        <Route
          path="/sale"
          element={
            <CustomerLayout>
              <Sale />
            </CustomerLayout>
          }
        />
        <Route
          path="/search"
          element={
            <CustomerLayout>
              <SearchResults />
            </CustomerLayout>
          }
        />
        <Route
          path="/wishlist"
          element={
            <CustomerLayout>
              <Wishlist />
            </CustomerLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <CustomerLayout>
              <Cart />
            </CustomerLayout>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <Checkout />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderNumber"
          element={
            <CustomerLayout>
              <OrderSuccess />
            </CustomerLayout>
          }
        />
        <Route
          path="/track/lookup"
          element={
            <CustomerLayout>
              <OrderTracking />
            </CustomerLayout>
          }
        />
        <Route
          path="/track/:orderNumber"
          element={
            <CustomerLayout>
              <OrderTracking />
            </CustomerLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <MyOrders />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <OrderDetails />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <MyProfile />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <SavedAddresses />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={
            <CustomerLayout>
              <ForgotPassword />
            </CustomerLayout>
          }
        />
        <Route
          path="/about"
          element={
            <CustomerLayout>
              <AboutUs />
            </CustomerLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <CustomerLayout>
              <Contact />
            </CustomerLayout>
          }
        />
        <Route
          path="/faq"
          element={
            <CustomerLayout>
              <FAQ />
            </CustomerLayout>
          }
        />
        <Route
          path="/shipping-policy"
          element={
            <CustomerLayout>
              <ShippingPolicy />
            </CustomerLayout>
          }
        />
        <Route
          path="/return-policy"
          element={
            <CustomerLayout>
              <ReturnPolicy />
            </CustomerLayout>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <CustomerLayout>
              <PrivacyPolicy />
            </CustomerLayout>
          }
        />
        <Route
          path="/terms-conditions"
          element={
            <CustomerLayout>
              <TermsConditions />
            </CustomerLayout>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="all-products" element={<ProductManagement />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="collections" element={<CollectionsAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
          <Route path="coupons" element={<CouponsAdmin />} />
          <Route path="homepage" element={<HomepageManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="settings" element={<StoreSettingsAdmin />} />
        </Route>

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <CustomerLayout>
              <NotFound />
            </CustomerLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
