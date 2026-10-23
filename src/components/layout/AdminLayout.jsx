import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiBox,
  FiPlusCircle,
  FiDatabase,
  FiFolder,
  FiLayers,
  FiShoppingBag,
  FiUsers,
  FiStar,
  FiTag,
  FiSliders,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX,
  FiBell,
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: FiGrid, path: '/admin' },
    { label: 'All Products', icon: FiBox, path: '/admin/products' },
    { label: 'Add Product', icon: FiPlusCircle, path: '/admin/products/new' },
    { label: 'Inventory & SKUs', icon: FiDatabase, path: '/admin/inventory' },
    { label: 'Categories', icon: FiFolder, path: '/admin/categories' },
    { label: 'Collections', icon: FiLayers, path: '/admin/collections' },
    { label: 'Orders & Shipments', icon: FiShoppingBag, path: '/admin/orders' },
    { label: 'Customers', icon: FiUsers, path: '/admin/customers' },
    { label: 'Reviews Moderation', icon: FiStar, path: '/admin/reviews' },
    { label: 'Discount Coupons', icon: FiTag, path: '/admin/coupons' },
    { label: 'Homepage Banners', icon: FiSliders, path: '/admin/homepage' },
    { label: 'Payment Ledger', icon: FiCreditCard, path: '/admin/payments' },
    { label: 'Store Settings', icon: FiSettings, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-ivory-light flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-charcoal text-white h-16 border-b border-champagne/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white hover:text-champagne p-1"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>

          <Link to="/admin" className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="Dulia Trendz Logo"
              className="w-9 h-9 object-contain rounded-full shadow-xs"
            />
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-champagne">
              DULIA TRENDZ
            </span>
            <span className="bg-burgundy text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded text-white hidden sm:inline-block">
              Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center space-x-1.5 text-ivory/80 hover:text-champagne transition-colors bg-white/10 px-3 py-1.5 rounded-xs"
          >
            <span>Live Boutique</span>
            <FiExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
            <div className="text-right hidden sm:block">
              <span className="font-bold text-white block">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-champagne uppercase font-mono">Store Master</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-white/10"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-charcoal/70 backdrop-blur-xs z-30 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-charcoal text-ivory/90 border-r border-champagne/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-y-auto lg:w-64 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          } overflow-y-auto no-scrollbar flex flex-col justify-between p-4`}
        >
          <div className="space-y-1">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 lg:hidden">
              <span className="font-serif text-lg font-bold text-champagne">Management Suite</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-ivory/70 hover:text-white"
                aria-label="Close menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <span className="text-[10px] uppercase tracking-widest text-champagne/70 font-bold px-3 hidden lg:block mb-2">
              Management Suite
            </span>
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xs text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-burgundy text-white shadow-sm'
                      : 'text-ivory/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-champagne' : 'text-ivory/50'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 text-[10px] text-ivory/40 text-center">
            Dulia Trendz Admin v1.0
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 w-full max-w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
