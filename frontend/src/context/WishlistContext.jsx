import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('dulia_guest_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        try {
          const { data } = await API.get('/wishlist');
          if (data.success && data.wishlist) {
            setWishlist(data.wishlist);
          }
        } catch (err) {
          console.warn('Wishlist fetch error:', err.message);
        }
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('dulia_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const addToWishlist = async (product) => {
    const exists = wishlist.some((item) => (item._id || item) === (product._id || product));
    if (exists) {
      return removeFromWishlist(product._id || product);
    }

    if (isAuthenticated) {
      try {
        const { data } = await API.post('/wishlist', { productId: product._id || product });
        if (data.success) {
          setWishlist(data.wishlist);
          toast.success('Added to your wishlist.');
        }
      } catch (err) {
        toast.error(err.message || 'Could not add to wishlist.');
      }
    } else {
      setWishlist([...wishlist, product]);
      toast.success('Added to your wishlist.');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        const { data } = await API.delete(`/wishlist/${productId}`);
        if (data.success) {
          setWishlist(data.wishlist);
          toast.success('Removed from wishlist.');
        }
      } catch (err) {
        toast.error(err.message || 'Could not remove from wishlist.');
      }
    } else {
      setWishlist(wishlist.filter((item) => (item._id || item) !== productId));
      toast.success('Removed from wishlist.');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
