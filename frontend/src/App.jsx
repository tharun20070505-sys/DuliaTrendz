import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts & Nav
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Primary landing page (static import for instant first paint)
import Home from './pages/Home';

// Customer Pages - Lazy loaded on-demand for lightning-fast initial load
const Shop = React.lazy(() => import('./pages/Shop'));
const AllProducts = React.lazy(() => import('./pages/AllProducts'));
const Category = React.lazy(() => import('./pages/Category'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const NewArrivals = React.lazy(() => import('./pages/NewArrivals'));
const Bestsellers = React.lazy(() => import('./pages/Bestsellers'));
const Collections = React.lazy(() => import('./pages/Collections'));
const Sale = React.lazy(() => import('./pages/Sale'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const MyOrders = React.lazy(() => import('./pages/MyOrders'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const MyProfile = React.lazy(() => import('./pages/MyProfile'));
const SavedAddresses = React.lazy(() => import('./pages/SavedAddresses'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const Contact = React.lazy(() => import('./pages/Contact'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const ShippingPolicy = React.lazy(() => import('./pages/ShippingPolicy'));
const ReturnPolicy = React.lazy(() => import('./pages/ReturnPolicy'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = React.lazy(() => import('./pages/TermsConditions'));

// Admin Pages - Lazy loaded on-demand
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ProductManagement = React.lazy(() => import('./pages/admin/ProductManagement'));
const AddProduct = React.lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = React.lazy(() => import('./pages/admin/EditProduct'));
const Inventory = React.lazy(() => import('./pages/admin/Inventory'));
const CategoriesAdmin = React.lazy(() => import('./pages/admin/CategoriesAdmin'));
const CollectionsAdmin = React.lazy(() => import('./pages/admin/CollectionsAdmin'));
const OrdersAdmin = React.lazy(() => import('./pages/admin/OrdersAdmin'));
const CustomersAdmin = React.lazy(() => import('./pages/admin/CustomersAdmin'));
const ReviewsAdmin = React.lazy(() => import('./pages/admin/ReviewsAdmin'));
const CouponsAdmin = React.lazy(() => import('./pages/admin/CouponsAdmin'));
const HomepageManagement = React.lazy(() => import('./pages/admin/HomepageManagement'));
const PaymentManagement = React.lazy(() => import('./pages/admin/PaymentManagement'));
const StoreSettingsAdmin = React.lazy(() => import('./pages/admin/StoreSettingsAdmin'));

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

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
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

// Luxury Suspense Loading Fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center bg-ivory">
    <div className="w-9 h-9 border-2 border-burgundy border-t-transparent rounded-full animate-spin"></div>
    <span className="mt-3 text-[11px] uppercase tracking-widest text-burgundy font-serif">Dulia Trendz</span>
  </div>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <React.Suspense fallback={<PageLoader />}>
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
      </React.Suspense>
    </>
  );
}

export default App;
