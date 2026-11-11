import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';

// ================= CUSTOMER ADDRESSES =================

export const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.status(200).json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, isDefault, addressType } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'Please provide all required address fields.' });
    }

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      isDefault: isDefault || user.addresses.length === 0,
      addressType: addressType || 'Home',
    });

    await user.save();
    res.status(201).json({ success: true, message: 'Address saved.', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();

    res.status(200).json({ success: true, message: 'Address updated.', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.id);
    await user.save();

    res.status(200).json({ success: true, message: 'Address removed.', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN CUSTOMER MANAGEMENT =================

export const getAdminCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    // Attach order summary for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ customer: u._id });
        const orders = await Order.find({ customer: u._id, paymentStatus: 'PAID' }).select('pricing.totalAmount');
        const totalSpent = orders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
        return {
          ...u,
          orderCount,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      customers: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN DASHBOARD ANALYTICS =================

export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      recentOrders,
      allProducts,
      paidPayments,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['Pending', 'Processing'] } }),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
      Product.find({ status: 'active' }).select('variants lowStockThreshold name sku').lean(),
      Payment.find({ status: 'PAID' }).select('amount createdAt').lean(),
    ]);

    // Calculate real paid revenue
    const paidRevenue = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Calculate low stock and out of stock counts from variants
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockItems = [];

    allProducts.forEach((prod) => {
      const threshold = prod.lowStockThreshold || 5;
      prod.variants.forEach((v) => {
        if (v.stock === 0) {
          outOfStockCount++;
          if (lowStockItems.length < 8) {
            lowStockItems.push({
              productName: prod.name,
              sku: v.sku,
              size: v.size,
              color: v.color,
              stock: 0,
              status: 'Out of Stock',
            });
          }
        } else if (v.stock <= threshold) {
          lowStockCount++;
          if (lowStockItems.length < 8) {
            lowStockItems.push({
              productName: prod.name,
              sku: v.sku,
              size: v.size,
              color: v.color,
              stock: v.stock,
              status: 'Low Stock',
            });
          }
        }
      });
    });

    // Recent 7 days revenue & orders chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      last7Days.push({ date: dateStr, orders: 0, revenue: 0 });
    }

    const pastOrders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).select('createdAt pricing paymentStatus');

    pastOrders.forEach((ord) => {
      const ordDate = ord.createdAt.toISOString().slice(0, 10);
      const match = last7Days.find((d) => d.date === ordDate);
      if (match) {
        match.orders += 1;
        if (ord.paymentStatus === 'PAID') {
          match.revenue += ord.pricing?.totalAmount || 0;
        }
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        paidRevenue,
        lowStockCount,
        outOfStockCount,
      },
      charts: {
        last7Days,
      },
      recentOrders,
      lowStockItems,
    });
  } catch (error) {
    next(error);
  }
};
