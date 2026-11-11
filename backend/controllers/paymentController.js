import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import { deductStockForOrder } from '../services/inventoryService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.pricing.totalAmount * 100);

    const razorpayOrder = await createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: order.customerInfo.email,
      },
    });

    order.paymentDetails = {
      ...order.paymentDetails,
      razorpayOrderId: razorpayOrder.orderId,
    };
    order.paymentStatus = 'PENDING';
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.orderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderNumber: order.orderNumber,
        mode: razorpayOrder.mode,
      },
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature & Confirm Order
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'Incomplete payment verification payload.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      order.paymentStatus = 'FAILED';
      await order.save();

      await Payment.create({
        order: order._id,
        orderNumber: order.orderNumber,
        user: req.user._id,
        amount: order.pricing.totalAmount,
        currency: 'INR',
        method: 'ONLINE',
        status: 'FAILED',
        razorpayOrderId,
        razorpayPaymentId,
        errorReason: 'Cryptographic signature verification failed.',
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Successful payment
    order.paymentStatus = 'PAID';
    order.orderStatus = 'Confirmed';
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date(),
    };
    order.statusHistory.push({
      status: 'Confirmed',
      comment: `Payment received online via Razorpay (Payment ID: ${razorpayPaymentId}).`,
      updatedBy: 'System',
    });

    // Deduct stock safely on confirmed payment
    await deductStockForOrder(order.items, order.orderNumber, req.user.name);

    await order.save();

    // Create payment ledger record
    await Payment.create({
      order: order._id,
      orderNumber: order.orderNumber,
      user: req.user._id,
      amount: order.pricing.totalAmount,
      currency: 'INR',
      method: 'ONLINE',
      status: 'PAID',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: undefined });

    // Update coupon usage if applied
    if (order.pricing.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.pricing.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Send order confirmation email
    sendOrderConfirmationEmail(order).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status by Order ID
// @route   GET /api/payments/:orderId/status
// @access  Private
export const getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({
      success: true,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentDetails: order.paymentDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook handler for Razorpay async events
// @route   POST /api/payments/webhook
// @access  Public
export const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    // Log event in dev
    console.log(`[Razorpay Webhook Received]: ${event.event}`);
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all payments ledger for admin
// @route   GET /api/payments/admin/all
// @access  Private/Admin
export const getAdminPayments = async (req, res, next) => {
  try {
    const { status, method, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (method) query.method = method;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total, allPayments] = await Promise.all([
      Payment.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Payment.countDocuments(query),
      Payment.find().select('amount status method').lean(),
    ]);

    const totalRevenue = allPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingCOD = allPayments
      .filter((p) => p.method === 'COD' && p.status === 'PENDING')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      payments,
      stats: {
        totalRevenue,
        pendingCOD,
        totalTransactions: allPayments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
