import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Collection from '../models/Collection.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import StoreSettings from '../models/StoreSettings.js';
import InventoryMovement from '../models/InventoryMovement.js';
import { defaultHeroSlides, defaultCategorySlides, defaultOccasionSlides } from '../controllers/homepageController.js';

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Collection.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await StoreSettings.deleteMany();
    await InventoryMovement.deleteMany();

    console.log('1. Creating Users...');
    const adminUser = await User.create({
      name: 'Dulia Administrator',
      email: 'admin@duliatrendz.com',
      password: 'Admin@12345',
      phone: '+91 98765 00001',
      role: 'admin',
      isVerified: true,
      addresses: [
        {
          fullName: 'Dulia Trendz HQ',
          phone: '+91 98765 00001',
          addressLine1: 'Unit 402, Fashion Avenue, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          landmark: 'Opposite Luxury Mall',
          isDefault: true,
          addressType: 'Office',
        },
      ],
    });

    const customerUser = await User.create({
      name: 'Aanya Sharma',
      email: 'customer@duliatrendz.com',
      password: 'Customer@12345',
      phone: '+91 98765 43210',
      role: 'customer',
      isVerified: true,
      addresses: [
        {
          fullName: 'Aanya Sharma',
          phone: '+91 98765 43210',
          addressLine1: 'Flat 12B, Emerald Towers, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Near 100 Feet Road',
          isDefault: true,
          addressType: 'Home',
        },
      ],
    });

    console.log('✓ Admin and Customer accounts created.');

    console.log('2. Creating Categories...');
    const categoriesData = [
      {
        name: 'Ethnic Wear',
        slug: 'ethnic-wear',
        description: 'Exquisite traditional and festive styles crafted with delicate craftsmanship.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Kurtis', 'Kurtas', 'Anarkali', 'Salwar Suits', 'Ethnic Sets'],
        order: 1,
      },
      {
        name: 'Western Wear',
        slug: 'western-wear',
        description: 'Contemporary silhouettes, versatile tops, and tailored essentials.',
        image: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Tops', 'T-Shirts', 'Shirts', 'Dresses', 'Jumpsuits'],
        order: 2,
      },
      {
        name: 'Co-ord Sets',
        slug: 'co-ord-sets',
        description: 'Effortlessly coordinated style pairings for day, evening, and festivities.',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Casual', 'Formal', 'Festive'],
        order: 3,
      },
      {
        name: 'Sarees & Traditional',
        slug: 'sarees-traditional',
        description: 'Timeless drapes, pure silks, organzas, and handcrafted designer blouses.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Sarees', 'Blouses', 'Dupattas'],
        order: 4,
      },
      {
        name: 'Bottom Wear',
        slug: 'bottom-wear',
        description: 'Perfect-fit denims, tailored trousers, flowy palazzos, and elegant skirts.',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Jeans', 'Trousers', 'Leggings', 'Palazzos', 'Skirts'],
        order: 5,
      },
      {
        name: 'Occasion Wear',
        slug: 'occasion-wear',
        description: 'Stunning attire created to celebrate life’s grandest milestones.',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
        subcategories: ['Party Wear', 'Festive Wear', 'Wedding Guest Wear'],
        order: 6,
      },
    ];
    await Category.insertMany(categoriesData);
    console.log('✓ Categories seeded.');

    console.log('3. Creating Collections...');
    const collectionsData = [
      {
        name: 'New Arrivals',
        slug: 'new-arrivals',
        title: 'Just Landed Styles',
        description: 'The latest fashion drops curated for modern women.',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
        featured: true,
        order: 1,
      },
      {
        name: 'Bestsellers',
        slug: 'bestsellers',
        title: 'Loved By You',
        description: 'Our most sought-after silhouettes that define signature elegance.',
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
        featured: true,
        order: 2,
      },
      {
        name: 'Everyday Essentials',
        slug: 'everyday-essentials',
        title: 'Graceful Everyday Comfort',
        description: 'Breathable pure cottons and linens tailored for day-long ease.',
        image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
        featured: true,
        order: 3,
      },
      {
        name: 'Office Wear',
        slug: 'office-wear',
        title: 'Modern Power Dressing',
        description: 'Sharp cuts and subtle hues for the discerning workplace.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
        featured: true,
        order: 4,
      },
      {
        name: 'Festive Collection',
        slug: 'festive',
        title: 'Festive Luminescence',
        description: 'Gleaming zari, regal maroons, and opulent festive designs.',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
        featured: true,
        order: 5,
      },
      {
        name: 'Wedding Guest Edit',
        slug: 'wedding-guest',
        title: 'Wedding Splendour',
        description: 'Graceful silhouettes for sangeet, cocktail, and wedding days.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
        featured: true,
        order: 6,
      },
      {
        name: 'Weekend & Vacation',
        slug: 'weekend-vacation',
        title: 'Resort & Getaways',
        description: 'Relaxed resort coordinates and breezy weekend drapes.',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
        featured: false,
        order: 7,
      },
      {
        name: 'Sale',
        slug: 'sale',
        title: 'Seasonal Offerings',
        description: 'Special seasonal price reductions on curated pieces.',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
        featured: false,
        order: 8,
      },
    ];
    await Collection.insertMany(collectionsData);
    console.log('✓ Collections seeded.');

    console.log('4. Creating 22 Rich Products with Size+Color Variant Inventories...');
    const productsData = [
      // 1. Floral Cotton Kurti
      {
        name: 'Floral Chanderi Cotton Kurti',
        slug: 'floral-chanderi-cotton-kurti',
        sku: 'DT-KUR-001',
        category: 'Ethnic Wear',
        subcategory: 'Kurtis',
        shortDescription: 'Graceful straight-fit kurti woven with delicate floral motifs and gentle side slits.',
        description: 'Imbued with the timeless charm of Indian heritage, this Chanderi cotton kurti features romantic floral prints accented with hand-embroidered mirror highlights along the yoke. Breathable, lightweight, and versatile for festive lunches or sophisticated workdays.',
        mrp: 1899,
        price: 1299,
        costPrice: 650,
        images: [
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Floral Chanderi Cotton Kurti Front' },
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop', isPrimary: false, alt: 'Floral Chanderi Cotton Kurti Detail' },
        ],
        variants: [
          { size: 'XS', color: 'Blush Pink', colorCode: '#F8BBD0', sku: 'DT-KUR-001-PNK-XS', stock: 4, price: 1299 },
          { size: 'S', color: 'Blush Pink', colorCode: '#F8BBD0', sku: 'DT-KUR-001-PNK-S', stock: 12, price: 1299 },
          { size: 'M', color: 'Blush Pink', colorCode: '#F8BBD0', sku: 'DT-KUR-001-PNK-M', stock: 18, price: 1299 },
          { size: 'L', color: 'Blush Pink', colorCode: '#F8BBD0', sku: 'DT-KUR-001-PNK-L', stock: 8, price: 1299 },
          { size: 'XL', color: 'Blush Pink', colorCode: '#F8BBD0', sku: 'DT-KUR-001-PNK-XL', stock: 0, price: 1299 }, // Out of stock to test!
          { size: 'S', color: 'Burgundy', colorCode: '#641F36', sku: 'DT-KUR-001-BUR-S', stock: 6, price: 1299 },
          { size: 'M', color: 'Burgundy', colorCode: '#641F36', sku: 'DT-KUR-001-BUR-M', stock: 10, price: 1299 },
          { size: 'L', color: 'Burgundy', colorCode: '#641F36', sku: 'DT-KUR-001-BUR-L', stock: 2, price: 1299 }, // Low stock
        ],
        specifications: {
          fabric: 'Chanderi Cotton',
          fit: 'Straight',
          pattern: 'Hand Block Print',
          sleeve: 'Three-Quarter Sleeves',
          neck: 'Notched Mandarin Collar',
          length: 'Calf Length',
          occasion: 'Festive & Workwear',
          careInstructions: 'Dry clean first wash, subsequently gentle hand wash in cold water.',
        },
        collections: ['new-arrivals', 'festive', 'office-wear'],
        featured: true,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['kurti', 'chanderi', 'pink', 'ethnic', 'workwear'],
        ratings: { average: 4.8, count: 24 },
        totalSold: 38,
      },

      // 2. Anarkali Silk Set
      {
        name: 'Royal Zardozi Silk Anarkali Suit Set',
        slug: 'royal-zardozi-silk-anarkali-suit-set',
        sku: 'DT-ANK-002',
        category: 'Ethnic Wear',
        subcategory: 'Anarkali',
        shortDescription: 'Regal floor-sweeping anarkali in rich mulberry silk with embroidered organza dupatta.',
        description: 'Command every room with this majestic mulberry silk Anarkali ensemble. Detailed with fine antique gold zardozi stitching across the neckline and cuffs, paired with tapered pants and an ethereal gold-bordered organza dupatta.',
        mrp: 4999,
        price: 3499,
        costPrice: 1700,
        images: [
          { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Silk Anarkali Suit Set' },
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop', isPrimary: false, alt: 'Silk Anarkali Embroidery' },
        ],
        variants: [
          { size: 'S', color: 'Wine Burgundy', colorCode: '#641F36', sku: 'DT-ANK-002-WIN-S', stock: 5, price: 3499 },
          { size: 'M', color: 'Wine Burgundy', colorCode: '#641F36', sku: 'DT-ANK-002-WIN-M', stock: 14, price: 3499 },
          { size: 'L', color: 'Wine Burgundy', colorCode: '#641F36', sku: 'DT-ANK-002-WIN-L', stock: 7, price: 3499 },
          { size: 'XL', color: 'Wine Burgundy', colorCode: '#641F36', sku: 'DT-ANK-002-WIN-XL', stock: 3, price: 3499 },
          { size: 'M', color: 'Ivory Gold', colorCode: '#D9B99B', sku: 'DT-ANK-002-IVO-M', stock: 9, price: 3499 },
          { size: 'L', color: 'Ivory Gold', colorCode: '#D9B99B', sku: 'DT-ANK-002-IVO-L', stock: 0, price: 3499 },
        ],
        specifications: {
          fabric: 'Mulberry Silk & Organza',
          fit: 'Flared Anarkali',
          pattern: 'Embroidered Zardozi',
          sleeve: 'Full Sleeves',
          neck: 'Sweetheart Neckline',
          length: 'Ankle Length',
          occasion: 'Wedding Guest & Festive Celebrations',
          careInstructions: 'Dry clean only to maintain silk sheen.',
        },
        collections: ['festive', 'wedding-guest', 'bestsellers'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['anarkali', 'silk', 'burgundy', 'wedding', 'zardozi'],
        ratings: { average: 4.9, count: 42 },
        totalSold: 85,
      },

      // 3. Embroidered Salwar Suit
      {
        name: 'Chanderi Embroidered Straight Salwar Suit',
        slug: 'chanderi-embroidered-straight-salwar-suit',
        sku: 'DT-SLW-003',
        category: 'Ethnic Wear',
        subcategory: 'Salwar Suits',
        shortDescription: 'Classic three-piece set featuring chanderi kurta, cigarette trousers, and dual-tone dupatta.',
        description: 'Understated luxury defined. This three-piece straight salwar suit features delicate floral motifs in resham threadwork, styled with tailored straight pants and a featherlight silk dupatta.',
        mrp: 3299,
        price: 2199,
        costPrice: 1100,
        images: [
          { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Salwar Suit Set' },
        ],
        variants: [
          { size: 'S', color: 'Teal Green', colorCode: '#006D77', sku: 'DT-SLW-003-TEA-S', stock: 8, price: 2199 },
          { size: 'M', color: 'Teal Green', colorCode: '#006D77', sku: 'DT-SLW-003-TEA-M', stock: 15, price: 2199 },
          { size: 'L', color: 'Teal Green', colorCode: '#006D77', sku: 'DT-SLW-003-TEA-L', stock: 11, price: 2199 },
          { size: 'XL', color: 'Teal Green', colorCode: '#006D77', sku: 'DT-SLW-003-TEA-XL', stock: 6, price: 2199 },
        ],
        specifications: {
          fabric: 'Chanderi Silk Blend',
          fit: 'Straight Fit',
          pattern: 'Resham Threadwork',
          sleeve: 'Three-Quarter',
          neck: 'Keyhole Neck',
          length: 'Knee Length',
          occasion: 'Festive & Occasion',
          careInstructions: 'Dry clean recommended.',
        },
        collections: ['festive', 'new-arrivals'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['salwar', 'suit', 'chanderi', 'teal'],
        ratings: { average: 4.7, count: 18 },
        totalSold: 29,
      },

      // 4. Banarasi Saree
      {
        name: 'Heritage Katan Banarasi Silk Saree',
        slug: 'heritage-katan-banarasi-silk-saree',
        sku: 'DT-SAR-004',
        category: 'Sarees & Traditional',
        subcategory: 'Sarees',
        shortDescription: 'Woven with pure gold zari in traditional floral jaal and rich pallu finish.',
        description: 'An heirloom creation handwoven by master weavers. The saree radiates elegance with intricate Mughal floral motifs across the expanse, bordered with temple zari selvedge. Includes unstitched matching blouse piece.',
        mrp: 6999,
        price: 4999,
        costPrice: 2600,
        images: [
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Banarasi Silk Saree' },
        ],
        variants: [
          { size: 'Free Size', color: 'Crimson Red', colorCode: '#9E2A2B', sku: 'DT-SAR-004-RED-FS', stock: 10, price: 4999 },
          { size: 'Free Size', color: 'Emerald Green', colorCode: '#1B4332', sku: 'DT-SAR-004-GRN-FS', stock: 7, price: 4999 },
          { size: 'Free Size', color: 'Deep Burgundy', colorCode: '#641F36', sku: 'DT-SAR-004-BUR-FS', stock: 5, price: 4999 },
        ],
        specifications: {
          fabric: 'Pure Katan Silk',
          fit: 'Draped Saree (5.5m + 0.8m blouse)',
          pattern: 'Gold Zari Floral Jaal',
          sleeve: 'Unstitched Blouse Piece',
          neck: 'Customizable Blouse',
          length: 'Standard 6.3 Meters',
          occasion: 'Weddings & Celebrations',
          careInstructions: 'Dry clean only. Store wrapped in pure cotton muslin.',
        },
        collections: ['festive', 'wedding-guest', 'bestsellers'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['saree', 'banarasi', 'silk', 'zari', 'wedding'],
        ratings: { average: 5.0, count: 31 },
        totalSold: 54,
      },

      // 5. Organza Floral Saree
      {
        name: 'Pastel Hand-Painted Organza Saree',
        slug: 'pastel-hand-painted-organza-saree',
        sku: 'DT-SAR-005',
        category: 'Sarees & Traditional',
        subcategory: 'Sarees',
        shortDescription: 'Featherlight sheer organza drape highlighted with hand-painted botanical roses.',
        description: 'Exude ethereal romanticism in this translucent organza drape. Subtle scalloped gota patti borders frame delicate hand-painted pastel blooms.',
        mrp: 3899,
        price: 2699,
        costPrice: 1300,
        images: [
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Organza Floral Saree' },
        ],
        variants: [
          { size: 'Free Size', color: 'Powder Rose', colorCode: '#C58A98', sku: 'DT-SAR-005-ROS-FS', stock: 8, price: 2699 },
          { size: 'Free Size', color: 'Mint Sage', colorCode: '#D8F3DC', sku: 'DT-SAR-005-MNT-FS', stock: 4, price: 2699 },
        ],
        specifications: {
          fabric: 'Pure Organza Silk',
          fit: 'Draped',
          pattern: 'Hand Painted Florals',
          sleeve: 'Blouse Piece Attached',
          neck: 'NA',
          length: '6.3 Meters',
          occasion: 'Daytime Weddings & Cocktail Soirees',
          careInstructions: 'Dry clean only. Low heat steam iron.',
        },
        collections: ['wedding-guest', 'new-arrivals'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['saree', 'organza', 'pastel', 'floral'],
        ratings: { average: 4.6, count: 15 },
        totalSold: 22,
      },

      // 6. Tiered Maxi Dress
      {
        name: 'Tiered Linen Maxi Wrap Dress',
        slug: 'tiered-linen-maxi-wrap-dress',
        sku: 'DT-DRS-006',
        category: 'Western Wear',
        subcategory: 'Dresses',
        shortDescription: 'Flowy bohemian maxi dress crafted from breathable washed European linen.',
        description: 'Designed for sun-kissed strolls and alfresco dining. Featuring an adjustable wrap waist, flattering V-neckline, cascading tiers, and discrete in-seam pockets.',
        mrp: 2799,
        price: 1899,
        costPrice: 900,
        images: [
          { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Linen Maxi Dress' },
          { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop', isPrimary: false, alt: 'Linen Maxi Dress Side' },
        ],
        variants: [
          { size: 'XS', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-DRS-006-IVO-XS', stock: 6, price: 1899 },
          { size: 'S', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-DRS-006-IVO-S', stock: 15, price: 1899 },
          { size: 'M', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-DRS-006-IVO-M', stock: 20, price: 1899 },
          { size: 'L', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-DRS-006-IVO-L', stock: 10, price: 1899 },
          { size: 'XL', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-DRS-006-IVO-XL', stock: 0, price: 1899 },
          { size: 'S', color: 'Terracotta', colorCode: '#E07A5F', sku: 'DT-DRS-006-TER-S', stock: 8, price: 1899 },
          { size: 'M', color: 'Terracotta', colorCode: '#E07A5F', sku: 'DT-DRS-006-TER-M', stock: 12, price: 1899 },
        ],
        specifications: {
          fabric: '100% Pure Washed Linen',
          fit: 'Relaxed Wrap Fit',
          pattern: 'Solid Neutral',
          sleeve: 'Short Flutter Sleeves',
          neck: 'Surplice V-Neck',
          length: 'Maxi Length',
          occasion: 'Weekend & Vacation, Casual Chic',
          careInstructions: 'Machine wash delicate or hand wash in cold water.',
        },
        collections: ['weekend-vacation', 'bestsellers', 'everyday-essentials'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['dress', 'maxi', 'linen', 'vacation', 'summer'],
        ratings: { average: 4.9, count: 56 },
        totalSold: 94,
      },

      // 7. Satin Slip Dress
      {
        name: 'Bias-Cut Silk Satin Midi Slip Dress',
        slug: 'bias-cut-silk-satin-midi-slip-dress',
        sku: 'DT-DRS-007',
        category: 'Western Wear',
        subcategory: 'Dresses',
        shortDescription: 'Sophisticated 90s-inspired cowl neck midi dress draping gracefully on the bias.',
        description: 'Fluid, lustrous, and impeccably cut. This satin slip dress skims the silhouette effortlessly. Features delicate spaghetti straps and a subtle leg slit for evening elegance.',
        mrp: 3199,
        price: 2299,
        costPrice: 1050,
        images: [
          { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Satin Midi Slip Dress' },
        ],
        variants: [
          { size: 'XS', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-DRS-007-GLD-XS', stock: 5, price: 2299 },
          { size: 'S', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-DRS-007-GLD-S', stock: 14, price: 2299 },
          { size: 'M', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-DRS-007-GLD-M', stock: 16, price: 2299 },
          { size: 'L', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-DRS-007-GLD-L', stock: 8, price: 2299 },
          { size: 'S', color: 'Noir Charcoal', colorCode: '#292524', sku: 'DT-DRS-007-BLK-S', stock: 10, price: 2299 },
          { size: 'M', color: 'Noir Charcoal', colorCode: '#292524', sku: 'DT-DRS-007-BLK-M', stock: 12, price: 2299 },
        ],
        specifications: {
          fabric: 'Heavy Silk Satin Blend',
          fit: 'Bias Cut Skimming',
          pattern: 'Lustrous Solid',
          sleeve: 'Sleeveless Adjustable Straps',
          neck: 'Draped Cowl Neck',
          length: 'Midi Length',
          occasion: 'Evening Soiree & Cocktail Parties',
          careInstructions: 'Dry clean recommended to preserve sheen.',
        },
        collections: ['wedding-guest', 'new-arrivals'],
        featured: true,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['dress', 'satin', 'cocktail', 'champagne', 'party'],
        ratings: { average: 4.8, count: 28 },
        totalSold: 41,
      },

      // 8. Linen Co-ord Set
      {
        name: 'Monochrome Tailored Linen Co-ord Set',
        slug: 'monochrome-tailored-linen-co-ord-set',
        sku: 'DT-CRD-008',
        category: 'Co-ord Sets',
        subcategory: 'Casual',
        shortDescription: 'Relaxed two-piece set with camp-collar boxy shirt and elasticated wide-leg culottes.',
        description: 'The epitome of effortless contemporary styling. Tailored from pre-washed breathable linen, this co-ord pair transitions seamlessly from work desk to weekend getaways.',
        mrp: 3499,
        price: 2499,
        costPrice: 1200,
        images: [
          { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Linen Co-ord Set' },
        ],
        variants: [
          { size: 'S', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-CRD-008-IVO-S', stock: 9, price: 2499 },
          { size: 'M', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-CRD-008-IVO-M', stock: 14, price: 2499 },
          { size: 'L', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-CRD-008-IVO-L', stock: 7, price: 2499 },
          { size: 'XL', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-CRD-008-IVO-XL', stock: 3, price: 2499 },
          { size: 'M', color: 'Olive Sage', colorCode: '#6B705C', sku: 'DT-CRD-008-OLV-M', stock: 8, price: 2499 },
        ],
        specifications: {
          fabric: 'Pure French Linen',
          fit: 'Relaxed Contemporary',
          pattern: 'Textured Solid',
          sleeve: 'Elbow Sleeves',
          neck: 'Notched Camp Collar',
          length: 'Cropped Shirt & Ankle Culottes',
          occasion: 'Brunch, Travel & Office Casual',
          careInstructions: 'Gentle cycle machine wash in cold water.',
        },
        collections: ['weekend-vacation', 'everyday-essentials', 'new-arrivals'],
        featured: true,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['co-ord', 'linen', 'ivory', 'minimal'],
        ratings: { average: 4.7, count: 19 },
        totalSold: 33,
      },

      // 9. Festive Jacquard Co-ord
      {
        name: 'Gilded Brocade Festive Peplum Co-ord Set',
        slug: 'gilded-brocade-festive-peplum-co-ord-set',
        sku: 'DT-CRD-009',
        category: 'Co-ord Sets',
        subcategory: 'Festive',
        shortDescription: 'Regal peplum tunic top with cigarette trousers in rich gold and jewel-toned brocade.',
        description: 'A modern Indo-western statement set. Features a structured sweetheart peplum top finished with antique metallic buttons and matching ankle-skimming cigarette trousers.',
        mrp: 4299,
        price: 2999,
        costPrice: 1450,
        images: [
          { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Festive Brocade Co-ord Set' },
        ],
        variants: [
          { size: 'S', color: 'Burgundy Crimson', colorCode: '#641F36', sku: 'DT-CRD-009-BUR-S', stock: 4, price: 2999 },
          { size: 'M', color: 'Burgundy Crimson', colorCode: '#641F36', sku: 'DT-CRD-009-BUR-M', stock: 11, price: 2999 },
          { size: 'L', color: 'Burgundy Crimson', colorCode: '#641F36', sku: 'DT-CRD-009-BUR-L', stock: 6, price: 2999 },
        ],
        specifications: {
          fabric: 'Metallic Brocade Silk',
          fit: 'Tailored Peplum & Cigarette Pants',
          pattern: 'Woven Jacquard',
          sleeve: 'Sleeveless with Bra-keepers',
          neck: 'Sculpted Sweetheart',
          length: 'Hip Length Top & Tapered Bottom',
          occasion: 'Festive Evenings & Sangeet Nights',
          careInstructions: 'Dry clean only.',
        },
        collections: ['festive', 'wedding-guest'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['co-ord', 'brocade', 'festive', 'burgundy'],
        ratings: { average: 4.8, count: 12 },
        totalSold: 20,
      },

      // 10. Classic Poplin Shirt
      {
        name: 'Oversized Crisp Cotton Poplin Shirt',
        slug: 'oversized-crisp-cotton-poplin-shirt',
        sku: 'DT-TOP-010',
        category: 'Western Wear',
        subcategory: 'Shirts',
        shortDescription: 'Architecturally tailored boyfriend shirt in breathable 100% Egyptian cotton poplin.',
        description: 'An absolute capsule wardrobe anchor. Cut with relaxed dropped shoulders, mother-of-pearl buttons, and extended cuffs that roll back with ease.',
        mrp: 1999,
        price: 1399,
        costPrice: 650,
        images: [
          { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Crisp Cotton Poplin Shirt' },
        ],
        variants: [
          { size: 'XS', color: 'Chalk White', colorCode: '#FFFFFF', sku: 'DT-TOP-010-WHT-XS', stock: 8, price: 1399 },
          { size: 'S', color: 'Chalk White', colorCode: '#FFFFFF', sku: 'DT-TOP-010-WHT-S', stock: 22, price: 1399 },
          { size: 'M', color: 'Chalk White', colorCode: '#FFFFFF', sku: 'DT-TOP-010-WHT-M', stock: 25, price: 1399 },
          { size: 'L', color: 'Chalk White', colorCode: '#FFFFFF', sku: 'DT-TOP-010-WHT-L', stock: 12, price: 1399 },
          { size: 'S', color: 'Sky Blue', colorCode: '#A2D2FF', sku: 'DT-TOP-010-BLU-S', stock: 14, price: 1399 },
          { size: 'M', color: 'Sky Blue', colorCode: '#A2D2FF', sku: 'DT-TOP-010-BLU-M', stock: 18, price: 1399 },
        ],
        specifications: {
          fabric: '100% Giza Cotton Poplin',
          fit: 'Relaxed Oversized',
          pattern: 'Crisp Solid',
          sleeve: 'Long Sleeves with French Cuffs',
          neck: 'Pointed Spread Collar',
          length: 'Tunic Length',
          occasion: 'Office Wear & Weekend Casual',
          careInstructions: 'Warm iron on cotton setting. Machine washable.',
        },
        collections: ['office-wear', 'everyday-essentials', 'bestsellers'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['shirt', 'poplin', 'white', 'workwear', 'minimal'],
        ratings: { average: 4.9, count: 68 },
        totalSold: 140,
      },

      // 11. Organza Ruffle Blouse
      {
        name: 'Romantic Organza Puffed Sleeve Blouse',
        slug: 'romantic-organza-puffed-sleeve-blouse',
        sku: 'DT-TOP-011',
        category: 'Western Wear',
        subcategory: 'Tops',
        shortDescription: 'Delicate semi-sheer top with voluminous puff sleeves and ruffled smocked cuffs.',
        description: 'Elevate denim or tailored trousers with this romantic blouse. Cut from airy organza with an attached soft viscose camisole lining.',
        mrp: 2199,
        price: 1499,
        costPrice: 700,
        images: [
          { url: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Puffed Sleeve Blouse' },
        ],
        variants: [
          { size: 'S', color: 'Muted Rose', colorCode: '#C58A98', sku: 'DT-TOP-011-ROS-S', stock: 7, price: 1499 },
          { size: 'M', color: 'Muted Rose', colorCode: '#C58A98', sku: 'DT-TOP-011-ROS-M', stock: 12, price: 1499 },
          { size: 'L', color: 'Muted Rose', colorCode: '#C58A98', sku: 'DT-TOP-011-ROS-L', stock: 5, price: 1499 },
          { size: 'S', color: 'Ivory Cream', colorCode: '#F7F0E8', sku: 'DT-TOP-011-IVO-S', stock: 10, price: 1499 },
          { size: 'M', color: 'Ivory Cream', colorCode: '#F7F0E8', sku: 'DT-TOP-011-IVO-M', stock: 14, price: 1499 },
        ],
        specifications: {
          fabric: 'Organza with Viscose Inner Lining',
          fit: 'Regular Romantic Fit',
          pattern: 'Sheer Texture',
          sleeve: 'Voluminous Statement Puffs',
          neck: 'Ruffled High Neck',
          length: 'Waist Length',
          occasion: 'Brunch & Evening Dinners',
          careInstructions: 'Dry clean recommended.',
        },
        collections: ['new-arrivals', 'bestsellers'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['top', 'organza', 'blouse', 'rose', 'romantic'],
        ratings: { average: 4.7, count: 21 },
        totalSold: 37,
      },

      // 12. Wide Leg Palazzos
      {
        name: 'Pleated Chiffon Flared Palazzo Trousers',
        slug: 'pleated-chiffon-flared-palazzo-trousers',
        sku: 'DT-BOT-012',
        category: 'Bottom Wear',
        subcategory: 'Palazzos',
        shortDescription: 'Micro-pleated wide-leg palazzos featuring high elastic waist and fluid drape.',
        description: 'Impossibly comfortable yet undeniably glamorous. Pair with kurtis or crop tops for an instantly elevated ensemble with rhythmic movement.',
        mrp: 1899,
        price: 1199,
        costPrice: 550,
        images: [
          { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Flared Palazzo Trousers' },
        ],
        variants: [
          { size: 'S', color: 'Ivory White', colorCode: '#F7F0E8', sku: 'DT-BOT-012-IVO-S', stock: 11, price: 1199 },
          { size: 'M', color: 'Ivory White', colorCode: '#F7F0E8', sku: 'DT-BOT-012-IVO-M', stock: 24, price: 1199 },
          { size: 'L', color: 'Ivory White', colorCode: '#F7F0E8', sku: 'DT-BOT-012-IVO-L', stock: 16, price: 1199 },
          { size: 'XL', color: 'Ivory White', colorCode: '#F7F0E8', sku: 'DT-BOT-012-IVO-XL', stock: 8, price: 1199 },
          { size: 'M', color: 'Charcoal Noir', colorCode: '#292524', sku: 'DT-BOT-012-BLK-M', stock: 18, price: 1199 },
          { size: 'L', color: 'Charcoal Noir', colorCode: '#292524', sku: 'DT-BOT-012-BLK-L', stock: 12, price: 1199 },
        ],
        specifications: {
          fabric: 'Georgette Chiffon with Butter Crepe Lining',
          fit: 'High-Rise Flared Palazzo',
          pattern: 'Accordion Micro Pleats',
          sleeve: 'NA',
          neck: 'NA',
          length: 'Floor Length',
          occasion: 'Ethnic Celebrations & Evening Wear',
          careInstructions: 'Hand wash cold. Do not twist or wring.',
        },
        collections: ['everyday-essentials', 'festive', 'bestsellers'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['palazzo', 'bottomwear', 'pleated', 'white', 'flared'],
        ratings: { average: 4.8, count: 52 },
        totalSold: 115,
      },

      // 13. Straight Leg Trousers
      {
        name: 'High-Waisted Tailored Crepe Trousers',
        slug: 'high-waisted-tailored-crepe-trousers',
        sku: 'DT-BOT-013',
        category: 'Bottom Wear',
        subcategory: 'Trousers',
        shortDescription: 'Sharply pressed tailored trousers in wrinkle-resistant premium Japanese stretch crepe.',
        description: 'Sculpting high rise with front pleats and streamlined slash pockets. The quintessential trousers for polished professionals who demand comfort.',
        mrp: 2499,
        price: 1699,
        costPrice: 800,
        images: [
          { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Tailored Crepe Trousers' },
        ],
        variants: [
          { size: 'XS', color: 'Mocha Charcoal', colorCode: '#292524', sku: 'DT-BOT-013-MCH-XS', stock: 5, price: 1699 },
          { size: 'S', color: 'Mocha Charcoal', colorCode: '#292524', sku: 'DT-BOT-013-MCH-S', stock: 14, price: 1699 },
          { size: 'M', color: 'Mocha Charcoal', colorCode: '#292524', sku: 'DT-BOT-013-MCH-M', stock: 19, price: 1699 },
          { size: 'L', color: 'Mocha Charcoal', colorCode: '#292524', sku: 'DT-BOT-013-MCH-L', stock: 9, price: 1699 },
          { size: 'S', color: 'Warm Camel', colorCode: '#C49F7D', sku: 'DT-BOT-013-CAM-S', stock: 10, price: 1699 },
          { size: 'M', color: 'Warm Camel', colorCode: '#C49F7D', sku: 'DT-BOT-013-CAM-M', stock: 15, price: 1699 },
        ],
        specifications: {
          fabric: 'Japanese Poly-Crepe with 4% Elastane',
          fit: 'High-Rise Straight Leg',
          pattern: 'Solid Tailored',
          sleeve: 'NA',
          neck: 'NA',
          length: 'Ankle Length',
          occasion: 'Formal Office & Smart Casuals',
          careInstructions: 'Machine wash gentle. Wrinkle resistant.',
        },
        collections: ['office-wear', 'everyday-essentials'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['trousers', 'pants', 'workwear', 'formal', 'crepe'],
        ratings: { average: 4.9, count: 34 },
        totalSold: 62,
      },

      // 14. Mom Fit Denim
      {
        name: 'Vintage Wash High-Rise Mom Jeans',
        slug: 'vintage-wash-high-rise-mom-jeans',
        sku: 'DT-BOT-014',
        category: 'Bottom Wear',
        subcategory: 'Jeans',
        shortDescription: 'Authentic 90s-inspired rigid denim tapering gently at the ankle in classic vintage indigo wash.',
        description: 'Crafted from 100% organic cotton denim that molds gracefully to your curves with wear. Fitted through the waist and hips with a relaxed tapered leg.',
        mrp: 2899,
        price: 1999,
        costPrice: 950,
        images: [
          { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Vintage Wash Mom Jeans' },
        ],
        variants: [
          { size: 'XS', color: 'Vintage Blue', colorCode: '#457B9D', sku: 'DT-BOT-014-BLU-XS', stock: 4, price: 1999 },
          { size: 'S', color: 'Vintage Blue', colorCode: '#457B9D', sku: 'DT-BOT-014-BLU-S', stock: 12, price: 1999 },
          { size: 'M', color: 'Vintage Blue', colorCode: '#457B9D', sku: 'DT-BOT-014-BLU-M', stock: 18, price: 1999 },
          { size: 'L', color: 'Vintage Blue', colorCode: '#457B9D', sku: 'DT-BOT-014-BLU-L', stock: 9, price: 1999 },
          { size: 'XL', color: 'Vintage Blue', colorCode: '#457B9D', sku: 'DT-BOT-014-BLU-XL', stock: 0, price: 1999 }, // Out of stock to test!
        ],
        specifications: {
          fabric: '100% Organic Cotton Denim (12.5 oz)',
          fit: 'High-Rise Tapered Mom Fit',
          pattern: 'Vintage Wash with Whisker Detail',
          sleeve: 'NA',
          neck: 'NA',
          length: 'Ankle Grazing 28" Inseam',
          occasion: 'Casual Everyday & Streetwear',
          careInstructions: 'Wash inside out with similar colors in cold water.',
        },
        collections: ['everyday-essentials', 'new-arrivals'],
        featured: false,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['jeans', 'denim', 'mom-fit', 'vintage', 'blue'],
        ratings: { average: 4.8, count: 48 },
        totalSold: 88,
      },

      // 15. Bandhani Festive Kurta Set
      {
        name: 'Handcrafted Bandhani Silk Kurta Set with Dupatta',
        slug: 'handcrafted-bandhani-silk-kurta-set-with-dupatta',
        sku: 'DT-SET-015',
        category: 'Ethnic Wear',
        subcategory: 'Ethnic Sets',
        shortDescription: 'Vibrant tie-dye Bandhani straight kurta with contrasting silk pants and scallop dupatta.',
        description: 'Authentic Kachchh Bandhani tie-dye rendered on lustrous art silk. Embellished with delicate gota kinari work across the sleeves and hemline.',
        mrp: 3799,
        price: 2599,
        costPrice: 1250,
        images: [
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Bandhani Kurta Set' },
        ],
        variants: [
          { size: 'S', color: 'Mustard Gold', colorCode: '#E9C46A', sku: 'DT-SET-015-MST-S', stock: 6, price: 2599 },
          { size: 'M', color: 'Mustard Gold', colorCode: '#E9C46A', sku: 'DT-SET-015-MST-M', stock: 12, price: 2599 },
          { size: 'L', color: 'Mustard Gold', colorCode: '#E9C46A', sku: 'DT-SET-015-MST-L', stock: 5, price: 2599 },
          { size: 'XL', color: 'Mustard Gold', colorCode: '#E9C46A', sku: 'DT-SET-015-MST-XL', stock: 2, price: 2599 },
        ],
        specifications: {
          fabric: 'Art Silk with Cotton Mulmul Lining',
          fit: 'Regular Straight',
          pattern: 'Traditional Bandhani Tie & Dye',
          sleeve: 'Three-Quarter',
          neck: 'Mandarin Collar with Placket',
          length: 'Calf Length',
          occasion: 'Festivals, Haldi & Pooja Functions',
          careInstructions: 'Dry clean only.',
        },
        collections: ['festive', 'new-arrivals'],
        featured: true,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['bandhani', 'kurta-set', 'ethnic', 'mustard', 'festive'],
        ratings: { average: 4.8, count: 26 },
        totalSold: 35,
      },

      // 16. Floral Wrap Jumpsuit
      {
        name: 'Botanical Print Wide-Leg Wrap Jumpsuit',
        slug: 'botanical-print-wide-leg-wrap-jumpsuit',
        sku: 'DT-WST-016',
        category: 'Western Wear',
        subcategory: 'Jumpsuits',
        shortDescription: 'One-and-done sophisticated one-piece featuring flowing wide legs and adjustable tie waist.',
        description: 'Effortless elegance from morning meetings to evening drinks. Fluid crepe fabric keeps you cool while the tailored lapel collar adds refined polish.',
        mrp: 3299,
        price: 2199,
        costPrice: 1050,
        images: [
          { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Floral Wide-Leg Jumpsuit' },
        ],
        variants: [
          { size: 'S', color: 'Deep Navy', colorCode: '#1D3557', sku: 'DT-WST-016-NVY-S', stock: 7, price: 2199 },
          { size: 'M', color: 'Deep Navy', colorCode: '#1D3557', sku: 'DT-WST-016-NVY-M', stock: 15, price: 2199 },
          { size: 'L', color: 'Deep Navy', colorCode: '#1D3557', sku: 'DT-WST-016-NVY-L', stock: 6, price: 2199 },
        ],
        specifications: {
          fabric: 'Fluid Poly-Georgette with Lining',
          fit: 'Wide Leg with Self-Belt',
          pattern: 'Earthy Botanical Print',
          sleeve: 'Sleeveless with Bra-Guides',
          neck: 'Surplice Lapel',
          length: 'Full Length',
          occasion: 'Evening Dinners, Brunch & Travel',
          careInstructions: 'Machine wash cold on gentle cycle.',
        },
        collections: ['weekend-vacation', 'new-arrivals'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['jumpsuit', 'botanical', 'western', 'navy'],
        ratings: { average: 4.6, count: 18 },
        totalSold: 27,
      },

      // 17. Cocktail Velvet Gown
      {
        name: 'Burgundy Crushed Velvet Evening Gown',
        slug: 'burgundy-crushed-velvet-evening-gown',
        sku: 'DT-OCC-017',
        category: 'Occasion Wear',
        subcategory: 'Party Wear',
        shortDescription: 'Dramatic floor-length gown in plush jewel-toned crushed velvet with high thigh slit.',
        description: 'Exude Old Hollywood allure. This statuesque gown hugs contours comfortably with rich stretch velvet, offset by an alluring side gather and elegant boat neckline.',
        mrp: 5499,
        price: 3799,
        costPrice: 1850,
        images: [
          { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Burgundy Velvet Gown' },
        ],
        variants: [
          { size: 'XS', color: 'Burgundy Wine', colorCode: '#641F36', sku: 'DT-OCC-017-BUR-XS', stock: 3, price: 3799 },
          { size: 'S', color: 'Burgundy Wine', colorCode: '#641F36', sku: 'DT-OCC-017-BUR-S', stock: 8, price: 3799 },
          { size: 'M', color: 'Burgundy Wine', colorCode: '#641F36', sku: 'DT-OCC-017-BUR-M', stock: 10, price: 3799 },
          { size: 'L', color: 'Burgundy Wine', colorCode: '#641F36', sku: 'DT-OCC-017-BUR-L', stock: 4, price: 3799 },
        ],
        specifications: {
          fabric: 'Micro-Stretch Silk Velvet',
          fit: 'Bodycon Column Gown',
          pattern: 'Crushed Velvet Texture',
          sleeve: 'Long Fitted Sleeves',
          neck: 'Boat Neck with Low Back',
          length: 'Floor Length with Trail',
          occasion: 'Gala Nights, Receptions & Black Tie',
          careInstructions: 'Specialist dry clean only.',
        },
        collections: ['wedding-guest', 'festive', 'bestsellers'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['gown', 'velvet', 'burgundy', 'party', 'cocktail'],
        ratings: { average: 5.0, count: 29 },
        totalSold: 46,
      },

      // 18. Designer Mirror Work Blouse
      {
        name: 'Handcrafted Mirror Work Raw Silk Blouse',
        slug: 'handcrafted-mirror-work-raw-silk-blouse',
        sku: 'DT-BLS-018',
        category: 'Sarees & Traditional',
        subcategory: 'Blouses',
        shortDescription: 'Versatile statement crop blouse encrusted with real abhala mirror work and latkans.',
        description: 'Pair with any heritage saree, lehenga, or wide-leg palazzo. Finished with back tie latkans and comfortable padded cups.',
        mrp: 2499,
        price: 1599,
        costPrice: 750,
        images: [
          { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Mirror Work Raw Silk Blouse' },
        ],
        variants: [
          { size: 'S', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-BLS-018-GLD-S', stock: 6, price: 1599 },
          { size: 'M', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-BLS-018-GLD-M', stock: 12, price: 1599 },
          { size: 'L', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-BLS-018-GLD-L', stock: 7, price: 1599 },
          { size: 'XL', color: 'Champagne Gold', colorCode: '#D9B99B', sku: 'DT-BLS-018-GLD-XL', stock: 3, price: 1599 },
        ],
        specifications: {
          fabric: 'Raw Silk with Cotton Lining & Padding',
          fit: 'Fitted Padded Blouse',
          pattern: 'Authentic Mirror Work Embroidery',
          sleeve: 'Short Sleeves',
          neck: 'Deep Round Neck with Tie Back',
          length: 'Cropped 14.5 Inches',
          occasion: 'Weddings & Garba Nights',
          careInstructions: 'Dry clean only to protect hand mirrors.',
        },
        collections: ['festive', 'wedding-guest'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['blouse', 'mirror-work', 'gold', 'raw-silk'],
        ratings: { average: 4.8, count: 19 },
        totalSold: 31,
      },

      // 19. A-Line Cotton Flared Skirt
      {
        name: 'Block Printed Cotton Flared Maxi Skirt',
        slug: 'block-printed-cotton-flared-maxi-skirt',
        sku: 'DT-BOT-019',
        category: 'Bottom Wear',
        subcategory: 'Skirts',
        shortDescription: 'Grand 12-kali flared skirt with authentic Sanganeri floral block print and drawstring waist.',
        description: 'A whirlwind of grace. With over 6 meters of flare, this pure cotton skirt is accentuated with gold border piping and handmade tassel ties.',
        mrp: 2399,
        price: 1599,
        costPrice: 780,
        images: [
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Block Printed Flared Skirt' },
        ],
        variants: [
          { size: 'Free Size', color: 'Indigo Blue', colorCode: '#1D3557', sku: 'DT-BOT-019-IND-FS', stock: 15, price: 1599 },
          { size: 'Free Size', color: 'Madder Red', colorCode: '#B22222', sku: 'DT-BOT-019-RED-FS', stock: 10, price: 1599 },
        ],
        specifications: {
          fabric: '100% Malmal Cotton',
          fit: 'Flared Kalidar Maxi Skirt',
          pattern: 'Hand Block Print',
          sleeve: 'NA',
          neck: 'NA',
          length: 'Maxi Length (39 Inches)',
          occasion: 'Festive Casuals, Travel & Fusion Styling',
          careInstructions: 'Hand wash in cold water with mild detergent.',
        },
        collections: ['festive', 'everyday-essentials'],
        featured: false,
        bestseller: false,
        newArrival: false,
        status: 'active',
        tags: ['skirt', 'cotton', 'block-print', 'flare'],
        ratings: { average: 4.7, count: 16 },
        totalSold: 28,
      },

      // 20. Casual Slub Linen Kurta
      {
        name: 'Everyday Minimalist Slub Linen Kurta',
        slug: 'everyday-minimalist-slub-linen-kurta',
        sku: 'DT-KUR-020',
        category: 'Ethnic Wear',
        subcategory: 'Kurtas',
        shortDescription: 'Clean-cut contemporary straight kurta with wooden buttons and deep side pockets.',
        description: 'Understated simplicity that speaks volumes. Woven from slub-textured linen blend, this kurta is designed for seamless modern living.',
        mrp: 1699,
        price: 1099,
        costPrice: 500,
        images: [
          { url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Minimalist Slub Linen Kurta' },
        ],
        variants: [
          { size: 'S', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-KUR-020-IVO-S', stock: 12, price: 1099 },
          { size: 'M', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-KUR-020-IVO-M', stock: 20, price: 1099 },
          { size: 'L', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-KUR-020-IVO-L', stock: 15, price: 1099 },
          { size: 'XL', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-KUR-020-IVO-XL', stock: 8, price: 1099 },
          { size: 'XXL', color: 'Warm Ivory', colorCode: '#F7F0E8', sku: 'DT-KUR-020-IVO-XXL', stock: 4, price: 1099 },
        ],
        specifications: {
          fabric: 'Slub Linen-Cotton Blend',
          fit: 'Relaxed Straight Fit',
          pattern: 'Textured Slub Solid',
          sleeve: 'Three-Quarter Roll-up Sleeves',
          neck: 'Mandarin Collar with Wooden Buttons',
          length: 'Knee Length',
          occasion: 'Everyday Essentials & College/Work',
          careInstructions: 'Machine wash cold.',
        },
        collections: ['everyday-essentials', 'office-wear', 'bestsellers'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
        tags: ['kurta', 'linen', 'ivory', 'minimal', 'dailywear'],
        ratings: { average: 4.9, count: 62 },
        totalSold: 120,
      },

      // 21. Organza Banarasi Dupatta
      {
        name: 'Handwoven Zari Border Banarasi Dupatta',
        slug: 'handwoven-zari-border-banarasi-dupatta',
        sku: 'DT-DUP-021',
        category: 'Sarees & Traditional',
        subcategory: 'Dupattas',
        shortDescription: 'Regal crimson red organza dupatta trimmed with floral brocade gold zari border.',
        description: 'Transform any plain solid kurti or suit into a festive spectacle. Finished with antique hand-tucked tassels.',
        mrp: 1799,
        price: 1199,
        costPrice: 580,
        images: [
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Banarasi Dupatta' },
        ],
        variants: [
          { size: 'Free Size', color: 'Crimson Red', colorCode: '#9E2A2B', sku: 'DT-DUP-021-RED-FS', stock: 12, price: 1199 },
          { size: 'Free Size', color: 'Deep Burgundy', colorCode: '#641F36', sku: 'DT-DUP-021-BUR-FS', stock: 8, price: 1199 },
        ],
        specifications: {
          fabric: 'Banarasi Organza Blend',
          fit: 'Generous 2.5m Stole Drape',
          pattern: 'Woven Floral Border & Bootis',
          sleeve: 'NA',
          neck: 'NA',
          length: '2.5 Meters x 36 Inches',
          occasion: 'Festive Occasions & Weddings',
          careInstructions: 'Dry clean only.',
        },
        collections: ['festive', 'wedding-guest'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['dupatta', 'banarasi', 'red', 'zari', 'festive'],
        ratings: { average: 4.9, count: 14 },
        totalSold: 22,
      },

      // 22. Ribbed Knit Casual Top
      {
        name: 'Sculpted Sweetheart Ribbed Knit Top',
        slug: 'sculpted-sweetheart-ribbed-knit-top',
        sku: 'DT-TOP-022',
        category: 'Western Wear',
        subcategory: 'Tops',
        shortDescription: 'Form-flattering fine-gauge ribbed top with structured sweetheart neckline.',
        description: 'A modern silhouette in ultrasoft viscose yarn with excellent recovery. Pairs effortlessly with high-waisted denims, trousers, and skirts.',
        mrp: 1599,
        price: 999,
        costPrice: 450,
        images: [
          { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop', isPrimary: true, alt: 'Ribbed Knit Top' },
        ],
        variants: [
          { size: 'XS', color: 'Muted Rose', colorCode: '#C58A98', sku: 'DT-TOP-022-ROS-XS', stock: 6, price: 999 },
          { size: 'S', color: 'Muted Rose', colorCode: '#C58A98', sku: 'DT-TOP-022-ROS-S', stock: 15, price: 999 },
          { size: 'M', color: 'Muted Rose', colorCode: '#C58A98', sku: 'DT-TOP-022-ROS-M', stock: 20, price: 999 },
          { size: 'L', color: 'Muted Rose', colorCode: '#C58A98', sku: 'DT-TOP-022-ROS-L', stock: 10, price: 999 },
          { size: 'S', color: 'Charcoal Noir', colorCode: '#292524', sku: 'DT-TOP-022-BLK-S', stock: 12, price: 999 },
          { size: 'M', color: 'Charcoal Noir', colorCode: '#292524', sku: 'DT-TOP-022-BLK-M', stock: 16, price: 999 },
        ],
        specifications: {
          fabric: 'Rayon Viscose Rib Knit with Stretch',
          fit: 'Slim Sculpting Fit',
          pattern: 'Vertical Rib Texture',
          sleeve: 'Elbow Length Sleeves',
          neck: 'Sweetheart Cut',
          length: 'Waist Length',
          occasion: 'Casual Dailywear & Layering',
          careInstructions: 'Machine wash delicate cold. Dry flat.',
        },
        collections: ['everyday-essentials', 'sale'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
        tags: ['top', 'knit', 'ribbed', 'rose', 'casual'],
        ratings: { average: 4.7, count: 32 },
        totalSold: 65,
      },
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✓ Seeded ${createdProducts.length} rich products with multi-size/color inventories.`);

    const movements = [];
    for (const prod of createdProducts) {
      for (const variant of prod.variants) {
        movements.push({
          product: prod._id,
          productName: prod.name,
          variantSku: variant.sku,
          size: variant.size,
          color: variant.color,
          previousStock: 0,
          change: variant.stock,
          newStock: variant.stock,
          reason: 'INITIAL_IMPORT',
          referenceId: 'INITIAL_SEED',
          adminUser: 'Admin Seed Script',
        });
      }
    }
    await InventoryMovement.insertMany(movements);
    console.log('✓ Initial inventory movement logs recorded.');

    console.log('6. Creating Coupons...');
    const couponsData = [
      {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 999,
        maxDiscountAmount: 300,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 5000,
        perUserLimit: 1,
        active: true,
      },
      {
        code: 'DULIA20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 1999,
        maxDiscountAmount: 600,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 2000,
        perUserLimit: 1,
        active: true,
      },
      {
        code: 'FESTIVE500',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderAmount: 2999,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 1000,
        perUserLimit: 2,
        active: true,
      },
    ];
    await Coupon.insertMany(couponsData);
    console.log('✓ Coupons seeded.');

    console.log('7. Creating Verified Customer Reviews...');
    const firstProduct = createdProducts[0];
    const secondProduct = createdProducts[1];

    await Review.create([
      {
        product: firstProduct._id,
        user: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        title: 'Breathtaking quality and fabric!',
        comment: 'The Chanderi cotton feels so soft against the skin, and the hand embroidery is delicate and gorgeous. The Burgundy color is rich and elegant. Fits true to size!',
        isVerifiedPurchase: true,
        status: 'approved',
      },
      {
        product: secondProduct._id,
        user: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        title: 'Wore this to a family wedding and received endless compliments!',
        comment: 'The zardozi work is genuinely high-end couture level. The organza dupatta is so airy and royal. Very happy with Dulia Trendz!',
        isVerifiedPurchase: true,
        status: 'approved',
      },
    ]);
    console.log('✓ Reviews seeded.');

    console.log('8. Initializing Store Settings with 5 Carousels...');
    await StoreSettings.create({
      storeName: 'Dulia Trendz',
      tagline: 'Your Style, Our Passion...',
      announcementBar: {
        text: 'NEW SEASON COLLECTION — FREE SHIPPING ON ORDERS ABOVE ₹999',
        enabled: true,
        link: '/shop',
      },
      shipping: {
        freeShippingThreshold: 999,
        standardShippingFee: 99,
        expressShippingFee: 199,
      },
      cod: {
        enabled: true,
        minOrderAmount: 499,
        maxOrderAmount: 10000,
        codFee: 49,
      },
      homepageHeroSlides: defaultHeroSlides,
      homepageCategorySlides: defaultCategorySlides,
      occasionSlides: defaultOccasionSlides,
    });
    console.log('✓ Store settings and Carousels initialized.');

    console.log('\n=============================================================');
    console.log('  DULIA TRENDZ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@duliatrendz.com');
    console.log('  Password: Admin@12345');
    console.log('Customer Account:');
    console.log('  Email:    customer@duliatrendz.com');
    console.log('  Password: Customer@12345');
    console.log('Coupons:');
    console.log('  WELCOME10 (10% off min ₹999)');
    console.log('  DULIA20   (20% off min ₹1999)');
    console.log('  FESTIVE500 (₹500 flat off min ₹2999)');
    console.log('=============================================================\n');

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
