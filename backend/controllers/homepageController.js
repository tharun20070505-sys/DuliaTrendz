import StoreSettings from '../models/StoreSettings.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Collection from '../models/Collection.js';

// Default initial hero slides
export const defaultHeroSlides = [
  {
    heading: 'Elegance in Every Thread',
    description: 'Discover refined styles designed for your everyday confidence.',
    buttonText: 'Shop New Arrivals',
    buttonLink: '/new-arrivals',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1600&auto=format&fit=crop',
    accent: 'AUTUMN / FESTIVE 2026',
  },
  {
    heading: 'Everyday Looks, Elevated',
    description: 'Effortless silhouettes blending comfort with refined couture.',
    buttonText: 'Shop Casual Wear',
    buttonLink: '/category/western-wear',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
    accent: 'MINIMAL LUXURY',
  },
  {
    heading: 'Celebrate Every Moment',
    description: 'Rich royal silks, intricate embroidery, and timeless heritage sets.',
    buttonText: 'Explore Ethnic Wear',
    buttonLink: '/category/ethnic-wear',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop',
    accent: 'ROYAL HERITAGE',
  },
  {
    heading: 'Make Every Look Yours',
    description: 'Statement dresses crafted for evening cocktails and daytime brunches.',
    buttonText: 'Shop Dresses',
    buttonLink: '/shop?subcategory=Dresses',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1600&auto=format&fit=crop',
    accent: 'EVENING EDIT',
  },
  {
    heading: 'The New Season Edit',
    description: 'Modern co-ords, flowing fabrics, and tailored separates.',
    buttonText: 'Explore Collection',
    buttonLink: '/collections',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    accent: 'DESIGNER SHOWCASE',
  },
];

// Default 5 Category slides
export const defaultCategorySlides = [
  {
    categoryName: 'Ethnic Wear',
    description: 'Kurtis, Anarkalis, Salwar Suits & Traditional Sets',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    link: '/category/ethnic-wear',
  },
  {
    categoryName: 'Western Wear',
    description: 'Chic tops, designer shirts & breezy summer wear',
    image: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=800&auto=format&fit=crop',
    link: '/category/western-wear',
  },
  {
    categoryName: 'Dresses',
    description: 'Maxi dresses, wrap silhouettes & party attire',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    link: '/shop?subcategory=Dresses',
  },
  {
    categoryName: 'Tops & Shirts',
    description: 'Crisp linens, cotton formals & relaxed blouses',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    link: '/shop?subcategory=Tops',
  },
  {
    categoryName: 'Co-ord Sets',
    description: 'Coordinated style pairings for effortlessly cohesive looks',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    link: '/category/co-ord-sets',
  },
];

// Default 5 Occasion slides
export const defaultOccasionSlides = [
  {
    title: 'Everyday Essentials',
    description: 'Breathable pure cottons and linens tailored for day-long grace.',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
    link: '/shop?occasion=Casual',
  },
  {
    title: 'Office Wear',
    description: 'Polished tunics, crisp formal shirts, and tailored comfort trousers.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    link: '/shop?occasion=Workwear',
  },
  {
    title: 'Festive Collection',
    description: 'Rich jewel tones, zardozi accents, and festive radiance.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
    link: '/shop?occasion=Festive',
  },
  {
    title: 'Wedding Guest Edit',
    description: 'Handcrafted anarkalis, silk sarees, and dramatic festive drapes.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    link: '/shop?occasion=Wedding',
  },
  {
    title: 'Weekend & Vacation',
    description: 'Flowing resort wear, breezy co-ords, and weekend getaway fits.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    link: '/shop?occasion=Vacation',
  },
];

export const getHomepageData = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({
        homepageHeroSlides: defaultHeroSlides,
        homepageCategorySlides: defaultCategorySlides,
        occasionSlides: defaultOccasionSlides,
      });
    } else {
      let needsSave = false;
      if (!settings.homepageHeroSlides || settings.homepageHeroSlides.length === 0) {
        settings.homepageHeroSlides = defaultHeroSlides;
        needsSave = true;
      }
      if (!settings.homepageCategorySlides || settings.homepageCategorySlides.length === 0) {
        settings.homepageCategorySlides = defaultCategorySlides;
        needsSave = true;
      }
      if (!settings.occasionSlides || settings.occasionSlides.length === 0) {
        settings.occasionSlides = defaultOccasionSlides;
        needsSave = true;
      }
      if (needsSave) await settings.save();
    }

    // Dynamic product carousels:
    // Carousel 3: New Arrivals
    const newArrivals = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Carousel 4: Bestsellers
    const bestsellers = await Product.find({
      status: 'active',
      $or: [{ bestseller: true }, { totalSold: { $gt: 0 } }],
    })
      .sort({ bestseller: -1, totalSold: -1, createdAt: -1 })
      .limit(8)
      .lean();

    // Trending Now
    const trending = await Product.find({ status: 'active', featured: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      announcementBar: settings.announcementBar,
      heroSlides: settings.homepageHeroSlides,
      categorySlides: settings.homepageCategorySlides,
      newArrivals,
      bestsellers,
      occasionSlides: settings.occasionSlides,
      trending,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHomepageSettings = async (req, res, next) => {
  try {
    const { heroSlides, categorySlides, occasionSlides, announcementBar } = req.body;
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }

    if (heroSlides) settings.homepageHeroSlides = heroSlides;
    if (categorySlides) settings.homepageCategorySlides = categorySlides;
    if (occasionSlides) settings.occasionSlides = occasionSlides;
    if (announcementBar) settings.announcementBar = announcementBar;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Homepage settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
