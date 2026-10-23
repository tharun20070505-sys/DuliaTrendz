import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('dulia_guest_cart');
      return saved ? JSON.parse(saved) : { items: [], coupon: null, subtotal: 0, total: 0 };
    } catch {
      return { items: [], coupon: null, subtotal: 0, total: 0 };
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync cart from backend when logged in
  const fetchBackendCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.warn('Error fetching cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // When user logs in, merge guest cart into backend cart
  useEffect(() => {
    const handleLoginSync = async () => {
      if (isAuthenticated) {
        const localGuestCart = localStorage.getItem('dulia_guest_cart');
        if (localGuestCart) {
          try {
            const parsed = JSON.parse(localGuestCart);
            if (parsed.items && parsed.items.length > 0) {
              await API.post('/cart/merge', { guestItems: parsed.items });
              localStorage.removeItem('dulia_guest_cart');
            }
          } catch (e) {
            console.error('Guest cart merge error:', e);
          }
        }
        fetchBackendCart();
      }
    };

    handleLoginSync();
  }, [isAuthenticated, fetchBackendCart]);

  // Save guest cart in localStorage when unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('dulia_guest_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product, variant, size, color, quantity = 1) => {
    if (!size) {
      toast.error('Please select a size first.');
      return false;
    }

    if (!variant || variant.stock <= 0) {
      toast.error('This size is currently out of stock.');
      return false;
    }

    if (isAuthenticated) {
      try {
        const { data } = await API.post('/cart/items', {
          productId: product._id,
          variantSku: variant.sku,
          size,
          color,
          quantity,
        });
        if (data.success) {
          setCart(data.cart);
          toast.success(`Added ${product.name} (${size}) to your bag.`);
          return true;
        }
      } catch (err) {
        toast.error(err.message || 'Could not add to bag.');
        return false;
      }
    } else {
      // Guest cart local state
      const currentItems = [...(cart.items || [])];
      const existingIdx = currentItems.findIndex((i) => i.variantSku === variant.sku);
      const currentPrice = variant.price || product.price;

      if (existingIdx > -1) {
        const newQty = currentItems[existingIdx].quantity + quantity;
        if (newQty > variant.stock) {
          toast.error(`Only ${variant.stock} units available in stock.`);
          return false;
        }
        currentItems[existingIdx].quantity = newQty;
        currentItems[existingIdx].subtotal = newQty * currentPrice;
      } else {
        if (quantity > variant.stock) {
          toast.error(`Only ${variant.stock} units available in stock.`);
          return false;
        }
        currentItems.push({
          _id: `guest_${Date.now()}_${Math.random()}`,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            category: product.category,
            image: product.images?.[0]?.url || '',
            mrp: product.mrp,
          },
          variantSku: variant.sku,
          size,
          color,
          colorCode: variant.colorCode,
          stock: variant.stock,
          quantity,
          price: currentPrice,
          mrp: product.mrp,
          subtotal: quantity * currentPrice,
        });
      }

      const subtotal = currentItems.reduce((acc, i) => acc + i.subtotal, 0);
      setCart({
        ...cart,
        items: currentItems,
        subtotal,
        total: subtotal,
      });

      toast.success(`Added ${product.name} (${size}) to your bag.`);
      return true;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        const { data } = await API.patch(`/cart/items/${itemId}`, { quantity });
        if (data.success) {
          setCart(data.cart);
        }
      } catch (err) {
        toast.error(err.message || 'Could not update quantity.');
      }
    } else {
      const currentItems = cart.items.map((item) => {
        if (item._id === itemId || item.variantSku === itemId) {
          if (quantity > item.stock) {
            toast.error(`Only ${item.stock} units available in stock.`);
            return item;
          }
          return {
            ...item,
            quantity,
            subtotal: quantity * item.price,
          };
        }
        return item;
      });

      const subtotal = currentItems.reduce((acc, i) => acc + i.subtotal, 0);
      setCart({
        ...cart,
        items: currentItems,
        subtotal,
        total: subtotal,
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        const { data } = await API.delete(`/cart/items/${itemId}`);
        if (data.success) {
          setCart(data.cart);
          toast.success('Item removed from bag.');
        }
      } catch (err) {
        toast.error(err.message || 'Could not remove item.');
      }
    } else {
      const currentItems = cart.items.filter((item) => item._id !== itemId && item.variantSku !== itemId);
      const subtotal = currentItems.reduce((acc, i) => acc + i.subtotal, 0);
      setCart({
        ...cart,
        items: currentItems,
        subtotal,
        total: subtotal,
      });
      toast.success('Item removed from bag.');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await API.delete('/cart/clear');
      } catch (e) {
        console.error(e);
      }
    }
    setCart({ items: [], coupon: null, subtotal: 0, total: 0 });
    localStorage.removeItem('dulia_guest_cart');
  };

  const applyCoupon = async (code) => {
    if (isAuthenticated) {
      try {
        const { data } = await API.post('/cart/coupon', { code });
        if (data.success) {
          setCart(data.cart);
          toast.success(data.message || 'Coupon applied!');
          return true;
        }
      } catch (err) {
        toast.error(err.message || 'Invalid coupon.');
        return false;
      }
    } else {
      // Local coupon validation
      try {
        const { data } = await API.post('/coupons/validate', { code, cartAmount: cart.subtotal });
        if (data.success && data.coupon) {
          const discountAmount = data.coupon.discountAmount;
          setCart({
            ...cart,
            coupon: data.coupon,
            discountAmount,
            total: Math.max(0, cart.subtotal - discountAmount),
          });
          toast.success(data.message || 'Coupon applied!');
          return true;
        }
      } catch (err) {
        toast.error(err.message || 'Invalid coupon.');
        return false;
      }
    }
  };

  const removeCoupon = async () => {
    if (isAuthenticated) {
      try {
        const { data } = await API.delete('/cart/coupon');
        if (data.success) {
          setCart(data.cart);
          toast.success('Coupon removed.');
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart({
        ...cart,
        coupon: null,
        discountAmount: 0,
        total: cart.subtotal,
      });
      toast.success('Coupon removed.');
    }
  };

  const cartCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const subtotal = cart.subtotal || 0;
  const discountAmount = cart.discountAmount || 0;
  const total = cart.total !== undefined ? cart.total : Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart.items || [],
        cartCount,
        subtotal,
        discountAmount,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
