import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUploadCloud,
  FiPlus,
  FiTrash2,
  FiSave,
  FiDollarSign,
  FiInfo,
  FiLayers,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
const COMMON_COLOURS = [
  'Pink', 'Burgundy', 'Ivory', 'Black', 'Navy', 'Emerald Green', 'Mustard Yellow', 'Champagne', 'Wine', 'Olive', 'Teal', 'White'
];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    brand: 'Dulia Trendz',
    shortDescription: '',
    description: '',
    tags: '',
    mrp: '',
    price: '',
    costPrice: '',
    tax: 12,
    images: [],
    specifications: {
      fabric: '',
      fit: '',
      pattern: '',
      sleeve: '',
      neck: '',
      length: '',
      occasion: '',
      careInstructions: '',
      countryOfOrigin: 'India',
    },
    shipping: {
      weight: '',
      dimensions: '',
      dispatchInfo: '',
      returnEligibility: '',
    },
    status: 'active',
    featured: false,
    bestseller: false,
    newArrival: false,
  });

  const [variants, setVariants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products/${id}`),
        ]);

        const catList = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.categories || []);
        setCategories(catList);
        const p = prodRes.data.product;

        setFormData({
          name: p.name || '',
          sku: p.sku || '',
          category: p.category || '',
          subcategory: p.subcategory || '',
          brand: p.brand || 'Dulia Trendz',
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
          mrp: p.mrp || '',
          price: p.price || '',
          costPrice: p.costPrice || '',
          tax: p.tax || 12,
          images: p.images || [],
          specifications: {
            fabric: p.specifications?.fabric || '',
            fit: p.specifications?.fit || '',
            pattern: p.specifications?.pattern || '',
            sleeve: p.specifications?.sleeve || '',
            neck: p.specifications?.neck || '',
            length: p.specifications?.length || '',
            occasion: p.specifications?.occasion || '',
            careInstructions: p.specifications?.careInstructions || '',
            countryOfOrigin: p.specifications?.countryOfOrigin || 'India',
          },
          shipping: {
            weight: p.shipping?.weight || '450g',
            dimensions: p.shipping?.dimensions || '30x25x3 cm',
            dispatchInfo: p.shipping?.dispatchInfo || 'Ships in 24-48 hours',
            returnEligibility: p.shipping?.returnEligibility || '7 Days Returnable',
          },
          status: p.status || 'active',
          featured: !!p.featured,
          bestseller: !!p.bestseller,
          newArrival: !!p.newArrival,
        });

        setVariants(
          p.variants?.map((v) => ({
            _id: v._id,
            size: v.size || 'M',
            color: v.color || 'Burgundy',
            sku: v.sku || '',
            stock: v.stock !== undefined ? v.stock : 0,
            price: v.price || '',
            active: v.active !== false,
          })) || []
        );
      } catch (err) {
        toast.error('Failed to load product details');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSpecChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value },
    }));
  };

  const handleShippingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value },
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantRow = () => {
    const defaultColor = variants[0]?.color || 'Burgundy';
    setVariants([
      ...variants,
      { size: 'M', color: defaultColor, sku: '', stock: 5, price: formData.price, active: true },
    ]);
  };

  const removeVariantRow = (index) => {
    if (variants.length <= 1) {
      toast.error('Product must have at least one variant');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
    toast.success('Image added');
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      setUploadingImage(true);
      const res = await api.post('/products/upload-images', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.images) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.data.images],
        }));
        toast.success(`Uploaded ${res.data.images.length} images`);
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setAsPrimaryImage = (index) => {
    if (index === 0) return;
    const reordered = [...formData.images];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    setFormData((prev) => ({ ...prev, images: reordered }));
    toast.success('Primary cover image updated');
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Valid selling price is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : Number(formData.price),
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : formData.tags,
        variants: variants.map((v) => ({
          ...v,
          stock: Number(v.stock) || 0,
          price: v.price ? Number(v.price) : Number(formData.price),
          sku: v.sku || `${formData.sku || 'DT'}-${v.color.slice(0, 3).toUpperCase()}-${v.size}`,
        })),
      };

      await api.put(`/products/${id}`, payload);
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-charcoal/50 text-xs">
        Loading product data for editing...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="p-2 text-charcoal/60 hover:text-burgundy rounded hover:bg-ivory"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-charcoal">Edit Product</h1>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Updating: <span className="font-semibold text-burgundy">{formData.name}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleUpdate}
          className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-burgundy hover:bg-burgundy-dark text-white rounded-xs transition-colors shadow-xs"
        >
          {saving ? 'Saving Changes...' : 'Save Product Updates'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
              <FiInfo className="text-burgundy" />
              <span>1. Basic Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Master SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs bg-white"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Subcategory</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">Short Tagline</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">Full Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Photography */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
              <FiUploadCloud className="text-burgundy" />
              <span>2. Photography Gallery ({formData.images.length})</span>
            </h2>

            <form onSubmit={handleAddImageUrl} className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Add image URL..."
                className="flex-1 text-xs p-2.5 border border-champagne/50 rounded-xs"
              />
              <button type="submit" className="px-4 py-2 bg-charcoal text-white text-xs font-semibold rounded-xs">
                Add
              </button>
            </form>

            <div className="border-2 border-dashed border-champagne/60 p-4 text-center rounded-xs bg-ivory/30">
              <label className="cursor-pointer block">
                <FiUploadCloud className="w-8 h-8 text-burgundy/60 mx-auto mb-1" />
                <span className="text-xs font-semibold text-charcoal block">
                  {uploadingImage ? 'Uploading...' : 'Upload More Images'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group rounded-xs overflow-hidden border ${
                    idx === 0 ? 'border-burgundy ring-2 ring-burgundy/20' : 'border-champagne/50'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-28 object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-burgundy text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsPrimaryImage(idx)}
                        className="p-1 bg-white text-charcoal rounded text-[10px] font-semibold"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1 bg-red-600 text-white rounded"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Variants & Stock */}
          <div className="bg-white p-4 sm:p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-2">
              <h2 className="font-serif text-lg font-bold text-charcoal flex items-center space-x-2">
                <FiLayers className="text-burgundy" />
                <span>3. Size & Stock Variants</span>
              </h2>
              <button
                type="button"
                onClick={addVariantRow}
                className="text-xs font-semibold text-burgundy flex items-center space-x-1"
              >
                <FiPlus />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-champagne/40 rounded-xs">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-ivory border-b border-champagne/30 text-[10px] uppercase font-bold text-charcoal/70">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Colour</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-2 text-center">Active</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/20 bg-white">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-ivory/30">
                      <td className="py-2 px-3">
                        <select
                          value={v.size}
                          onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                          className="p-1 border border-champagne/60 rounded text-xs bg-white"
                        >
                          {STANDARD_SIZES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="w-24 p-1 border border-champagne/60 rounded text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          className="w-32 p-1 border border-champagne/60 rounded text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                          className={`w-16 p-1 border rounded text-xs text-right font-bold ${
                            v.stock === 0 ? 'border-red-300 text-red-600 bg-red-50' : 'border-champagne/60'
                          }`}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={v.price || ''}
                          placeholder={formData.price || ''}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          className="w-24 p-1 border border-champagne/60 rounded text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={v.active}
                          onChange={(e) => handleVariantChange(idx, 'active', e.target.checked)}
                          className="accent-burgundy"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
              <FiDollarSign className="text-burgundy" />
              <span>Pricing</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Selling Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full text-sm font-bold text-burgundy p-2.5 border border-champagne/50 rounded-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">MRP (₹)</label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs bg-white"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="pt-2 space-y-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="newArrival"
                  checked={formData.newArrival}
                  onChange={handleInputChange}
                  className="accent-burgundy"
                />
                <span className="font-medium text-charcoal">New Arrival</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="bestseller"
                  checked={formData.bestseller}
                  onChange={handleInputChange}
                  className="accent-burgundy"
                />
                <span className="font-medium text-charcoal">Bestseller</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="accent-burgundy"
                />
                <span className="font-medium text-charcoal">Featured</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
