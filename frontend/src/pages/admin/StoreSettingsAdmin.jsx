import React, { useState, useEffect } from 'react';
import {
  FiSettings,
  FiSave,
  FiTruck,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiMapPin,
  FiRotateCcw,
  FiAlertCircle,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StoreSettingsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeName: 'Dulia Trendz',
    tagline: 'Your Style, Our Passion...',
    contactEmail: 'care@duliatrendz.com',
    contactPhone: '+91 98765 43210',
    address: 'Dulia Trendz Haute Couture Studio, 12 Fashion Boulevard, Indiranagar, Bengaluru, KA 560038',
    shipping: {
      freeShippingThreshold: 999,
      standardShippingFee: 99,
      expressShippingFee: 199,
    },
    cod: {
      enabled: true,
      minOrderAmount: 499,
      maxOrderAmount: 25000,
      fee: 0,
    },
    returnPolicyDays: 7,
    defaultLowStockThreshold: 5,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data.settings) {
          const s = res.data.settings;
          setFormData((prev) => ({
            ...prev,
            storeName: s.storeName || prev.storeName,
            tagline: s.tagline || prev.tagline,
            contactEmail: s.contactEmail || prev.contactEmail,
            contactPhone: s.contactPhone || prev.contactPhone,
            address: s.address || prev.address,
            shipping: {
              freeShippingThreshold: s.shipping?.freeShippingThreshold ?? 999,
              standardShippingFee: s.shipping?.standardShippingFee ?? 99,
              expressShippingFee: s.shipping?.expressShippingFee ?? 199,
            },
            cod: {
              enabled: s.cod?.enabled !== false,
              minOrderAmount: s.cod?.minOrderAmount ?? 499,
              maxOrderAmount: s.cod?.maxOrderAmount ?? 25000,
              fee: s.cod?.fee ?? 0,
            },
            returnPolicyDays: s.returnPolicyDays ?? 7,
            defaultLowStockThreshold: s.defaultLowStockThreshold ?? 5,
          }));
        }
      } catch (err) {
        toast.error('Failed to load store settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', formData);
      toast.success('Boutique store settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-charcoal/50 text-xs">
        Loading boutique configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Store Policies & Configuration</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Configure logistics thresholds, COD payment rules, contact details, and return windows.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-dark text-white px-5 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs self-start sm:self-auto"
        >
          <FiSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Brand Identity & Contacts */}
        <div className="bg-white p-4 sm:p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
            <FiSettings className="text-burgundy" />
            <span>1. Boutique Brand & Support Contacts</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Store Brand Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 border border-champagne/60 rounded-xs font-serif font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Customer Care Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Customer Care Helpline</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal mb-1">
                Physical Boutique Studio Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* 2. Shipping & Delivery Fees */}
        <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
            <FiTruck className="text-burgundy" />
            <span>2. Shipping Logistics & Delivery Rates</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.shipping.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: {
                      ...formData.shipping,
                      freeShippingThreshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs font-bold text-burgundy"
              />
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Orders above this qualify for 0 shipping
              </span>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.shipping.standardShippingFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: {
                      ...formData.shipping,
                      standardShippingFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Express Shipping Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.shipping.expressShippingFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: {
                      ...formData.shipping,
                      expressShippingFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Cash on Delivery (COD) Rules */}
        <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-champagne/30 pb-2">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center space-x-2">
              <FiDollarSign className="text-burgundy" />
              <span>3. Cash on Delivery (COD) Safeguards</span>
            </h2>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.cod.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cod: { ...formData.cod, enabled: e.target.checked },
                  })
                }
                className="accent-burgundy"
              />
              <span className="font-bold text-xs text-charcoal">Enable COD Checkout</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Minimum Order for COD (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cod.minOrderAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cod: { ...formData.cod, minOrderAmount: Number(e.target.value) },
                  })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Maximum Order for COD (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cod.maxOrderAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cod: { ...formData.cod, maxOrderAmount: Number(e.target.value) },
                  })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs font-semibold"
              />
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Higher orders require prepaid
              </span>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">COD Handling Surcharge (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.cod.fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cod: { ...formData.cod, fee: Number(e.target.value) },
                  })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Inventory & Return Thresholds */}
        <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
            <FiRotateCcw className="text-burgundy" />
            <span>4. Inventory Alerts & Return Window</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Default Low-Stock Warning Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultLowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultLowStockThreshold: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Triggers "Only X left" badge and admin alert
              </span>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">
                Customer Return Window (Days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.returnPolicyDays}
                onChange={(e) =>
                  setFormData({ ...formData, returnPolicyDays: Number(e.target.value) })
                }
                className="w-full p-2.5 border border-champagne/60 rounded-xs"
              />
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Days after delivery eligible for return requests
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StoreSettingsAdmin;
