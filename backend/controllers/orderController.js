import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import StoreSettings from '../models/StoreSettings.js';
import Payment from '../models/Payment.js';
import ReturnRequest from '../models/ReturnRequest.js';
import { validateCartStock, deductStockForOrder, restoreStockForOrder } from '../services/inventoryService.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../services/emailService.js';

// Helper to generate unique order number: DT-YYYYMMDD-XXXX
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DT-${dateStr}-${rand}`;
};

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod, // 'ONLINE' or 'COD'
      couponCode,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete delivery address is required.' });
    }

    if (!['ONLINE', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Valid payment method (ONLINE or COD) is required.' });
    }

    // 1. Double-validate stock on backend
    const stockCheck = await validateCartStock(items);
    if (!stockCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: stockCheck.issues.join(' '),
        issues: stockCheck.issues,
      });
    }

    const validatedItems = stockCheck.validatedItems;

    // 2. Calculate subtotal from validated item prices
    const subtotal = validatedItems.reduce((acc, item) => acc + item.subtotal, 0);

    // 3. Fetch store settings for shipping & COD rules
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }

    // COD eligibility check
    let codFee = 0;
    if (paymentMethod === 'COD') {
      if (!settings.cod.enabled) {
        return res.status(400).json({ success: false, message: 'Cash on Delivery is currently disabled.' });
      }
      if (subtotal < settings.cod.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount for COD is ₹${settings.cod.minOrderAmount}.`,
        });
      }
      if (subtotal > settings.cod.maxOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Maximum order amount for COD is ₹${settings.cod.maxOrderAmount}. Please choose Online Payment.`,
        });
      }
      codFee = settings.cod.codFee || 0;
    }

    // 4. Validate and apply coupon if provided
    let couponDiscount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        active: true,
        expiryDate: { $gt: new Date() },
      });

      if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
        if (appliedCoupon.discountType === 'PERCENTAGE') {
          couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maxDiscountAmount) {
            couponDiscount = Math.min(couponDiscount, appliedCoupon.maxDiscountAmount);
          }
        } else {
          couponDiscount = appliedCoupon.discountValue;
        }
        couponDiscount = Math.min(couponDiscount, subtotal);
      }
    }

    // 5. Calculate shipping fee
    let shippingFee = 0;
    if (subtotal < (settings.shipping.freeShippingThreshold || 999)) {
      shippingFee = settings.shipping.standardShippingFee || 99;
    }

    // 6. Calculate total amount
    const totalAmount = Math.max(0, subtotal - couponDiscount + shippingFee + codFee);

    // 7. Create Order document
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      customerInfo: {
        name: shippingAddress.fullName || req.user.name,
        email: req.user.email,
        phone: shippingAddress.phone || req.user.phone || '',
      },
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'CREATED',
      orderStatus: paymentMethod === 'COD' ? 'Confirmed' : 'Pending',
      statusHistory: [
        {
          status: paymentMethod === 'COD' ? 'Confirmed' : 'Pending',
          comment: paymentMethod === 'COD' ? 'Order placed with Cash on Delivery.' : 'Order initiated, awaiting online payment confirmation.',
          updatedBy: 'Customer',
        },
      ],
      pricing: {
        subtotal,
        discount: 0,
        couponCode: appliedCoupon?.code,
        couponDiscount,
        shippingFee,
        codFee,
        tax: 0,
        totalAmount,
      },
    });

    // 8. If COD, deduct inventory immediately and record initial payment
    if (paymentMethod === 'COD') {
      await deductStockForOrder(validatedItems, orderNumber, req.user.name);

      await Payment.create({
        order: order._id,
        orderNumber: order.orderNumber,
        user: req.user._id,
        amount: totalAmount,
        currency: 'INR',
        method: 'COD',
        status: 'PENDING',
      });

      if (appliedCoupon) {
        appliedCoupon.usedCount = (appliedCoupon.usedCount || 0) + 1;
        await appliedCoupon.save();
      }

      // Clear customer's cart
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: undefined });

      // Send confirmation email
      sendOrderConfirmationEmail(order).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: paymentMethod === 'COD' ? 'Order placed successfully!' : 'Order created, proceed to payment.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const query = req.params.id.startsWith('DT-')
      ? { orderNumber: req.params.id }
      : { _id: req.params.id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Authorization check: allow owner or admin
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Track order publicly by order number or ID
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const getOrderTrackingInfo = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const trimmed = orderNumber.trim();
    const query = trimmed.startsWith('DT-')
      ? { orderNumber: trimmed }
      : { $or: [{ orderNumber: trimmed }, { _id: trimmed.length === 24 ? trimmed : null }].filter((c) => Object.values(c)[0] !== null) };

    const order = await Order.findOne(query).select(
      'orderNumber orderStatus paymentStatus paymentMethod items shippingAddress pricing statusHistory createdAt estimatedDelivery trackingNumber courierName'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with that order number.' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer)
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by customer' } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus}.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancellation = {
      reason,
      cancelledAt: new Date(),
      cancelledBy: req.user.name || 'Customer',
    };

    order.statusHistory.push({
      status: 'Cancelled',
      comment: reason,
      updatedBy: req.user.name || 'Customer',
    });

    // Restore stock if inventory was already deducted (e.g. COD or Paid)
    if (order.paymentMethod === 'COD' || order.paymentStatus === 'PAID') {
      await restoreStockForOrder(order.items, order.orderNumber, 'ORDER_CANCELLED', req.user.name);
    }

    await order.save();

    res.status(200).json({ success: true, message: 'Order has been cancelled.', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Request return (Customer)
// @route   POST /api/orders/:id/return
// @access  Private
export const requestReturn = async (req, res, next) => {
  try {
    const { reason, description, items, images } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested for orders that have been Delivered.',
      });
    }

    const returnRequest = await ReturnRequest.create({
      order: order._id,
      orderNumber: order.orderNumber,
      user: req.user._id,
      items: items || order.items,
      reason,
      description,
      images: images || [],
      status: 'Requested',
    });

    order.orderStatus = 'Return Requested';
    order.returnDetails = {
      requestedAt: new Date(),
      reason,
      status: 'Requested',
    };
    order.statusHistory.push({
      status: 'Return Requested',
      comment: `Return requested: ${reason}`,
      updatedBy: req.user.name,
    });
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Our team will review it shortly.',
      returnRequest,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN CONTROLLERS =================

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, comment, courierName, trackingNumber, trackingUrl, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (status) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        comment: comment || `Status updated to ${status}`,
        updatedBy: req.user.name || 'Admin',
      });

      if (status === 'Shipped') {
        order.tracking.shippedAt = new Date();
      } else if (status === 'Delivered') {
        order.tracking.deliveredAt = new Date();
        if (order.paymentMethod === 'COD') {
          order.paymentStatus = 'PAID';
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (courierName || trackingNumber) {
      order.tracking.courierName = courierName || order.tracking.courierName;
      order.tracking.trackingNumber = trackingNumber || order.tracking.trackingNumber;
      order.tracking.trackingUrl = trackingUrl || order.tracking.trackingUrl;
    }

    await order.save();

    // Send email update
    sendOrderStatusUpdateEmail(order, status).catch(console.error);

    res.status(200).json({ success: true, message: 'Order updated successfully.', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update return request status (Admin)
// @route   PATCH /api/admin/orders/:id/return-status
// @access  Private/Admin
export const updateReturnStatus = async (req, res, next) => {
  try {
    const { returnStatus, adminNotes, pickupDate, refundAmount } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.returnDetails.status = returnStatus;
    order.returnDetails.adminNotes = adminNotes;
    if (pickupDate) order.returnDetails.pickupDate = pickupDate;
    if (refundAmount) order.returnDetails.refundAmount = refundAmount;

    if (returnStatus === 'Received' || returnStatus === 'Refunded') {
      order.orderStatus = returnStatus === 'Refunded' ? 'Refunded' : 'Returned';
      // Restore inventory
      await restoreStockForOrder(order.items, order.orderNumber, 'RETURN', req.user.name);
    }

    order.statusHistory.push({
      status: `Return: ${returnStatus}`,
      comment: adminNotes || `Return status updated to ${returnStatus}`,
      updatedBy: req.user.name || 'Admin',
    });

    await order.save();

    res.status(200).json({ success: true, message: 'Return status updated.', order });
  } catch (error) {
    next(error);
  }
};
