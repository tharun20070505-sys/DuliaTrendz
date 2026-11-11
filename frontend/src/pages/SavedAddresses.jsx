import React, { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users/addresses');
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.warn('Addresses fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openNewModal = () => {
    setEditId(null);
    setFullName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPincode('');
    setLandmark('');
    setAddressType('Home');
    setIsDefault(addresses.length === 0);
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditId(addr._id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setLandmark(addr.landmark || '');
    setAddressType(addr.addressType || 'Home');
    setIsDefault(addr.isDefault || false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        landmark,
        addressType,
        isDefault,
      };

      if (editId) {
        const { data } = await API.put(`/users/addresses/${editId}`, payload);
        if (data.success) {
          toast.success('Address updated.');
          setAddresses(data.addresses);
        }
      } else {
        const { data } = await API.post('/users/addresses', payload);
        if (data.success) {
          toast.success('New address added.');
          setAddresses(data.addresses);
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const { data } = await API.delete(`/users/addresses/${id}`);
      if (data.success) {
        toast.success('Address removed.');
        setAddresses(data.addresses);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete address.');
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-champagne/40 mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
              Delivery Book
            </span>
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Saved Addresses ({addresses.length})
            </h1>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="bg-burgundy hover:bg-burgundy-hover text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-40 bg-white border border-champagne/40 rounded-sm" />
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="bg-white border border-champagne/40 rounded-sm p-6 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-champagne/30 mb-3">
                    <span className="font-bold text-sm text-burgundy">{addr.fullName}</span>
                    <span className="text-[10px] uppercase font-bold bg-champagne/30 px-2 py-0.5 rounded text-charcoal">
                      {addr.addressType}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal/80 leading-relaxed">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-xs text-charcoal/70">{addr.addressLine2}</p>}
                  <p className="text-xs text-charcoal/80">
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  {addr.landmark && <p className="text-xs text-charcoal/60 mt-1">Landmark: {addr.landmark}</p>}
                  <p className="text-xs text-charcoal/70 mt-2 font-mono">Phone: {addr.phone}</p>

                  {addr.isDefault && (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-3 border border-emerald-200">
                      <FiCheck className="w-3 h-3" />
                      <span>Default Delivery Address</span>
                    </span>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-champagne/30 flex justify-end space-x-3 text-xs">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="text-charcoal hover:text-burgundy font-semibold flex items-center space-x-1"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr._id)}
                    className="text-red-700 hover:text-red-800 font-semibold flex items-center space-x-1"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-champagne/40 rounded-sm p-8 max-w-md mx-auto shadow-soft">
            <FiMapPin className="w-12 h-12 text-champagne-dark mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-burgundy mb-2">No Saved Addresses</h3>
            <p className="text-xs text-charcoal/60 mb-6">
              Add your delivery addresses for seamless, faster checkout.
            </p>
            <button
              type="button"
              onClick={openNewModal}
              className="bg-burgundy text-white text-xs font-semibold uppercase px-5 py-2.5 rounded-xs"
            >
              Add First Address
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-champagne shadow-elevated rounded-sm max-w-lg w-full p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal/60 hover:text-burgundy"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-burgundy mb-4">
              {editId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Street Address Line 1 *</label>
                <input
                  type="text"
                  placeholder="Flat / House No., Building Name, Street"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Area / Sector"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Pincode *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  {['Home', 'Office', 'Other'].map((t) => (
                    <label key={t} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="addrType"
                        checked={addressType === t}
                        onChange={() => setAddressType(t)}
                        className="text-burgundy"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>

                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-burgundy"
                  />
                  <span>Set as Default</span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;
