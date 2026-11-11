import React, { useState, useEffect } from 'react';
import {
  FiDatabase,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiRefreshCw,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiClock,
  FiSliders,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'movements'
  const [variants, setVariants] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Stock Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [adjustReason, setAdjustReason] = useState('RESTOCK');
  const [adjustNote, setAdjustNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      setVariants(res.data.variants || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/movements');
      setMovements(res.data.movements || []);
    } catch (err) {
      toast.error('Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'grid') {
      fetchInventory();
    } else {
      fetchMovements();
    }
  }, [activeTab, page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  const openAdjustModal = (item) => {
    setSelectedVariant(item);
    setNewStockVal(item.stock);
    setAdjustReason('RESTOCK');
    setAdjustNote('');
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedVariant) return;

    try {
      setSubmitting(true);
      await api.patch(`/inventory/variants/${encodeURIComponent(selectedVariant.variantSku)}`, {
        newStock: Number(newStockVal),
        reason: adjustReason,
        note: adjustNote,
      });

      toast.success(`Inventory for ${selectedVariant.variantSku} updated!`);
      setSelectedVariant(null);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Inventory Management</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Independent variant-level stock tracking across sizes and colours with atomic decrement protection.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 bg-ivory border border-champagne/50 rounded-xs">
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
              activeTab === 'grid'
                ? 'bg-burgundy text-white shadow-xs'
                : 'text-charcoal/70 hover:text-burgundy'
            }`}
          >
            Variant Stock Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
              activeTab === 'movements'
                ? 'bg-burgundy text-white shadow-xs'
                : 'text-charcoal/70 hover:text-burgundy'
            }`}
          >
            Audit Log / History
          </button>
        </div>
      </div>

      {activeTab === 'grid' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xs border border-champagne/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Variant SKU (e.g. DT-KUR-001-PNK-S), Product Name..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
              />
              <FiSearch className="absolute left-3 top-2.5 text-charcoal/40 w-4 h-4" />
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="flex-1 md:flex-initial text-xs border border-champagne/50 rounded-xs px-3 py-2 bg-white text-charcoal focus:outline-hidden focus:border-burgundy"
              >
                <option value="">All Stock Levels</option>
                <option value="in stock">In Stock</option>
                <option value="only 1 left">Low Stock (Critical)</option>
                <option value="out of stock">Out of Stock</option>
              </select>

              <button
                type="button"
                onClick={fetchInventory}
                className="p-2 border border-champagne/50 rounded-xs text-charcoal hover:bg-ivory shrink-0"
                title="Refresh"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal min-w-[780px]">
                <thead className="bg-ivory border-b border-champagne/40 text-[10px] uppercase font-bold tracking-wider text-charcoal/70">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3">Variant SKU</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Colour</th>
                    <th className="py-3 px-3 text-right">Units on Hand</th>
                    <th className="py-3 px-3">Threshold</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/20">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-charcoal/50">
                        Scanning boutique inventory levels...
                      </td>
                    </tr>
                  ) : variants.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-charcoal/50">
                        No inventory items found.
                      </td>
                    </tr>
                  ) : (
                    variants.map((item, idx) => {
                      const isOut = item.stock === 0;
                      const isLow = item.stock > 0 && item.stock <= (item.lowStockThreshold || 5);

                      return (
                        <tr key={idx} className="hover:bg-ivory/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-charcoal">
                            {item.productName}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-burgundy font-bold">
                            {item.variantSku}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-ivory px-2 py-0.5 rounded text-[11px] font-bold border border-champagne/40">
                              {item.size}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-charcoal/80">
                            {item.color}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                            <span
                              className={
                                isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-charcoal'
                              }
                            >
                              {item.stock}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-charcoal/60">
                            ≤ {item.lowStockThreshold || 5}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                isOut
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isOut ? 'Out of Stock' : isLow ? `Only ${item.stock} Left` : 'In Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openAdjustModal(item)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-ivory hover:bg-champagne/40 text-charcoal border border-champagne/60 rounded text-[11px] font-semibold transition-colors"
                            >
                              <FiEdit className="w-3 h-3 text-burgundy" />
                              <span>Adjust</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-ivory/50 border-t border-champagne/30 flex items-center justify-between text-xs text-charcoal/60">
              <span>
                Showing {variants.length} of {totalCount} variant inventory units
              </span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2.5 py-1 border border-champagne/50 rounded-xs disabled:opacity-40 hover:bg-white"
                >
                  Previous
                </button>
                <span className="px-3 py-1 font-semibold text-charcoal">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-2.5 py-1 border border-champagne/50 rounded-xs disabled:opacity-40 hover:bg-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Movement Audit Log */
        <div className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-champagne/30 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-charcoal">Stock Movement Ledger</h2>
              <p className="text-xs text-charcoal/60">
                Audited transaction logs tracking customer checkouts, admin restocks, and warehouse adjustments.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchMovements}
              className="p-2 border border-champagne/50 rounded-xs text-charcoal hover:bg-ivory"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal">
              <thead className="bg-ivory border-b border-champagne/30 text-[10px] uppercase font-bold text-charcoal/70">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Variant SKU</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Prev</th>
                  <th className="py-2.5 px-3 text-center">Delta</th>
                  <th className="py-2.5 px-3 text-right">New Stock</th>
                  <th className="py-2.5 px-4">Operator / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne/20">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-charcoal/50">
                      Loading audit ledger...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-charcoal/50">
                      No stock movement history recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.change > 0;
                    return (
                      <tr key={m._id} className="hover:bg-ivory/30">
                        <td className="py-2.5 px-4 text-charcoal/60 font-mono text-[11px]">
                          {new Date(m.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-charcoal">
                          {m.productName || 'Boutique Item'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-burgundy">
                          {m.variantSku}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-ivory px-2 py-0.5 rounded text-[10px] font-bold border border-champagne/40">
                            {m.reason}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-charcoal/70">
                          {m.previousStock}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span
                            className={
                              isPositive
                                ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded'
                                : 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded'
                            }
                          >
                            {isPositive ? `+${m.change}` : m.change}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-charcoal">
                          {m.newStock}
                        </td>
                        <td className="py-2.5 px-4 text-[11px] text-charcoal/60">
                          {m.note || (m.orderId ? `Order #${m.orderId.slice(-6)}` : 'Manual Adjustment')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-md w-full border border-champagne/50 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">Stock Adjustment</h3>
                <p className="text-xs text-charcoal/60 font-mono">
                  {selectedVariant.variantSku} ({selectedVariant.size} / {selectedVariant.color})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVariant(null)}
                className="text-charcoal/40 hover:text-charcoal text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="bg-ivory p-3 rounded-xs border border-champagne/40 flex justify-between items-center">
                <span>Current Stock on Hand:</span>
                <span className="font-mono font-bold text-sm text-charcoal">
                  {selectedVariant.stock} units
                </span>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  New Stock Count <span className="text-burgundy">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full p-2.5 border border-champagne/60 rounded-xs font-mono font-bold text-sm focus:outline-hidden focus:border-burgundy"
                />
              </div>

              {/* Quick Restock Buttons */}
              <div className="flex gap-2">
                {[5, 10, 25, 50].map((add) => (
                  <button
                    key={add}
                    type="button"
                    onClick={() => setNewStockVal(Number(selectedVariant.stock) + add)}
                    className="flex-1 py-1 bg-ivory border border-champagne/60 rounded text-[11px] font-semibold text-charcoal hover:border-burgundy hover:text-burgundy"
                  >
                    +{add} Units
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 border border-champagne/60 rounded-xs bg-white text-xs"
                >
                  <option value="RESTOCK">Supplier Restock Inflow</option>
                  <option value="AUDIT_CORRECTION">Physical Inventory Audit</option>
                  <option value="RETURN">Customer Return Restock</option>
                  <option value="DAMAGED">Damaged / Written Off</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Audit Notes / Reference</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. PO-8929 Batch 3 Received"
                  className="w-full p-2 border border-champagne/60 rounded-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-champagne/30">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="px-4 py-2 border border-champagne text-charcoal rounded-xs font-semibold hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-burgundy hover:bg-burgundy-dark text-white rounded-xs font-semibold tracking-wider uppercase shadow-xs"
                >
                  {submitting ? 'Updating...' : 'Commit Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
