import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

// Helper to calculate cart totals
const populateCartDetails = async (cart) => {
  let subtotal = 0;
  const items = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || product.status !== 'active') continue;

    const variant = product.variants.find((v) => v.sku === item.variantSku);
    if (!variant || !variant.active) continue;

    const currentPrice = variant.price || product.price;
    const itemSubtotal = currentPrice * item.quantity;
    subtotal += itemSubtotal;

    items.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        image: product.images?.[0]?.url || '',
        mrp: product.mrp,
      },
      variantSku: variant.sku,
      size: variant.size,
      color: variant.color,
      colorCode: variant.colorCode,
      stock: variant.stock,
      quantity: Math.min(item.quantity, variant.stock > 0 ? variant.stock : item.quantity),
      price: currentPrice,
      mrp: product.mrp,
      subtotal: itemSubtotal,
    });
  }

  let discountAmount = 0;
  if (cart.coupon && cart.coupon.code) {
    if (cart.coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * cart.coupon.discountValue) / 100);
    } else {
      discountAmount = cart.coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  return {
    _id: cart._id,
    items,
    coupon: cart.coupon,
    subtotal,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount),
  };
};

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, cart: cartData });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, variantSku, size, color, quantity = 1 } = req.body;

    if (!productId || !variantSku || !size) {
      return res.status(400).json({ success: false, message: 'Product and size variant are required.' });
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant || !variant.active) {
      return res.status(400).json({ success: false, message: 'Selected size variant is not available.' });
    }

    if (variant.stock <= 0) {
      return res.status(400).json({ success: false, message: 'This size is currently out of stock.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex((item) => item.variantSku === variantSku);

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock} units available in stock for size ${variant.size}.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = variant.price || product.price;
    } else {
      if (Number(quantity) > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock} units available in stock for size ${variant.size}.`,
        });
      }
      cart.items.push({
        product: product._id,
        variantSku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: Number(quantity),
        price: variant.price || product.price,
        mrp: product.mrp,
        name: product.name,
        image: product.images?.[0]?.url || '',
      });
    }

    await cart.save();
    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, message: 'Added to shopping bag.', cart: cartData });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params; // cart item _id or variantSku
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.find((i) => i._id.toString() === id || i.variantSku === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    // Check stock
    const product = await Product.findById(item.product);
    const variant = product?.variants.find((v) => v.sku === item.variantSku);

    if (variant && Number(quantity) > variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock} units available in stock.`,
      });
    }

    item.quantity = Number(quantity);
    await cart.save();

    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, message: 'Bag updated.', cart: cartData });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter((i) => i._id.toString() !== id && i.variantSku !== id);
    await cart.save();

    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, message: 'Item removed from bag.', cart: cartData });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.coupon = undefined;
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      active: true,
      expiryDate: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your bag is empty.' });
    }

    const currentDetails = await populateCartDetails(cart);
    if (currentDetails.subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum bag value of ₹${coupon.minOrderAmount}.`,
      });
    }

    cart.coupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    };

    await cart.save();
    const updatedDetails = await populateCartDetails(cart);

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      cart: updatedDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.coupon = undefined;
      await cart.save();
    }
    const updatedDetails = await populateCartDetails(cart);
    res.status(200).json({ success: true, message: 'Coupon removed.', cart: updatedDetails });
  } catch (error) {
    next(error);
  }
};

// Merge guest cart from frontend localStorage into logged-in user cart
export const mergeGuestCart = async (req, res, next) => {
  try {
    const { guestItems = [] } = req.body;
    if (!guestItems || !guestItems.length) {
      return getCart(req, res, next);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const gItem of guestItems) {
      const product = await Product.findById(gItem.productId || gItem.product?._id);
      if (!product || product.status !== 'active') continue;

      const variant = product.variants.find((v) => v.sku === gItem.variantSku);
      if (!variant || !variant.active || variant.stock <= 0) continue;

      const existingIndex = cart.items.findIndex((i) => i.variantSku === variant.sku);
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          cart.items[existingIndex].quantity + (gItem.quantity || 1),
          variant.stock
        );
      } else {
        cart.items.push({
          product: product._id,
          variantSku: variant.sku,
          size: variant.size,
          color: variant.color,
          quantity: Math.min(gItem.quantity || 1, variant.stock),
          price: variant.price || product.price,
          mrp: product.mrp,
          name: product.name,
          image: product.images?.[0]?.url || '',
        });
      }
    }

    await cart.save();
    const cartData = await populateCartDetails(cart);
    res.status(200).json({ success: true, message: 'Cart synced.', cart: cartData });
  } catch (error) {
    next(error);
  }
};
