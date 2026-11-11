import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUploadCloud,
  FiPlus,
  FiTrash2,
  FiSave,
  FiEye,
  FiCheck,
  FiLayers,
  FiDollarSign,
  FiInfo,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
const COMMON_COLOURS = [
  'Pink', 'Burgundy', 'Ivory', 'Black', 'Navy', 'Emerald Green', 'Mustard Yellow', 'Champagne', 'Wine', 'Olive', 'Teal', 'White'
];

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
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
      fabric: 'Cotton Silk Blend',
      fit: 'Regular Fit',
      pattern: 'Floral / Ethnic',
      sleeve: 'Three-Quarter',
      neck: 'Round Neck',
      length: 'Calf Length',
      occasion: 'Festive & Casual',
      careInstructions: 'Dry clean recommended. Gentle hand wash cold.',
      countryOfOrigin: 'India',
    },
    shipping: {
      weight: '450g',
      dimensions: '30x25x3 cm',
      dispatchInfo: 'Ships within 24-48 hours',
      returnEligibility: '7 Days Easy Return & Exchange',
    },
    status: 'active',
    featured: false,
    bestseller: false,
    newArrival: true,
  });

  // Variants state: array of { size, color, sku, stock, price, active }
  const [variants, setVariants] = useState([
    { size: 'S', color: 'Burgundy', sku: '', stock: 10, price: '', active: true },
    { size: 'M', color: 'Burgundy', sku: '', stock: 15, price: '', active: true },
    { size: 'L', color: 'Burgundy', sku: '', stock: 10, price: '', active: true },
  ]);

  // Image input helper
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        const catList = Array.isArray(res.data) ? res.data : (res.data?.categories || []);
        setCategories(catList);
        if (catList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: catList[0].name,
            subcategory: catList[0].subcategories?.[0] || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

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

  // Variant operations
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

  const addSizeQuick = (sizeName) => {
    const defaultColor = variants[0]?.color || 'Burgundy';
    if (variants.some((v) => v.size === sizeName && v.color === defaultColor)) {
      toast.error(`${sizeName} in ${defaultColor} already exists in variant list`);
      return;
    }
    setVariants([
      ...variants,
      { size: sizeName, color: defaultColor, sku: '', stock: 8, price: formData.price, active: true },
    ]);
    toast.success(`Added size ${sizeName}`);
  };

  const addColourQuick = (colourName) => {
    const existingSizes = [...new Set(variants.map((v) => v.size))];
    const newVariants = existingSizes.map((s) => ({
      size: s,
      color: colourName,
      sku: '',
      stock: 8,
      price: formData.price,
      active: true,
    }));
    setVariants([...variants, ...newVariants]);
    toast.success(`Added ${colourName} for ${existingSizes.length} sizes`);
  };

  const removeVariantRow = (index) => {
    if (variants.length <= 1) {
      toast.error('Product must have at least one variant');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Image handlers
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
      toast.error('Image upload failed, using URL fallback');
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

  // Auto-generate SKUs if blank
  const generateSKUs = () => {
    const baseSKU = formData.sku.trim() || `DT-${formData.name.slice(0, 3).toUpperCase() || 'ITM'}`;
    const updated = variants.map((v) => {
      const col = v.color.slice(0, 3).toUpperCase();
      const sz = v.size.replace(/\s+/g, '').toUpperCase();
      return {
        ...v,
        sku: v.sku || `${baseSKU}-${col}-${sz}`,
        price: v.price || formData.price,
      };
    });
    setVariants(updated);
    toast.success('Generated variant SKUs');
  };

  // Calculate discount percentage
  const discountPercent =
    formData.mrp && formData.price && Number(formData.mrp) > Number(formData.price)
      ? Math.round(((Number(formData.mrp) - Number(formData.price)) / Number(formData.mrp)) * 100)
      : 0;

  // Quick pre-fill sample for testing
  const handlePrefillSample = () => {
    setFormData({
      name: 'Royal Zari Embroidered Silk Kurti Set',
      sku: `DT-KUR-${Date.now().toString().slice(-4)}`,
      category: categories[0]?.name || 'Ethnic Wear',
      subcategory: 'Anarkali Sets',
      brand: 'Dulia Trendz Haute Couture',
      shortDescription: 'Exquisite silk blend kurta with ornate metallic zardozi embroidery and matching dupatta.',
      description: 'Hand-tailored from pure Chanderi silk with delicate golden threads woven into the yoke. Paired with a cascading organza dupatta and tapered silk pants. Perfect for bridal soirees, festive pujas, and gala celebrations.',
      tags: 'silk, kurti, bridal, anarkali, festive, gold, royal',
      mrp: '4999',
      price: '3499',
      costPrice: '1500',
      tax: 12,
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop',
      ],
      specifications: {
        fabric: 'Pure Chanderi Silk with Mulmul Lining',
        fit: 'Regular Flared Anarkali',
        pattern: 'Intricate Floral Zari & Resham Work',
        sleeve: 'Three-Quarter Bell Sleeves',
        neck: 'Sweetheart Neck with Keyhole Placket',
        length: 'Floor Length Grazing',
        occasion: 'Festivals, Weddings & Receptions',
        careInstructions: 'Dry clean only. Store wrapped in muslin cloth.',
        countryOfOrigin: 'India',
      },
      shipping: {
        weight: '550g',
        dimensions: '32x26x4 cm',
        dispatchInfo: 'Ships within 24-48 hours',
        returnEligibility: '7 Days Easy Return & Exchange',
      },
      status: 'active',
      featured: true,
      bestseller: true,
      newArrival: true,
    });
    setVariants([
      { size: 'S', color: 'Royal Burgundy', sku: `DT-KUR-BUR-S`, stock: 15, price: '3499', active: true },
      { size: 'M', color: 'Royal Burgundy', sku: `DT-KUR-BUR-M`, stock: 20, price: '3499', active: true },
      { size: 'L', color: 'Royal Burgundy', sku: `DT-KUR-BUR-L`, stock: 12, price: '3499', active: true },
      { size: 'XL', color: 'Royal Burgundy', sku: `DT-KUR-BUR-XL`, stock: 8, price: '3499', active: true },
    ]);
    toast.success('Pre-filled luxury product details!');
  };

  const handleSubmit = async (publishStatus) => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Valid selling price is required');
      return;
    }
    if (variants.length === 0) {
      toast.error('At least one size-colour variant is required');
      return;
    }

    try {
      setLoading(true);
      const normalizedImages = (formData.images.length > 0
        ? formData.images
        : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop']
      ).map((img, idx) => ({
        url: typeof img === 'string' ? img : img.url,
        isPrimary: idx === 0,
        alt: formData.name || 'Dulia Trendz Fashion',
      }));

      const payload = {
        ...formData,
        images: normalizedImages,
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : Number(formData.price),
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : formData.tags,
        variants: variants.map((v) => ({
          ...v,
          stock: Number(v.stock) || 0,
          price: v.price ? Number(v.price) : Number(formData.price),
          sku: v.sku || `${formData.sku || 'DT'}-${v.color.slice(0, 3).toUpperCase()}-${v.size}`,
        })),
        status: publishStatus || formData.status,
      };

      const res = await api.post('/products', payload);
      toast.success(publishStatus === 'draft' ? 'Saved as Draft' : 'Product Published Successfully!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="font-serif text-2xl font-bold text-charcoal">Add New Product</h1>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Create a luxury piece with multi-size inventory, editorial photography, and rich attributes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrefillSample}
            className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider bg-champagne/30 text-burgundy hover:bg-champagne/50 border border-champagne rounded-xs transition-colors"
            title="Populate all fields with a sample luxury kurti piece for instant testing"
          >
            ⚡ Pre-fill Sample Product
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('draft')}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-champagne text-charcoal hover:bg-ivory rounded-xs transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('active')}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-burgundy hover:bg-burgundy-dark text-white rounded-xs transition-colors shadow-xs"
          >
            {loading ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Core Info, Images, Variants */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
              <FiInfo className="text-burgundy" />
              <span>1. Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Product Name <span className="text-burgundy">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Royal Maroon Velvet Anarkali Set"
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Base Master SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g. DT-ANK-001"
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Primary Category <span className="text-burgundy">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.name === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                      subcategory: cat?.subcategories?.[0] || '',
                    }));
                  }}
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy bg-white"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  placeholder="e.g. Anarkali, Kurtis, Co-ords"
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Short Editorial Tagline
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="e.g. Handcrafted with gold zari detailing on rich plush velvet."
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Elaborate on the silhouette, artisanal embroidery, fabric feel, and styling tips..."
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Search Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="kurti, velvet, wedding guest, maroon, anarkali"
                  className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
                />
              </div>
            </div>
          </div>

          {/* 2. Photography & Gallery */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-2">
              <h2 className="font-serif text-lg font-bold text-charcoal flex items-center space-x-2">
                <FiUploadCloud className="text-burgundy" />
                <span>2. Product Photography</span>
              </h2>
              <span className="text-[11px] text-charcoal/50">
                First image is primary cover photo
              </span>
            </div>

            {/* Direct URL input */}
            <form onSubmit={handleAddImageUrl} className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste high-res fashion photo URL (Unsplash, Cloudinary, etc.)"
                className="flex-1 text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-charcoal text-white text-xs font-semibold rounded-xs hover:bg-charcoal/90"
              >
                Add URL
              </button>
            </form>

            {/* Local File / Cloudinary Upload */}
            <div className="border-2 border-dashed border-champagne/60 p-4 text-center rounded-xs bg-ivory/30">
              <label className="cursor-pointer block">
                <FiUploadCloud className="w-8 h-8 text-burgundy/60 mx-auto mb-1" />
                <span className="text-xs font-semibold text-charcoal block">
                  {uploadingImage ? 'Uploading to Boutique Storage...' : 'Upload Images from Device'}
                </span>
                <span className="text-[10px] text-charcoal/50 block mt-0.5">
                  JPEG, PNG, WebP supported
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

            {/* Thumbnails list */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded-xs overflow-hidden border ${
                      idx === 0 ? 'border-burgundy ring-2 ring-burgundy/20' : 'border-champagne/50'
                    }`}
                  >
                    <img
                      src={typeof img === 'string' ? img : (img?.url || '')}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-burgundy text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsPrimaryImage(idx)}
                          className="p-1 bg-white text-charcoal rounded text-[10px] font-semibold hover:bg-champagne"
                          title="Make primary"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Delete"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Variant & Size-Stock Level Inventory */}
          <div className="bg-white p-4 sm:p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-champagne/30 pb-2">
              <div>
                <h2 className="font-serif text-lg font-bold text-charcoal flex items-center space-x-2">
                  <FiLayers className="text-burgundy" />
                  <span>3. Size & Colour Variants (Atomic Inventory)</span>
                </h2>
                <p className="text-[11px] text-charcoal/60">
                  Each combination maintains independent stock tracking in MongoDB.
                </p>
              </div>
              <button
                type="button"
                onClick={generateSKUs}
                className="text-[11px] font-semibold text-burgundy hover:underline flex items-center space-x-1"
              >
                <span>Generate SKUs</span>
              </button>
            </div>

            {/* Quick Add Presets */}
            <div className="bg-ivory/60 p-3 rounded-xs border border-champagne/30 space-y-2">
              <span className="text-[11px] font-bold uppercase text-charcoal/70 block">
                Quick-Add Standard Sizes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STANDARD_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => addSizeQuick(sz)}
                    className="px-2 py-0.5 bg-white border border-champagne/60 text-charcoal text-[11px] rounded hover:border-burgundy hover:text-burgundy transition-colors"
                  >
                    + {sz}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-bold uppercase text-charcoal/70 block pt-1">
                Quick-Add Colour Matrix:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_COLOURS.slice(0, 8).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => addColourQuick(col)}
                    className="px-2 py-0.5 bg-white border border-champagne/60 text-charcoal text-[11px] rounded hover:border-burgundy hover:text-burgundy transition-colors"
                  >
                    + {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Variant Table */}
            <div className="overflow-x-auto border border-champagne/40 rounded-xs">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-ivory border-b border-champagne/30 text-[10px] uppercase font-bold text-charcoal/70">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Colour</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Stock Units</th>
                    <th className="py-2.5 px-3">Override Price (₹)</th>
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
                          placeholder="Colour"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          className="w-32 p-1 border border-champagne/60 rounded text-xs font-mono"
                          placeholder="Auto-generated"
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
                          placeholder={formData.price || 'Default'}
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

            <button
              type="button"
              onClick={addVariantRow}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-burgundy hover:text-burgundy-dark"
            >
              <FiPlus className="w-4 h-4" />
              <span>+ Add Custom Variant Row</span>
            </button>
          </div>

          {/* 4. Specifications */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2">
              4. Garment Specifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Fabric</label>
                <input
                  type="text"
                  value={formData.specifications.fabric}
                  onChange={(e) => handleSpecChange('fabric', e.target.value)}
                  className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Fit</label>
                <input
                  type="text"
                  value={formData.specifications.fit}
                  onChange={(e) => handleSpecChange('fit', e.target.value)}
                  className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Pattern</label>
                <input
                  type="text"
                  value={formData.specifications.pattern}
                  onChange={(e) => handleSpecChange('pattern', e.target.value)}
                  className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Sleeve</label>
                <input
                  type="text"
                  value={formData.specifications.sleeve}
                  onChange={(e) => handleSpecChange('sleeve', e.target.value)}
                  className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Neck</label>
                <input
                  type="text"
                  value={formData.specifications.neck}
                  onChange={(e) => handleSpecChange('neck', e.target.value)}
                  className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Occasion</label>
                <input
                  type="text"
                  value={formData.specifications.occasion}
                  onChange={(e) => handleSpecChange('occasion', e.target.value)}
                  className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-charcoal mb-1">Care Instructions</label>
                <input
                  type="text"
                  value={formData.specifications.careInstructions}
                  onChange={(e) => handleSpecChange('careInstructions', e.target.value)}
                  className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Pricing, Badges, Shipping & Publish */}
        <div className="space-y-6">
          {/* Pricing Box */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2 flex items-center space-x-2">
              <FiDollarSign className="text-burgundy" />
              <span>Pricing Strategy</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Selling Price (₹) <span className="text-burgundy">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 1999"
                className="w-full text-sm font-bold text-burgundy p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Maximum Retail Price (MRP ₹)
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                placeholder="e.g. 2999"
                className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
              />
            </div>

            {discountPercent > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xs text-xs flex items-center justify-between">
                <span>Calculated Discount:</span>
                <span className="font-bold">{discountPercent}% OFF</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Internal Cost Price (Admin Only)
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleInputChange}
                placeholder="Optional supplier cost"
                className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
              />
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-3">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2">
              Status & Badges
            </h2>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Catalog Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full text-xs p-2.5 border border-champagne/50 rounded-xs bg-white"
              >
                <option value="active">Active (Visible in boutique)</option>
                <option value="draft">Draft (Hidden)</option>
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
                <span className="font-medium text-charcoal">Badge: New Arrival</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="bestseller"
                  checked={formData.bestseller}
                  onChange={handleInputChange}
                  className="accent-burgundy"
                />
                <span className="font-medium text-charcoal">Badge: Loved by You (Bestseller)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="accent-burgundy"
                />
                <span className="font-medium text-charcoal">Badge: Featured Curated Edit</span>
              </label>
            </div>
          </div>

          {/* Shipping & Delivery policy */}
          <div className="bg-white p-6 rounded-xs border border-champagne/40 shadow-xs space-y-3">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-champagne/30 pb-2">
              Dispatch & Returns
            </h2>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Estimated Dispatch</label>
              <input
                type="text"
                value={formData.shipping.dispatchInfo}
                onChange={(e) => handleShippingChange('dispatchInfo', e.target.value)}
                className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Return Eligibility</label>
              <input
                type="text"
                value={formData.shipping.returnEligibility}
                onChange={(e) => handleShippingChange('returnEligibility', e.target.value)}
                className="w-full text-xs p-2 border border-champagne/50 rounded-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
