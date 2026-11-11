import crypto from 'crypto';
import { getRazorpayInstance, isRazorpayConfigured } from '../config/razorpay.js';

export const createRazorpayOrder = async ({ amountInPaise, currency = 'INR', receipt, notes = {} }) => {
  if (isRazorpayConfigured()) {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: Math.round(amountInPaise),
      currency,
      receipt,
      notes,
    });
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      mode: 'live',
    };
  }

  // Demonstration / Test Mode fallback when no live keys are configured
  const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    orderId: mockOrderId,
    amount: Math.round(amountInPaise),
    currency,
    mode: 'simulation',
  };
};

export const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpayOrderId || !razorpayPaymentId) {
    return false;
  }

  // If in simulation mode
  if (razorpayOrderId.startsWith('order_sim_')) {
    return true;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};
