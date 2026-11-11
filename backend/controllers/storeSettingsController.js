import StoreSettings from '../models/StoreSettings.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

export const getStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    res.status(200).json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Check Delivery PIN code feasibility & shipping terms
// @route   POST /api/settings/check-pincode
// @access  Public
export const checkPincode = async (req, res, next) => {
  try {
    const { pincode } = req.body;
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
    }

    const pin = pincode.trim();
    let settings = await StoreSettings.findOne();
    if (!settings) settings = await StoreSettings.create({});

    // Realistic delivery estimation logic grounded in standard Indian postal logistics
    const firstDigit = pin[0];
    let region = 'Standard Zone';
    let estimatedDays = '3 - 5 business days';
    let codAvailable = true;

    // Check specific configured COD exclusions
    if (settings.cod.eligiblePincodes && settings.cod.eligiblePincodes.length > 0) {
      codAvailable = settings.cod.eligiblePincodes.includes(pin);
    }

    if (['1', '2', '3', '4'].includes(firstDigit)) {
      region = 'North / West Metro Zone';
      estimatedDays = '2 - 4 business days';
    } else if (['5', '6'].includes(firstDigit)) {
      region = 'South Hub';
      estimatedDays = '3 - 5 business days';
    } else if (['7', '8'].includes(firstDigit)) {
      region = 'East / Central Zone';
      estimatedDays = '4 - 6 business days';
    }

    res.status(200).json({
      success: true,
      pincode: pin,
      region,
      deliveryTime: estimatedDays,
      codAvailable: settings.cod.enabled && codAvailable,
      freeShippingThreshold: settings.shipping.freeShippingThreshold,
      standardShippingFee: settings.shipping.standardShippingFee,
      message: `Delivery available to PIN ${pin}. Estimated arrival within ${estimatedDays}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/settings/newsletter
// @access  Public
export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await NewsletterSubscriber.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(200).json({ success: true, message: 'You are already subscribed to the Dulia Trendz newsletter.' });
    }

    await NewsletterSubscriber.create({ email: cleanEmail });
    res.status(201).json({ success: true, message: 'Welcome to Dulia Trendz! You have been subscribed.' });
  } catch (error) {
    next(error);
  }
};
