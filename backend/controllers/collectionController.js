import Collection from '../models/Collection.js';

const slugify = (text) => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ active: true }).sort({ order: 1 });
    res.status(200).json({ success: true, count: collections.length, collections });
  } catch (error) {
    next(error);
  }
};

export const getCollectionBySlug = async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug.toLowerCase() });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }
    res.status(200).json({ success: true, collection });
  } catch (error) {
    next(error);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const { name, title, description, image, bannerImage, featured, order } = req.body;
    const slug = slugify(name);

    const collection = await Collection.create({
      name,
      slug,
      title: title || name,
      description,
      image,
      bannerImage,
      featured: featured || false,
      order: order || 0,
    });

    res.status(201).json({ success: true, message: 'Collection created successfully.', collection });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    if (req.body.name && req.body.name !== collection.name) {
      req.body.slug = slugify(req.body.name);
    }

    const updated = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Collection updated successfully.', collection: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    await Collection.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Collection deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
