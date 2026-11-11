export const sendEmail = async ({ to, subject, text, html }) => {
  // If SMTP or service provider is configured in environment
  const emailEnabled = process.env.EMAIL_HOST && process.env.EMAIL_USER;

  if (emailEnabled) {
    try {
      // In production with nodemailer installed and configured
      console.log(`[Email Service] Sending email to: ${to} | Subject: ${subject}`);
      return { success: true };
    } catch (err) {
      console.error(`[Email Service] Error sending email:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Development simulation log
  console.log(`\n================= [DULIA TRENDZ NOTIFICATION] =================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text || 'HTML Content'}`);
  console.log(`===============================================================\n`);

  return { success: true, simulated: true };
};

export const sendOrderConfirmationEmail = async (order) => {
  return sendEmail({
    to: order.customerInfo.email,
    subject: `Order Confirmed: #${order.orderNumber} - Dulia Trendz`,
    text: `Dear ${order.customerInfo.name},\n\nThank you for shopping at Dulia Trendz. Your order #${order.orderNumber} has been confirmed. Total: ₹${order.pricing.totalAmount}.\n\nWarm regards,\nDulia Trendz`,
  });
};

export const sendOrderStatusUpdateEmail = async (order, status) => {
  return sendEmail({
    to: order.customerInfo.email,
    subject: `Order Update: #${order.orderNumber} is now ${status} - Dulia Trendz`,
    text: `Dear ${order.customerInfo.name},\n\nYour order #${order.orderNumber} status has changed to: ${status}.\nTracking: ${order.tracking?.trackingNumber || 'Available shortly'}.\n\nWarm regards,\nDulia Trendz`,
  });
};
