import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiCheck } from 'react-icons/fi';

const MyProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name, email, phone });
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    try {
      setSavingPassword(true);
      const { data } = await API.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (data.success) {
        toast.success('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-[0.25em] text-burgundy font-bold block mb-1">
            Account Preferences
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            My Profile
          </h1>
          <div className="w-16 h-0.5 bg-champagne-dark mx-auto mt-3" />
        </div>

        {/* Profile Details Form */}
        <div className="bg-white border border-champagne/40 rounded-sm p-6 sm:p-8 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-charcoal pb-3 border-b border-champagne/30 flex items-center space-x-2">
            <FiUser className="w-4 h-4 text-burgundy" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-charcoal block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold uppercase px-6 py-2.5 tracking-wider rounded-xs transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-champagne/40 rounded-sm p-6 sm:p-8 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-charcoal pb-3 border-b border-champagne/30 flex items-center space-x-2">
            <FiLock className="w-4 h-4 text-burgundy" />
            <span>Update Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-charcoal block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-ivory border border-champagne px-3 py-2 text-xs focus:ring-1 focus:ring-burgundy"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="bg-charcoal hover:bg-black text-white text-xs font-semibold uppercase px-6 py-2.5 tracking-wider rounded-xs transition-colors disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
