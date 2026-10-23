import React, { useState, useEffect } from 'react';
import {
  FiStar,
  FiCheckCircle,
  FiEyeOff,
  FiTrash2,
  FiCheck,
  FiMessageSquare,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReviewsAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/admin/all');
      setReviews(res.data.reviews || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleStatus = async (review) => {
    const newStatus = review.status === 'approved' ? 'hidden' : 'approved';
    try {
      await api.patch(`/reviews/admin/${review._id}`, { status: newStatus });
      toast.success(`Review ${newStatus === 'approved' ? 'approved & published' : 'hidden from boutique'}`);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update review status');
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      await api.delete(`/reviews/admin/${review._id}`);
      toast.success('Review permanently removed');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = filterStatus
    ? reviews.filter((r) => r.status === filterStatus)
    : reviews;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Customer Reviews Moderation</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Moderate genuine customer feedback, verified purchase badges, and store testimonials.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-champagne/50 rounded-xs px-3 py-2 bg-white text-charcoal focus:outline-hidden focus:border-burgundy"
          >
            <option value="">All Feedback ({reviews.length})</option>
            <option value="approved">Approved & Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Grid of Reviews */}
      {loading ? (
        <div className="py-20 text-center text-charcoal/50 text-xs">
          Loading patron reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-12 text-center text-charcoal/50 text-xs rounded-xs border border-champagne/40">
          No customer reviews found matching filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className={`bg-white p-5 rounded-xs border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                rev.status === 'hidden'
                  ? 'border-red-200 bg-red-50/20 opacity-80'
                  : 'border-champagne/40'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Stars */}
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? 'fill-current' : 'text-charcoal/20'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-serif font-bold text-charcoal text-sm">
                    {rev.title || 'Customer Review'}
                  </span>

                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs">
                      <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Verified Purchase</span>
                    </span>
                  )}

                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <p className="text-xs text-charcoal/80 leading-relaxed">{rev.comment}</p>

                <div className="flex items-center space-x-4 text-[11px] text-charcoal/50 pt-1">
                  <span>
                    By <strong className="text-charcoal">{rev.userName || 'Boutique Patron'}</strong>
                  </span>
                  <span>•</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {rev.product && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-burgundy">
                        Product: {rev.product.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0 border-t md:border-t-0 md:border-l border-champagne/30 pt-3 md:pt-0 md:pl-4">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(rev)}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors ${
                    rev.status === 'approved'
                      ? 'bg-ivory text-charcoal/70 hover:text-red-700 hover:bg-red-50 border border-champagne/50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {rev.status === 'approved' ? (
                    <>
                      <FiEyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(rev)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Delete permanently"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsAdmin;
