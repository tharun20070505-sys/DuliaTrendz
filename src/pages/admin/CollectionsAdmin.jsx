import React, { useState, useEffect } from 'react';
import {
  FiLayers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiImage,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CollectionsAdmin = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    image: '',
    bannerImage: '',
    featured: false,
    order: 0,
  });

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collections');
      setCollections(res.data.collections || res.data || []);
    } catch (err) {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      title: '',
      description: '',
      image: '',
      bannerImage: '',
      featured: false,
      order: collections.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (col) => {
    setEditingCollection(col);
    setFormData({
      name: col.name || '',
      title: col.title || '',
      description: col.description || '',
      image: col.image || '',
      bannerImage: col.bannerImage || '',
      featured: !!col.featured,
      order: col.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Collection name is required');
      return;
    }

    try {
      if (editingCollection) {
        await api.put(`/collections/${editingCollection._id}`, formData);
        toast.success('Collection updated successfully');
      } else {
        await api.post('/collections', formData);
        toast.success('Collection created successfully');
      }
      setIsModalOpen(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save collection');
    }
  };

  const handleDelete = async (col) => {
    if (!window.confirm(`Delete collection "${col.name}"?`)) return;
    try {
      await api.delete(`/collections/${col._id}`);
      toast.success('Collection removed');
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Curated Collections</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Manage occasion edits such as Festive Wear, Office Essentials, Wedding Guest, and Resort Edits.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-dark text-white px-4 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-charcoal/50 text-xs">
          Loading boutique collections...
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white p-12 text-center text-charcoal/50 text-xs rounded-xs border border-champagne/40">
          No collections created yet. Click above to add Festive, Office, or Weekend edits.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col._id}
              className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-ivory overflow-hidden">
                  <img
                    src={
                      col.image ||
                      col.bannerImage ||
                      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={col.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase tracking-widest text-champagne font-bold">
                          Order #{col.order || 0}
                        </span>
                        {col.featured && (
                          <span className="bg-burgundy text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-white">{col.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-xs font-semibold text-burgundy block">
                    {col.title || col.name}
                  </span>
                  <p className="text-xs text-charcoal/70 line-clamp-2">
                    {col.description || 'Occasion edit for the contemporary woman.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-2 border-t border-champagne/20 flex items-center justify-between">
                <span className="text-[10px] font-mono text-charcoal/40">/{col.slug}</span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(col)}
                    className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(col)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-lg w-full border border-champagne/50 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
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
                  Collection Name <span className="text-burgundy">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Festive Collection"
                  className="w-full p-2.5 border border-champagne/60 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Editorial Heading</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Celebrate in Regal Splendour"
                  className="w-full p-2.5 border border-champagne/60 rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Card / Carousel Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border border-champagne/60 rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Full-Width Banner Image URL</label>
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="Optional hero banner URL"
                  className="w-full p-2.5 border border-champagne/60 rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Lavish silhouettes crafted for celebratory evenings..."
                  className="w-full p-2 border border-champagne/60 rounded-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-24 p-2 border border-champagne/60 rounded-xs"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span className="font-semibold text-charcoal">Feature on Homepage</span>
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
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsAdmin;
