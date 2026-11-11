import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Helper to recalculate product ratings
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, status: 'approved' });
  const count = reviews.length;
  const average = count > 0 ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)) : 0;

  await Product.findByIdAndUpdate(productId, {
    'ratings.average': average,
    'ratings.count': count,
  });
};

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved',
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

export const addProductReview = async (req, res, next) => {
  try {
    const { rating, title, comment, images } = req.body;
    const { productId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check verified purchase
    const hasPurchased = await Order.findOne({
      customer: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
    });

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.title = title || existingReview.title;
      existingReview.comment = comment;
      if (images) existingReview.images = images;
      await existingReview.save();
      await updateProductRating(productId);

      return res.status(200).json({
        success: true,
        message: 'Your review has been updated.',
        review: existingReview,
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: !!hasPurchased,
      status: 'approved',
    });

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate('product', 'name images sku').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved', 'hidden'
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.status = status;
    await review.save();
    await updateProductRating(review.product);

    res.status(200).json({ success: true, message: `Review status updated to ${status}.`, review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductRating(productId);

    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
