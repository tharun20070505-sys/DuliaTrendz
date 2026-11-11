import Product from '../models/Product.js';
import { uploadImageToService } from '../middleware/upload.js';

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      subcategory,
      collection,
      minPrice,
      maxPrice,
      size,
      color,
      fabric,
      occasion,
      inStock,
      sort = 'newest',
      status = 'active',
      featured,
      bestseller,
      newArrival,
    } = req.query;

    const query = {};

    // Filter by status (admin can pass any, default active)
    if (status) {
      query.status = status;
    }

    // Category / Subcategory
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (subcategory) {
      query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    }

    // Collection tag or filter
    if (collection) {
      query.collections = { $in: [collection.toLowerCase()] };
    }

    // Flags
    if (featured === 'true') query.featured = true;
    if (bestseller === 'true') query.bestseller = true;
    if (newArrival === 'true') query.newArrival = true;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Fabric & Occasion specifications
    if (fabric) {
      query['specifications.fabric'] = { $regex: new RegExp(fabric, 'i') };
    }
    if (occasion) {
      query['specifications.occasion'] = { $regex: new RegExp(occasion, 'i') };
    }

    // Variant filters (size / color)
    if (size || color || inStock === 'true') {
      const variantElemMatch = {};
      if (size) variantElemMatch.size = size.toUpperCase();
      if (color) variantElemMatch.color = { $regex: new RegExp(`^${color}$`, 'i') };
      if (inStock === 'true') variantElemMatch.stock = { $gt: 0 };
      query.variants = { $elemMatch: variantElemMatch };
    }

    // Global Search (name, category, subcategory, tags, sku)
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { sku: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { subcategory: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
      ];
    }

    // Sorting
    let sortObj = {};
    switch (sort) {
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'bestseller':
        sortObj = { bestseller: -1, totalSold: -1 };
        break;
      case 'featured':
        sortObj = { featured: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ slug: req.params.slug.toLowerCase() }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sorry, this product is currently unavailable.' });
    }

    // Find related products in same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
    })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/collections/new-arrivals
// @access  Public
export const getNewArrivals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bestsellers
// @route   GET /api/products/collections/bestsellers
// @access  Public
export const getBestsellers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await Product.find({
      status: 'active',
      $or: [{ bestseller: true }, { totalSold: { $gt: 0 } }],
    })
      .sort({ bestseller: -1, totalSold: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/collections/featured
// @access  Public
export const getFeatured = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await Product.find({ status: 'active', featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) {
      let baseSlug = slugify(data.name);
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = uniqueSlug;
    }

    if (!data.sku) {
      data.sku = `DT-${Date.now().toString().slice(-6)}`;
    }

    // Ensure variants have SKUs
    if (data.variants && Array.isArray(data.variants)) {
      data.variants = data.variants.map((v, idx) => ({
        ...v,
        sku: v.sku || `${data.sku}-${(v.color || 'CLR').substring(0, 3).toUpperCase()}-${v.size || idx}`,
      }));
    }

    // Normalize images (strings to objects with url & isPrimary)
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images
        .filter(Boolean)
        .map((img, idx) => {
          if (typeof img === 'string') {
            return {
              url: img,
              isPrimary: idx === 0,
              alt: data.name || 'Dulia Trendz Fashion',
            };
          }
          return {
            ...img,
            url: img.url || '',
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
            alt: img.alt || data.name || 'Dulia Trendz Fashion',
          };
        });
    }

    const product = await Product.create(data);
    res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updateData = { ...req.body };
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images
        .filter(Boolean)
        .map((img, idx) => {
          if (typeof img === 'string') {
            return {
              url: img,
              isPrimary: idx === 0,
              alt: updateData.name || product.name || 'Dulia Trendz Fashion',
            };
          }
          return img;
        });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Product updated successfully.', product: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate a product (Admin)
// @route   POST /api/products/:id/duplicate
// @access  Private/Admin
export const duplicateProduct = async (req, res, next) => {
  try {
    const original = await Product.findById(req.params.id).lean();
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original product not found.' });
    }

    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;

    original.name = `${original.name} (Copy)`;
    original.slug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    original.sku = `DT-${Date.now().toString().slice(-6)}`;
    original.status = 'draft';

    if (original.variants) {
      original.variants = original.variants.map((v) => ({
        ...v,
        _id: undefined,
        sku: `${original.sku}-${(v.color || 'CLR').substring(0, 3).toUpperCase()}-${v.size}`,
      }));
    }

    const duplicate = await Product.create(original);
    res.status(201).json({ success: true, message: 'Product duplicated successfully.', product: duplicate });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product images (Admin)
// @route   POST /api/products/upload-images
// @access  Private/Admin
export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files uploaded.' });
    }

    const uploadPromises = req.files.map((file) =>
      uploadImageToService(file.buffer, file.originalname, 'dulia-trenz/products')
    );

    const uploadedImages = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully.',
      images: uploadedImages.map((img, idx) => ({
        url: img.url,
        public_id: img.public_id,
        isPrimary: idx === 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};
