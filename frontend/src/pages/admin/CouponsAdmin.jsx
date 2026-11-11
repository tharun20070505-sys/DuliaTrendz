import React, { useState, useEffect } from 'react';
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiPercent,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CouponsAdmin = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE', // 'PERCENTAGE' | 'FIXED'
    discountValue: 10,
    minOrderAmount: 999,
    maxDiscountAmount: 500,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 500,
    perUserLimit: 1,
    active: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      setCoupons(res.data.coupons || []);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderAmount: 1499,
      maxDiscountAmount: 500,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 500,
      perUserLimit: 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || '',
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit || 500,
      perUserLimit: c.perUserLimit || 1,
      active: c.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (c) => {
    try {
      await api.put(`/coupons/${c._id}`, { active: !c.active });
      toast.success(`Coupon ${!c.active ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        usageLimit: Number(formData.usageLimit) || 1000,
        perUserLimit: Number(formData.perUserLimit) || 1,
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      await api.delete(`/coupons/${c._id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Promotional Coupons & Vouchers</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Configure percentage and flat discount vouchers with minimum order thresholds and single-use constraints.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-dark text-white px-4 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal min-w-[700px]">
            <thead className="bg-ivory border-b border-champagne/40 text-[10px] uppercase font-bold tracking-wider text-charcoal/70">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Min Order</th>
                <th className="py-3 px-3">Max Cap</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/20">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal/50">
                    Loading promotional vouchers...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal/50">
                    No active discount coupons configured.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  return (
                    <tr key={c._id} className="hover:bg-ivory/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <FiTag className="text-burgundy w-3.5 h-3.5" />
                          <span className="font-mono font-bold text-burgundy text-sm tracking-wider">
                            {c.code}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-charcoal">
                        {c.discountType === 'PERCENTAGE'
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} FLAT OFF`}
                      </td>

                      <td className="py-3 px-3 text-charcoal/80">
                        ₹{c.minOrderAmount?.toLocaleString('en-IN') || 0}
                      </td>

                      <td className="py-3 px-3 text-charcoal/80">
                        {c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No limit'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-mono ${
                            isExpired ? 'text-red-600 font-bold' : 'text-charcoal/70'
                          }`}
                        >
                          {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-colors ${
                            c.active && !isExpired
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isExpired ? 'Expired' : c.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                            title="Edit Coupon"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete Coupon"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-md w-full border border-champagne/50 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {editingCoupon ? 'Edit Coupon' : 'Create New Voucher'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal/40 hover:text-charcoal text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Coupon Code <span className="text-burgundy">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE20"
                  className="w-full p-2.5 border border-champagne/60 rounded-xs font-mono font-bold tracking-wider focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full p-2 border border-champagne/60 rounded-xs bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-2 border border-champagne/60 rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full p-2 border border-champagne/60 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full p-2 border border-champagne/60 rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2 border border-champagne/60 rounded-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="accent-burgundy"
                />
                <label htmlFor="couponActive" className="font-semibold text-charcoal cursor-pointer">
                  Activate coupon immediately
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-champagne/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-champagne text-charcoal rounded-xs font-semibold hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-burgundy hover:bg-burgundy-dark text-white rounded-xs font-semibold tracking-wider uppercase shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsAdmin;
