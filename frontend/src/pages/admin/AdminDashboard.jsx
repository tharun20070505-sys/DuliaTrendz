import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  FiBox,
  FiShoppingBag,
  FiDollarSign,
  FiAlertTriangle,
  FiClock,
  FiTrendingUp,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data: statsData } = await API.get('/users/admin/dashboard-stats');
        if (statsData.success) {
          setData(statsData);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-champagne/40 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockItems = data?.lowStockItems || [];
  const chartDays = data?.charts?.last7Days || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
          Boutique Performance Telemetry
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">
          Store Operations Dashboard
        </h1>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Paid Revenue */}
        <div className="bg-white border border-champagne/40 rounded-sm p-4 sm:p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal/60 font-semibold uppercase tracking-wider block">
              Paid Revenue
            </span>
            <p className="font-serif text-xl sm:text-2xl font-bold text-burgundy mt-1">
              ₹{(stats.paidRevenue || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center mt-1">
              <FiCheckCircle className="mr-1" /> Verified Collections
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center shrink-0">
            <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white border border-champagne/40 rounded-sm p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal/60 font-semibold uppercase tracking-wider block">
              Total Orders
            </span>
            <p className="font-serif text-2xl font-bold text-charcoal mt-1">
              {stats.totalOrders || 0}
            </p>
            <span className="text-[10px] text-charcoal/50 block mt-1">
              {stats.pendingOrders || 0} Awaiting dispatch
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-champagne/20 text-champagne-dark flex items-center justify-center shrink-0">
            <FiShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="bg-white border border-champagne/40 rounded-sm p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal/60 font-semibold uppercase tracking-wider block">
              Live Garments
            </span>
            <p className="font-serif text-2xl font-bold text-charcoal mt-1">
              {stats.activeProducts || 0}
            </p>
            <span className="text-[10px] text-charcoal/50 block mt-1">
              {stats.totalProducts || 0} Catalogued items
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FiBox className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Inventory Alerts */}
        <div className="bg-white border border-champagne/40 rounded-sm p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal/60 font-semibold uppercase tracking-wider block">
              Stock Warnings
            </span>
            <p className="font-serif text-2xl font-bold text-red-700 mt-1">
              {(stats.lowStockCount || 0) + (stats.outOfStockCount || 0)}
            </p>
            <span className="text-[10px] text-red-600 block mt-1">
              {stats.outOfStockCount || 0} Out of stock • {stats.lowStockCount || 0} Low
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 7-Day Revenue & Orders Visual Chart */}
      <div className="bg-white border border-champagne/40 rounded-sm p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Weekly Revenue & Orders Trend
            </h3>
            <p className="text-xs text-charcoal/60">Grounded in real confirmed orders over the past 7 days</p>
          </div>
          <span className="text-xs text-burgundy font-semibold flex items-center space-x-1">
            <FiTrendingUp className="w-4 h-4" />
            <span>Telemetry</span>
          </span>
        </div>

        {/* CSS Bar Chart */}
        <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-champagne/40 pb-2">
          {chartDays.map((day, idx) => {
            const maxRev = Math.max(...chartDays.map((d) => d.revenue), 1000);
            const heightPercent = Math.max(8, Math.round((day.revenue / maxRev) * 100));

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] text-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  ₹{day.revenue}
                </span>
                <div
                  className="w-full max-w-[40px] bg-burgundy hover:bg-burgundy-light rounded-t-xs transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] text-charcoal/60 mt-2 font-mono">
                  {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                </span>
                <span className="text-[9px] text-charcoal/40 font-bold">{day.orders} ord</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders & Low Stock Tables Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white border border-champagne/40 rounded-sm p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-champagne/30">
            <h3 className="font-serif font-bold text-base text-charcoal">
              Recent Customer Orders
            </h3>
            <Link to="/admin/orders" className="text-xs text-burgundy hover:underline font-semibold">
              View All ({stats.totalOrders || 0}) →
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory/60 text-charcoal uppercase tracking-wider font-semibold border-b border-champagne/40">
                  <tr>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/20">
                  {recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-ivory/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-burgundy">
                        <Link to={`/orders/${ord._id}`}>{ord.orderNumber}</Link>
                      </td>
                      <td className="py-2.5 px-3 text-charcoal">{ord.customerInfo?.name}</td>
                      <td className="py-2.5 px-3 font-bold text-charcoal">
                        ₹{ord.pricing?.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-burgundy/10 text-burgundy'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-charcoal/50 italic py-4">No orders placed yet.</p>
          )}
        </div>

        {/* Low Stock Items Alert Table */}
        <div className="lg:col-span-5 bg-white border border-champagne/40 rounded-sm p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-champagne/30">
            <h3 className="font-serif font-bold text-base text-charcoal flex items-center space-x-1.5">
              <FiAlertTriangle className="text-red-600" />
              <span>Low Inventory Watch</span>
            </h3>
            <Link to="/admin/inventory" className="text-xs text-burgundy hover:underline font-semibold">
              Manage Stock →
            </Link>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory/60 text-charcoal uppercase tracking-wider font-semibold border-b border-champagne/40">
                  <tr>
                    <th className="py-2.5 px-3">Product / SKU</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3 text-right">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/20">
                  {lowStockItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-ivory/30">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-charcoal line-clamp-1">{item.productName}</p>
                        <span className="font-mono text-[10px] text-charcoal/50">{item.sku}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-charcoal">{item.size}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-red-600">
                        {item.stock} left
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-emerald-700 italic py-4">All garment inventories are healthy.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
