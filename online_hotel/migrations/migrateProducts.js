// migrations/migrateProducts.js
const mongoose = require('mongoose');
const path = require('path');

// Load .env from project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL); // Debug

// Generate random productId
const generateProductId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Define Current Schema for products
const productSchema = new mongoose.Schema({
  productId: String,
  name: String,
  description: String,
  images: [String],
  primaryImage: String,
  category: String,
  subCategory: String,
  brand: String,
  tags: [String],
  price: Number,
  discountedPrice: Number,
  quantity: Number,
  unit: String,
  inventory: Number,
  shop: {
    shopId: mongoose.Schema.Types.ObjectId,
    shopName: String,
    town: String,
    location: String,
  },
  ratings: {
    average: Number,
    reviews: [
      {
        user: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        _id: mongoose.Schema.Types.ObjectId,
        date: Date,
      },
    ],
  },
  createdAt: Date,
  updatedAt: Date,
}, { versionKey: '__v' });

const Product = mongoose.model('Product', productSchema, 'products');

// Define schemas for old collections
const dishSchema = new mongoose.Schema({
  partnerId: mongoose.Schema.Types.ObjectId,
  orderCount: Number,
  dishCode: String,
  dishName: String,
  imageUrl: String,
  quantity: Number,
  dishPrice: Number,
  discount: Number,
  dishCategory: String,
  restaurant: String,
  subTotal: Number,
  dishDescription: String,
  averageRating: Number,
  ratingCount: Number,
  discountedPrice: Number,
  createdAt: Date,
}, { versionKey: '__v' });

const foodSchema = new mongoose.Schema({
  partnerId: mongoose.Schema.Types.ObjectId,
  orderCount: Number,
  foodCode: String,
  foodName: String,
  imageUrl: String,
  quantity: Number,
  foodPrice: Number,
  discount: Number,
  foodCategory: String,
  vendor: String,
  subTotal: Number,
  foodDescription: String,
  averageRating: Number,
  ratingCount: Number,
  discountedPrice: Number,
  createdAt: Date,
}, { versionKey: '__v' });

const Dish = mongoose.model('Dish', dishSchema, 'dishes');
const Food = mongoose.model('Food', foodSchema, 'foods');

// Optional: Shops collection
const shopSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  town: String,
  location: String,
});
const Shop = mongoose.model('Shop', shopSchema, 'shops');

// MongoDB connection
async function connectDB() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env');
    }
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB:', process.env.DATABASE_URL);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Migration function
async function migrateProducts() {
  try {
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections found:', collectionNames); // Debug
    const dishesCount = await mongoose.connection.db.collection('dishes').countDocuments();
    const foodsCount = await mongoose.connection.db.collection('foods').countDocuments();
    console.log(`Documents in dishes: ${dishesCount}, Documents in foods: ${foodsCount}`); // Debug
    if (!collectionNames.includes('dishes') || !collectionNames.includes('foods')) {
      console.error('Error: dishes and/or foods collections not found');
      return;
    }
    if (dishesCount === 0 && foodsCount === 0) {
      console.error('Error: Both dishes and foods collections are empty');
      return;
    }

    // Fetch documents
    const dishes = await Dish.find();
    const foods = await Food.find();
    console.log(`Found ${dishes.length} dishes and ${foods.length} foods to migrate`);

    let insertedCount = 0;
    let duplicateCount = 0;

    // Process dishes (Schema 1)
    for (const doc of dishes) {
      const shop = await Shop.findById(doc.partnerId);
      const newProduct = {
        _id: doc._id,
        productId: doc.dishCode || generateProductId(),
        name: doc.dishName || 'Unknown Product',
        description: doc.dishDescription || '',
        images: doc.imageUrl ? [doc.imageUrl] : [],
        primaryImage: doc.imageUrl || '',
        category: doc.dishCategory || 'Uncategorized',
        subCategory: doc.dishCategory || '',
        brand: doc.restaurant || '',
        tags: doc.dishDescription ? [doc.dishDescription] : [],
        price: doc.dishPrice || 0,
        discountedPrice: doc.discountedPrice || 0,
        quantity: doc.quantity || 1,
        unit: doc.dishCategory === 'Fruits and Vegetables' ? 'kg' : 'unit',
        inventory: doc.quantity || 0,
        shop: {
          shopId: doc.partnerId,
          shopName: doc.restaurant || 'Unknown Shop',
          town: shop?.town || '',
          location: shop?.location || '',
        },
        ratings: {
          average: doc.averageRating || 0,
          reviews: [],
        },
        createdAt: doc.createdAt || new Date(),
        updatedAt: new Date(),
        __v: doc.__v || 0,
      };

      try {
        const existing = await Product.findOne({ productId: newProduct.productId });
        if (existing) {
          newProduct.productId = generateProductId();
          console.warn(`Duplicate productId for ${newProduct.name}, generated new: ${newProduct.productId}`);
          duplicateCount++;
        }
        await Product.create(newProduct);
        console.log(`Migrated dish: ${newProduct.name} (_id: ${newProduct._id})`);
        insertedCount++;
      } catch (error) {
        console.error(`Failed to migrate dish _id: ${doc._id}`, error);
      }
    }

    // Process foods (Schema 2)
    for (const doc of foods) {
      const shop = await Shop.findById(doc.partnerId);
      const newProduct = {
        _id: doc._id,
        productId: doc.foodCode || generateProductId(),
        name: doc.foodName || 'Unknown Product',
        description: doc.foodDescription || '',
        images: doc.imageUrl ? [doc.imageUrl] : [],
        primaryImage: doc.imageUrl || '',
        category: doc.foodCategory || 'Uncategorized',
        subCategory: doc.foodCategory || '',
        brand: doc.vendor || '',
        tags: doc.foodDescription ? [doc.foodDescription] : [],
        price: doc.foodPrice || 0,
        discountedPrice: doc.discountedPrice || 0,
        quantity: doc.quantity || 1,
        unit: doc.foodCategory === 'Fruits and Vegetables' ? 'kg' : 'unit',
        inventory: doc.quantity || 0,
        shop: {
          shopId: doc.partnerId,
          shopName: doc.vendor || 'Unknown Shop',
          town: shop?.town || '',
          location: shop?.location || '',
        },
        ratings: {
          average: doc.averageRating || 0,
          reviews: [],
        },
        createdAt: doc.createdAt || new Date(),
        updatedAt: new Date(),
        __v: doc.__v || 0,
      };

      try {
        const existing = await Product.findOne({ productId: newProduct.productId });
        if (existing) {
          newProduct.productId = generateProductId();
          console.warn(`Duplicate productId for ${newProduct.name}, generated new: ${newProduct.productId}`);
          duplicateCount++;
        }
        await Product.create(newProduct);
        console.log(`Migrated food: ${newProduct.name} (_id: ${newProduct._id})`);
        insertedCount++;
      } catch (error) {
        console.error(`Failed to migrate food _id: ${doc._id}`, error);
      }
    }

    console.log(`Migration complete: ${insertedCount} documents inserted, ${duplicateCount} duplicates handled`);

    // Validate products
    const products = await Product.find();
    console.log(`Total products in products collection: ${products.length}`);
    products.forEach(doc => {
      console.log(`Product: ${doc.name}, Schema OK: ${!!doc.productId && !doc.dishCode && !doc.foodCode}`);
    });

    // Optional: Drop old collections
    // await mongoose.connection.db.dropCollection('dishes');
    // await mongoose.connection.db.dropCollection('foods');
    // console.log('Dropped dishes and foods collections');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run migration
async function run() {
  await connectDB();
  await migrateProducts();
}

run();