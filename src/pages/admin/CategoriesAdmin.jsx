import React, { useState, useEffect } from 'react';
import {
  FiFolder,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiImage,
  FiTag,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    subcategories: [],
  });
  const [subcatInput, setSubcatInput] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.categories || res.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      order: categories.length + 1,
      subcategories: [],
    });
    setSubcatInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      order: cat.order || 0,
      subcategories: cat.subcategories || [],
    });
    setSubcatInput('');
    setIsModalOpen(true);
  };

  const handleAddSubcat = (e) => {
    e.preventDefault();
    if (!subcatInput.trim()) return;
    if (formData.subcategories.includes(subcatInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, subcatInput.trim()],
    }));
    setSubcatInput('');
  };

  const removeSubcat = (item) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== item),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Categories & Silhouettes</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Organize Ethnic, Western, Sarees, and Occasion wear hierarchies for boutique discovery.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-dark text-white px-4 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="py-20 text-center text-charcoal/50 text-xs">
          Loading boutique categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 text-center text-charcoal/50 text-xs rounded-xs border border-champagne/40">
          No categories found. Create your first category above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-ivory overflow-hidden">
                  <img
                    src={
                      cat.image ||
                      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-champagne font-bold">
                        Order #{cat.order || 0}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-white">{cat.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-charcoal/70 line-clamp-2">
                    {cat.description || 'Curated women’s boutique fashion silhouette.'}
                  </p>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/50 block mb-1.5">
                      Subcategories ({cat.subcategories?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        cat.subcategories.map((sub, i) => (
                          <span
                            key={i}
                            className="bg-ivory text-charcoal/80 text-[10px] px-2 py-0.5 rounded border border-champagne/40"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-charcoal/40 italic">
                          No subcategories added
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-2 border-t border-champagne/20 flex items-center justify-between">
                <span className="text-[10px] font-mono text-charcoal/40">/{cat.slug}</span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-lg w-full border border-champagne/50 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                  Category Name <span className="text-burgundy">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ethnic Wear"
                  className="w-full p-2.5 border border-champagne/60 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border border-champagne/60 rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Handcrafted kurtis, anarkalis, and traditional ensembles..."
                  className="w-full p-2 border border-champagne/60 rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-24 p-2 border border-champagne/60 rounded-xs"
                />
              </div>

              {/* Subcategories Chip Builder */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">Subcategories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subcatInput}
                    onChange={(e) => setSubcatInput(e.target.value)}
                    placeholder="e.g. Kurtis, Anarkali..."
                    className="flex-1 p-2 border border-champagne/60 rounded-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcat}
                    className="px-3 py-1 bg-charcoal text-white rounded-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-ivory/50 border border-champagne/40 rounded-xs">
                  {formData.subcategories.map((sub, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs border border-champagne/60"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => removeSubcat(sub)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {formData.subcategories.length === 0 && (
                    <span className="text-charcoal/40 text-[11px] self-center">
                      No subcategories added yet
                    </span>
                  )}
                </div>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesAdmin;
