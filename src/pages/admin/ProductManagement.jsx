import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiEye,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiTrendingUp,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        category: selectedCategory || undefined,
        status: statusFilter || undefined,
      };
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const catList = Array.isArray(res.data) ? res.data : (res.data?.categories || []);
      setCategories(catList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/products/${id}/duplicate`);
      toast.success('Product duplicated as draft');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to duplicate product');
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'archived' : 'active';
    try {
      await api.put(`/products/${product._id}`, { status: newStatus });
      toast.success(`Product status updated to ${newStatus}`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleFlag = async (product, flag) => {
    try {
      await api.put(`/products/${product._id}`, { [flag]: !product[flag] });
      toast.success(`Updated ${flag}`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update badge flag');
    }
  };

  const getTotalStock = (variants = []) => {
    return variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-3">
            <span>All Products</span>
            <span className="text-xs bg-champagne/40 text-burgundy font-sans font-semibold px-2.5 py-0.5 rounded-full border border-champagne/60">
              {totalCount} Pieces
            </span>
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Manage all boutique pieces, size & colour inventory, status toggles, and direct editing.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-dark text-white px-4 py-2.5 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xs border border-champagne/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, tags..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
          />
          <FiSearch className="absolute left-3 top-2.5 text-charcoal/40 w-4 h-4" />
        </form>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-champagne/50 rounded-xs px-3 py-2 bg-white text-charcoal focus:outline-hidden focus:border-burgundy"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-champagne/50 rounded-xs px-3 py-2 bg-white text-charcoal focus:outline-hidden focus:border-burgundy"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal min-w-[760px]">
            <thead className="bg-ivory border-b border-champagne/40 text-[11px] uppercase font-bold tracking-wider text-charcoal/70">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price / MRP</th>
                <th className="py-3 px-3">Variants</th>
                <th className="py-3 px-3">Total Stock</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/20">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal/50">
                    Loading boutique catalogue...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-charcoal/50">
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const stock = getTotalStock(p.variants);
                  const isLow = stock > 0 && stock <= 10;
                  const isOut = stock === 0;

                  return (
                    <tr key={p._id} className="hover:bg-ivory/40 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              typeof p.images?.[0] === 'string'
                                ? p.images[0]
                                : (p.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80')
                            }
                            alt={p.name}
                            className="w-11 h-14 object-cover rounded-xs border border-champagne/40 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-charcoal block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-charcoal/50 font-mono">
                              SKU: {p.sku || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-charcoal/80 block">{p.category}</span>
                        <span className="text-[10px] text-charcoal/50">{p.subcategory || 'General'}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-burgundy">₹{p.price?.toLocaleString('en-IN')}</span>
                        {p.mrp && p.mrp > p.price && (
                          <span className="text-[10px] text-charcoal/40 line-through block">
                            ₹{p.mrp?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Variants */}
                      <td className="py-3 px-3">
                        <span className="bg-ivory px-2 py-0.5 rounded text-[11px] font-mono border border-champagne/40">
                          {p.variants?.length || 0} combos
                        </span>
                      </td>

                      {/* Total Stock */}
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
                          {isOut ? 'Out of Stock' : `${stock} Units`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded transition-colors ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : p.status === 'draft'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-charcoal/10 text-charcoal/60 hover:bg-charcoal/20'
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(p, 'newArrival')}
                            title="Toggle New Arrival"
                            className={`p-1 rounded text-xs transition-colors ${
                              p.newArrival ? 'bg-burgundy text-white' : 'text-charcoal/30 hover:text-burgundy'
                            }`}
                          >
                            New
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(p, 'bestseller')}
                            title="Toggle Bestseller"
                            className={`p-1 rounded text-xs transition-colors ${
                              p.bestseller ? 'bg-champagne text-charcoal font-bold' : 'text-charcoal/30 hover:text-champagne'
                            }`}
                          >
                            Best
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(p, 'featured')}
                            title="Toggle Featured"
                            className={`p-1 rounded text-xs transition-colors ${
                              p.featured ? 'bg-charcoal text-champagne' : 'text-charcoal/30 hover:text-charcoal'
                            }`}
                          >
                            <FiStar className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                            title="View in Store"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                            title="Edit Product"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p._id)}
                            className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                            title="Duplicate as Draft"
                          >
                            <FiCopy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete Permanently"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-ivory/50 border-t border-champagne/30 flex items-center justify-between text-xs text-charcoal/60">
          <span>
            Showing {products.length} of {totalCount} items
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
    </div>
  );
};

export default ProductManagement;
