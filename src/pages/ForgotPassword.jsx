import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const { data } = await API.post('/auth/forgot-password', { email });
      if (data.success) {
        setSent(true);
        toast.success(data.message || 'Reset link dispatched.');
      }
    } catch (err) {
      toast.error(err.message || 'Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-16 flex items-center justify-center px-4">
      <div className="bg-white border border-champagne/40 rounded-sm p-8 sm:p-10 max-w-md w-full shadow-soft space-y-6">
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex flex-col items-center group">
            <img
              src="/logo.png"
              alt="Dulia Trendz Logo"
              className="w-14 h-14 object-contain rounded-full shadow-xs mb-2 group-hover:scale-105 transition-transform"
            />
            <span className="font-serif text-2xl font-bold tracking-wider text-burgundy">
              DULIA TRENDZ
            </span>
            <span className="text-[9.5px] uppercase tracking-[0.25em] text-[#78716c] font-medium mt-0.5">
              Your Style, Our Passion
            </span>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Reset Password</h2>
          <p className="text-xs text-charcoal/60">
            Enter your email and we will send instructions to securely recover your account.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-center space-y-3">
            <FiCheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-emerald-800">
              Reset instructions have been sent to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="inline-block text-burgundy font-bold underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Account Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-ivory border border-champagne px-3 py-2.5 pl-9 text-xs focus:ring-1 focus:ring-burgundy"
                />
                <FiMail className="absolute left-3 top-3 text-charcoal/40 w-4 h-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-3 text-xs font-semibold uppercase tracking-widest rounded-xs transition-colors shadow-elevated disabled:opacity-50"
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-champagne/40">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs text-charcoal/70 hover:text-burgundy font-semibold"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
