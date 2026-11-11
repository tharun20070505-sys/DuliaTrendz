import Product from '../models/Product.js';
import InventoryMovement from '../models/InventoryMovement.js';

// @desc    Get all inventory by size-color variants
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventory = async (req, res, next) => {
  try {
    const { search, status, lowStockOnly, page = 1, limit = 50 } = req.query;

    const query = { status: { $ne: 'archived' } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { 'variants.sku': { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).lean();
    let variantRows = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        let stockStatus = 'In Stock';
        if (variant.stock <= 0) {
          stockStatus = 'Out of Stock';
        } else if (variant.stock <= (product.lowStockThreshold || 5)) {
          stockStatus = 'Low Stock';
        }

        if (lowStockOnly === 'true' && stockStatus === 'In Stock') {
          return;
        }

        if (status && stockStatus.toLowerCase() !== status.toLowerCase()) {
          return;
        }

        variantRows.push({
          productId: product._id,
          productName: product.name,
          productSku: product.sku,
          productImage: product.images?.[0]?.url || '',
          variantId: variant._id,
          variantSku: variant.sku,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          price: variant.price || product.price,
          lowStockThreshold: product.lowStockThreshold || 5,
          status: stockStatus,
          active: variant.active,
        });
      });
    });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const totalVariants = variantRows.length;
    const paginatedVariants = variantRows.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      total: totalVariants,
      count: paginatedVariants.length,
      pages: Math.ceil(totalVariants / limitNum),
      currentPage: pageNum,
      inventory: paginatedVariants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock variants
// @route   GET /api/inventory/low-stock
// @access  Private/Admin
export const getLowStock = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' }).lean();
    const lowStockItems = [];

    products.forEach((product) => {
      const threshold = product.lowStockThreshold || 5;
      product.variants.forEach((variant) => {
        if (variant.stock <= threshold) {
          lowStockItems.push({
            productId: product._id,
            productName: product.name,
            variantSku: variant.sku,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            threshold,
            status: variant.stock === 0 ? 'Out of Stock' : 'Low Stock',
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      lowStock: lowStockItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single variant stock & log movement
// @route   PATCH /api/inventory/variants/:variantSku
// @access  Private/Admin
export const updateVariantStock = async (req, res, next) => {
  try {
    const { variantSku } = req.params;
    const { newStock, change, reason = 'ADJUSTMENT', note } = req.body;

    const product = await Product.findOne({ 'variants.sku': variantSku });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Variant SKU not found.' });
    }

    const variantIndex = product.variants.findIndex((v) => v.sku === variantSku);
    const variant = product.variants[variantIndex];
    const previousStock = variant.stock;

    let targetStock;
    let actualChange;

    if (newStock !== undefined) {
      targetStock = Math.max(0, Number(newStock));
      actualChange = targetStock - previousStock;
    } else if (change !== undefined) {
      actualChange = Number(change);
      targetStock = Math.max(0, previousStock + actualChange);
    } else {
      return res.status(400).json({ success: false, message: 'Please provide either newStock or change.' });
    }

    product.variants[variantIndex].stock = targetStock;
    await product.save();

    const movement = await InventoryMovement.create({
      product: product._id,
      productName: product.name,
      variantSku: variant.sku,
      size: variant.size,
      color: variant.color,
      previousStock,
      change: actualChange,
      newStock: targetStock,
      reason,
      referenceId: note || 'Manual Admin Update',
      adminUser: req.user.name || 'Admin',
    });

    res.status(200).json({
      success: true,
      message: `Stock updated for ${variant.sku} from ${previousStock} to ${targetStock}.`,
      variant: product.variants[variantIndex],
      movement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory movement history
// @route   GET /api/inventory/movements
// @access  Private/Admin
export const getMovements = async (req, res, next) => {
  try {
    const { sku, page = 1, limit = 50 } = req.query;
    const query = {};
    if (sku) query.variantSku = sku;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [movements, total] = await Promise.all([
      InventoryMovement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      InventoryMovement.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: movements.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      movements,
    });
  } catch (error) {
    next(error);
  }
};
