import Product from '../models/Product.js';
import InventoryMovement from '../models/InventoryMovement.js';

export const validateCartStock = async (cartItems) => {
  const issues = [];
  const validatedItems = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product || product.status !== 'active') {
      issues.push(`Product "${item.name || 'Unknown'}" is not available.`);
      continue;
    }

    const variant = product.variants.find(
      (v) => v.sku === item.variantSku || (v.size === item.size && v.color === item.color)
    );

    if (!variant || !variant.active) {
      issues.push(`Selected variant (${item.size} / ${item.color}) for "${product.name}" is no longer available.`);
      continue;
    }

    if (variant.stock < item.quantity) {
      issues.push(
        `Insufficient stock for "${product.name}" (${item.size}, ${item.color}). Requested: ${item.quantity}, Available: ${variant.stock}.`
      );
      continue;
    }

    validatedItems.push({
      product: product._id,
      productName: product.name,
      productImage: (product.images && product.images.length > 0) ? product.images[0].url : '',
      variantSku: variant.sku,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      price: variant.price || product.price,
      mrp: product.mrp,
      subtotal: (variant.price || product.price) * item.quantity,
    });
  }

  return {
    isValid: issues.length === 0,
    issues,
    validatedItems,
  };
};

export const deductStockForOrder = async (orderItems, orderNumber, userIdentifier = 'Customer') => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const variantIndex = product.variants.findIndex((v) => v.sku === item.variantSku);
    if (variantIndex === -1) continue;

    const previousStock = product.variants[variantIndex].stock;
    const requestedQty = Number(item.quantity);
    const newStock = Math.max(0, previousStock - requestedQty);

    product.variants[variantIndex].stock = newStock;
    product.totalSold = (product.totalSold || 0) + requestedQty;
    await product.save();

    await InventoryMovement.create({
      product: product._id,
      productName: product.name,
      variantSku: item.variantSku,
      size: item.size,
      color: item.color,
      previousStock,
      change: -requestedQty,
      newStock,
      reason: 'ORDER_PLACED',
      referenceId: orderNumber,
      adminUser: userIdentifier,
    });
  }
};

export const restoreStockForOrder = async (orderItems, orderNumber, reason = 'ORDER_CANCELLED', adminUser = 'System') => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const variantIndex = product.variants.findIndex((v) => v.sku === item.variantSku);
    if (variantIndex === -1) continue;

    const previousStock = product.variants[variantIndex].stock;
    const returnQty = Number(item.quantity);
    const newStock = previousStock + returnQty;

    product.variants[variantIndex].stock = newStock;
    if (product.totalSold && product.totalSold >= returnQty) {
      product.totalSold -= returnQty;
    }
    await product.save();

    await InventoryMovement.create({
      product: product._id,
      productName: product.name,
      variantSku: item.variantSku,
      size: item.size,
      color: item.color,
      previousStock,
      change: returnQty,
      newStock,
      reason,
      referenceId: orderNumber,
      adminUser,
    });
  }
};
