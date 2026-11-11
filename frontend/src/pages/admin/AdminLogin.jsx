import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiMail, FiShield, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import GoogleAuthButton from '../../components/common/GoogleAuthButton';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@duliatrendz.com');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminGoogleSuccess = (authUser) => {
    if (authUser?.role === 'admin' || authUser?.role === 'staff') {
      navigate('/admin');
    } else {
      toast.error('This Google account is registered as a customer and does not have staff/admin privileges.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res?.success) {
      if (res.user?.role === 'admin' || res.user?.role === 'staff') {
        navigate('/admin');
      } else {
        toast.error('Access denied: Customer account does not have Admin or Staff privileges.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <div className="bg-charcoal-light border border-champagne/30 rounded-sm p-5 sm:p-10 max-w-md w-full shadow-2xl space-y-6 text-white">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Dulia Trendz Logo"
            className="w-16 h-16 object-contain rounded-full mx-auto shadow-md border border-champagne/40"
          />
          <span className="font-serif text-2xl font-bold tracking-wider text-champagne block">
            DULIA TRENDZ
          </span>
          <h2 className="font-serif text-xl font-bold text-white">Admin Management Portal</h2>
          <p className="text-xs text-ivory/60">Restricted staff authentication. Normal customers are prohibited.</p>
        </div>

        {/* Google Admin Sign In */}
        <div className="space-y-4">
          <GoogleAuthButton
            text="Sign in with Admin Google"
            onSuccess={handleAdminGoogleSuccess}
            className="bg-charcoal border-champagne/40 text-ivory hover:bg-charcoal/80 hover:text-champagne"
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-champagne/30 w-full" />
            <span className="bg-charcoal-light px-3 text-[10px] uppercase tracking-wider text-ivory/50 font-semibold absolute">
              or enter admin credentials
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-ivory block mb-1">Admin Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-charcoal border border-champagne/40 text-white px-3 py-2.5 pl-9 text-xs focus:ring-1 focus:ring-champagne"
              />
              <FiMail className="absolute left-3 top-3 text-ivory/40 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="font-semibold text-ivory block mb-1">Master Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-charcoal border border-champagne/40 text-white px-3 py-2.5 pl-9 text-xs focus:ring-1 focus:ring-champagne"
              />
              <FiLock className="absolute left-3 top-3 text-ivory/40 w-4 h-4" />
            </div>
          </div>

          <div className="bg-charcoal/80 border border-champagne/20 p-3 rounded-xs text-[11px] text-ivory/70 space-y-1">
            <span className="font-bold text-champagne block">Pre-configured Admin Credentials:</span>
            <p>Email: <code className="text-white font-mono">admin@duliatrendz.com</code></p>
            <p>Password: <code className="text-white font-mono">Admin@12345</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-3 text-xs font-semibold uppercase tracking-widest rounded-xs transition-colors shadow-elevated flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Dashboard'}</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
