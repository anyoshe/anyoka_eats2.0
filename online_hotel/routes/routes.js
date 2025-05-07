const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const { connect, connection, model, Types } = mongoose;
const { body, validationResult } = require('express-validator');
const shortid = require('shortid');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { upload, uploadMultiple, uploadFiles, uploadProfileImage, uploadBusinessPermit, uploadProductImages } = require('../config/multer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { type } = require("os");
require('dotenv').config();
const nodemailer = require('nodemailer');
const { notifyPartner } = require('../socketServer');
// const { notifyPartner: emitSocketNotification } = require('../socketServer');



const JWT_SECRET = process.env.JWT_SECRET;
const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET;
const RESET_PASSWORD_EXPIRY = process.env.RESET_PASSWORD_EXPIRY;

function authenticateToken(req, res, next) {
  console.log('Authenticating token...');
  const token = req.header('Authorization')?.split(' ')[1];
  console.log('Token extracted:', token);
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    console.log('Token verified:', verified);
    next();  // Make sure this line is executed
  } catch (err) {
    console.log('Token verification failed:', err.message);
    res.status(400).send('Invalid Token');
  }
}


//PARTNER /BUSINESS OWNERS LOGS AND PROFILE CONTROL

// Partner Schema 
const partnerSchema = new mongoose.Schema({
  businessName: { type: String, required: true, unique: true },
  businessType: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true },
  email: { type: String, required: false, unique: true },
  town: { type: String, required: false },
  location: { type: String, required: false },
  password: { type: String, required: true },
  profileImage: { type: String, required: false },
  idNumber: { type: String, required: true, unique: true },
  businessPermit: { type: String, required: false },
  description: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'partner'], default: 'partner' },
  ratings: {
    average: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: false },
        comment: { type: String, required: false },
        date: { type: Date, default: Date.now }
      }
    ]
  }
}, { timestamps: true });

const Partner = mongoose.model('Partner', partnerSchema);

// Find the partner before adding one
router.get('/partner', authenticateToken, async (req, res) => {
  try {
    console.log('User ID:', req.user._id);
    const partner = await Partner.findById(req.user._id);
    if (!partner) return res.status(404).send('Partner not found.');
    res.json(partner);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Partner Sign up  route
router.post('/signup', uploadBusinessPermit, async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      contactNumber,
      idNumber,
      email,
      town,
      location,
      password
    } = req.body;

    console.log('Received:', req.body);

    const existingPartner = await Partner.findOne({
      $or: [
        { businessName },
        { contactNumber }
      ]
    });

    if (existingPartner) {
      return res.status(400).json({ message: 'Business name or contact number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = (email === 'anyokaeats@gmail.com') ? 'admin' : 'partner';

    const newPartnerData = {
      businessName,
      businessType,
      contactNumber,
      idNumber,
      email,
      town,
      location,
      password: hashedPassword,
      role
    };

  

    // Check if business permit is uploaded
    if (req.file && req.file.fieldname === 'businessPermit') {
      newPartnerData.businessPermit = `/uploads/business-permits/${req.file.filename}`;
    }

    const newPartner = new Partner(newPartnerData);
    await newPartner.save();


    // Generate JWT token after partner is created
    const token = jwt.sign(
      { _id: newPartner._id, role: newPartner.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      partner: newPartner
    });

  } catch (error) {
    console.error('Sign-up failed:', error);
    res.status(500).json({ message: 'Server error during sign-up.' });
  }
});



// Retrieve Partner Route
router.get('/partners/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!partnerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid partner ID format' });
    }

    const partner = await Partner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.status(200).json(partner);
  } catch (error) {
    console.error('Error retrieving partner details:', error.message);
    res.status(500).json({ message: 'Failed to retrieve partner', error: error.message });
  }
});

// Update partner details Route

router.put('/partners/:id', async (req, res) => {
  try {
    const partnerId = req.params.id;
    const updatedData = req.body;

    const updatedPartner = await Partner.findByIdAndUpdate(
      partnerId,
      updatedData,
      { new: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Sync product documents that reference this partner
    await Product.updateMany(
      { 'shop.shopId': updatedPartner._id },
      {
        $set: {
          'shop.shopName': updatedPartner.businessName,
          'shop.town': updatedPartner.town,
          'shop.location': updatedPartner.location
        }
      }
    );

    res.status(200).json({
      message: 'Partner and related products updated successfully',
      updatedPartner
    });
  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ message: 'Failed to update partner', error });
  }
});

// Update /Add Partner profile Image
router.post('/upload-profile-image', (req, res) => {
  uploadProfileImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const imagePath = req.file.path;

    try {
      const { partnerId } = req.body;
      const updatedPartner = await Partner.findByIdAndUpdate(
        partnerId,
        { profileImage: `/uploads/profile-images/${req.file.filename}` },
        { new: true }
      );

      if (!updatedPartner) {
        return res.status(404).json({ message: 'Partner not found' });
      }

      res.status(200).json({
        message: 'Image uploaded and profile updated successfully',
        profileImage: `/uploads/profile-images/${req.file.filename}`,
      });
    } catch (error) {
      console.error('Error updating partner profile image:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
});




// Route to fetch all partners
router.get('/partners', async (req, res) => {
  try {
    const partners = await Partner.find({ role: 'partner' }); // Fetch all partners
    res.status(200).json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Failed to fetch partners', error });
  }
});

//RATING SHOPS
// GET /api/partners/:id/reviews
router.get('/partners/:id/reviews', async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id).populate('ratings.reviews.user', 'username names');
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    res.json({ reviews: partner.ratings.reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/partners/:id/comments
router.post('/partners/:id/comments', async (req, res) => {
  const { user: userId, comment } = req.body;
 console.log(req.body);
  if (!userId || !comment) {
    return res.status(400).json({ message: 'User and comment are required' });
  }

  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    partner.ratings.reviews.push({ user: userId, comment });
    await partner.save();

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/partners/:id/rate
router.post('/partners/:id/rate', async (req, res) => {
  const { user, rating, comment } = req.body;
console.log(req.body);
  // Validate rating and user
  if (!user || rating == null || isNaN(rating)) {
    return res.status(400).json({ message: 'User and valid rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    // Ensure ratings object structure exists
    if (!partner.ratings) {
      partner.ratings = { average: 0, reviews: [] };
    } else if (!Array.isArray(partner.ratings.reviews)) {
      partner.ratings.reviews = [];
    }

    // Check if the user has already rated the shop
    const existingReview = partner.ratings.reviews.find(
      (review) => review.user.toString() === user
    );

    if (existingReview) {
      // Update the existing rating and comment
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
    } else {
      // Add new review (with both rating and comment)
      partner.ratings.reviews.push({ user, rating, comment });
    }

    // Recalculate the average rating considering only reviews with valid ratings
    const validReviews = partner.ratings.reviews.filter(
      (review) => review.rating != null && !isNaN(review.rating)
    );

    const totalRatings = validReviews.reduce((sum, review) => sum + review.rating, 0);
    const reviewCount = validReviews.length;
    const averageRating = reviewCount > 0 ? totalRatings / reviewCount : 0;

    partner.ratings.average = averageRating;

    await partner.save();

    res.status(201).json({
      message: 'Rating submitted successfully',
      averageRating,
    });
  } catch (error) {
    console.error('Error submitting rating:', error.message);
    res.status(500).json({
      message: 'Failed to submit rating',
      error: error.message,
    });
  }
});


// Dealing with the user

//USER SCHEMA AND ROUTES
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  names: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  town: { type: String, required: true },
  location: { type: String, required: true },
  savedLocations: [{ // new field
    label: { type: String }, // e.g., "Work", "Home", "Parents"
    town: { type: String },
    location: { type: String },
  }],
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);



// Route to handle user signup
router.post('/auth/userSignup', async (req, res) => {
  const { username, names, email, phoneNumber, town, location, password } = req.body;

  try {
    // Validate required fields
    if (!username || !names || !phoneNumber || !town || !location || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      names,
      email,
      phoneNumber,
      town,
      location,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    // Return the token and user details
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        // id: newUser._id,
        _id: newUser._id,
        username: newUser.username,
        names: newUser.names,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        town: newUser.town,
        location: newUser.location,
      },
    });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/auth/current', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Use your secret key here
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/user/me', authenticateToken, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Forbidden: Not a user' });
  }

  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  console.log('Login attempt:', req.body);

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }

  try {
    // Attempt to find user by username or phone number
    let account = await User.findOne({
      $or: [
        { username: identifier },
        { phoneNumber: identifier }
      ]
    });

    let role = 'user';

    // If not found, attempt to find partner by business name or contact number
    if (!account) {
      account = await Partner.findOne({
        $or: [
          { businessName: identifier },
          { contactNumber: identifier }
        ]
      });
      role = 'partner';
    }

    // If account is still not found
    if (!account) {
      console.error('Account not found for identifier:', identifier);
      return res.status(404).json({ message: 'Account not found' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      console.error('Invalid credentials for identifier:', identifier);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: account._id, role },
      process.env.JWT_SECRET,
    );

    // Respond with token and role
    res.status(200).json({
      message: 'Login successful',
      token,
      role,
      redirectTo: role === 'partner' ? '/shop' : 'back'
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

router.post('/users/addSavedLocation', async (req, res) => {
  const { userId, locationData } = req.body;
  console.log(req.body);
  if (!userId || !locationData) {
    return res.status(400).json({ error: 'User ID and location data are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Add to savedLocations array
    user.savedLocations.push(locationData);
    await user.save();

    res.status(200).json({ message: 'Location saved', savedLocations: user.savedLocations });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET savedLocations by userId
router.get('/users/getSavedLocations/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('savedLocations');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ locations: user.savedLocations });
  } catch (err) {
    console.error('Error fetching saved locations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//PRODUCTS MANAGEMEMENT

//Product schema

const productSchema = new Schema({
  productId: { type: String, required: true, unique: true }, // Unique product identifier
  name: { type: String, required: true }, // Product name
  description: { type: String, required: false }, // Optional product description
  images: [{ type: String, required: false }], // Array of image URLs
  primaryImage: { type: String },
  category: { type: String, required: true }, // Product category
  subCategory: { type: String, required: false }, // Optional subcategory
  brand: { type: String, required: true }, // Product brand
  tags: [{ type: String, required: false }], // Optional tags for the product
  price: { type: Number, required: true }, // Product price
  discountedPrice: { type: Number, required: false },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // Unit of measurement (e.g., kg, g, etc.)
  inventory: { type: Number, required: true }, // Inventory count
  shop: {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true }, // Reference to the Partner schema
    shopName: { type: String, required: true }, // Business name from Partner schema
    town: { type: String, required: true }, // Town from Partner schema
    location: { type: String, required: true }, // Location from Partner schema
  },
  ratings: {
    average: { type: Number, default: 0 }, // Average rating
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // User who left the review
        rating: { type: Number, required: false }, // Rating value
        comment: { type: String, required: false }, // Optional comment
        date: { type: Date, default: Date.now },
      },
    ],
  },
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for updates
});

const Product = mongoose.model('Product', productSchema);



// Route to add a new product
router.post('/products', uploadProductImages, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      brand,
      tags,
      price,
      discountedPrice,
      quantity,
      unit,
      inventory,
      shopId, // Partner's ID
    } = req.body;


    const images = req.files?.images?.map((file) => `/uploads/products/${file.filename}`) || [];
    const primaryImageFile = req.files?.primaryImage?.[0]?.path;
    const primaryImage = primaryImageFile
      ? `/uploads/products/${primaryImageFile.split('/').pop()}`
      : req.body.primaryImage;


    // Fetch the partner details using the shopId
    const partner = await Partner.findById(shopId);
    if (!partner) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Generate a unique product ID
    const productId = shortid.generate();

    // Create a new product
    const newProduct = new Product({
      productId,
      name,
      description,
      images,
      primaryImage,
      category,
      subCategory,
      brand,
      tags,
      price,
      discountedPrice,
      quantity,
      unit,
      inventory,
      shop: {
        shopId: partner._id,
        shopName: partner.businessName,
        town: partner.town,
        location: partner.location,
      },
    });

    if (discountedPrice !== undefined) {
      newProduct.discountedPrice = discountedPrice;
    }

    // Save the product to the database
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});


router.get('/products', async (req, res) => {
  try {
    const { partnerId } = req.query; // Get partnerId from query parameters

    if (!partnerId) {
      return res.status(400).json({ message: 'Partner ID is required' });
    }

    // Fetch products for the specific partner
    const products = await Product.find({ 'shop.shopId': partnerId });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Route to delete a product by ID
router.delete('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});


router.put('/products/:id', uploadProductImages, async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      category,
      subCategory,
      brand,
      tags,
      price,
      discountedPrice,
      quantity,
      unit,
      inventory,
      primaryImage,   // fallback primary image from req.body
      deletedImages,  // This should be a JSON string
    } = req.body;

    // Extract additional images (if any)
    const images = (req.files && req.files.images && Array.isArray(req.files.images))
      ? req.files.images.map((file) => `/uploads/products/${file.filename}`)
      : [];

    // Extract primary image file if uploaded
    const primaryImageFile = (req.files && req.files.primaryImage && Array.isArray(req.files.primaryImage))
      ? `/uploads/products/${req.files.primaryImage[0].filename}`
      : null;

    // Use the primary image file if available; otherwise, fallback to primaryImage from req.body.
    const finalPrimaryImage = primaryImageFile || primaryImage;

    // Normalize deleted image paths to match stored paths
    const deletedImagesArray = deletedImages
      ? JSON.parse(deletedImages).map((imgPath) => {
        const parts = imgPath.split('/uploads/');
        return parts.length > 1 ? `/uploads/${parts[1]}` : imgPath;
      })
      : [];

    const updatedProduct = await Product.findById(productId);
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields
    updatedProduct.name = name || updatedProduct.name;
    updatedProduct.description = description || updatedProduct.description;
    updatedProduct.category = category || updatedProduct.category;
    updatedProduct.subCategory = subCategory || updatedProduct.subCategory;
    updatedProduct.brand = brand || updatedProduct.brand;
    updatedProduct.tags = tags ? tags.split(',').map((tag) => tag.trim()) : updatedProduct.tags;
    updatedProduct.price = price || updatedProduct.price;
    updatedProduct.quantity = quantity || updatedProduct.quantity;
    updatedProduct.unit = unit || updatedProduct.unit;
    updatedProduct.inventory = inventory || updatedProduct.inventory;
    updatedProduct.primaryImage = finalPrimaryImage || updatedProduct.primaryImage;

    // Add new images
    updatedProduct.images.push(...images);

    // Remove deleted images from the images array
    if (deletedImagesArray.length > 0) {
      updatedProduct.images = updatedProduct.images.filter(
        (image) => !deletedImagesArray.includes(image)
      );

      // Delete the files from the file system
      deletedImagesArray.forEach((imagePath) => {
        const fullPath = path.join(__dirname, '..', imagePath); // Resolve path relative to the project
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Failed to delete image file: ${fullPath}`, err);
            }
          });
        } else {
          console.warn(`File not found: ${fullPath}`);
        }
      });
    }
    if (discountedPrice !== undefined) {
      updatedProduct.discountedPrice = discountedPrice;
    }

    await updatedProduct.save();
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});


// Route to fetch all products
router.get('/all-products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products }); // Ensure the response contains a `products` key
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});



// Route to fetch product details by ID
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    res.status(500).json({ message: 'Failed to fetch product details', error: error.message });
  }
});



// GET /api/products/:id/reviews
router.get('/products/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('ratings.reviews.user', 'username names');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ reviews: product.ratings.reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to add a comment to a product
router.post('/products/:id/comments', async (req, res) => {
  const { user: userId, comment } = req.body;

  if (!userId || !comment) {
    return res.status(400).json({ message: 'User and comment are required' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.ratings.reviews.push({ user: userId, comment });
    await product.save();

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to submit a rating for a product
router.post('/products/:id/rate', async (req, res) => {
  try {
    let { user, rating, comment } = req.body;
    console.log(req.body);

    // Ensure rating is a number and comment is optional
    rating = Number(rating);

    if (!user || rating == null || isNaN(rating)) {
      return res.status(400).json({ message: 'User and rating are required and must be valid' });
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure ratings object structure exists
    if (!product.ratings) {
      product.ratings = { average: 0, reviews: [] };
    } else if (!Array.isArray(product.ratings.reviews)) {
      product.ratings.reviews = [];
    }

    // Check if the user has already rated the product
    const existingReview = product.ratings.reviews.find(
      (review) => review.user.toString() === user
    );

    if (existingReview) {
      // Update the existing rating and comment
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment; // Only update comment if a new one is provided
    } else {
      // Add new review (with both rating and comment)
      product.ratings.reviews.push({
        user: new mongoose.Types.ObjectId(user),
        rating,
        comment,
      });
    }

    // Recalculate the average rating, considering only reviews with a rating (not null or undefined)
    const validReviews = product.ratings.reviews.filter(review => review.rating != null && !isNaN(review.rating));
    const totalRatings = validReviews.reduce(
      (sum, review) => sum + (Number(review.rating) || 0),
      0
    );

    const reviewCount = validReviews.length;
    const averageRating = reviewCount > 0 ? totalRatings / reviewCount : 0;

    product.ratings.average = averageRating;

    await product.save();

    res.status(201).json({
      message: 'Rating submitted successfully',
      averageRating,
    });
  } catch (error) {
    console.error('Error submitting rating:', error.message);
    res.status(500).json({
      message: 'Failed to submit rating',
      error: error.message,
    });
  }
});

//Handling distance calculations.
router.get('/distance', async (req, res) => {
  const { origins, destinations } = req.query;

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${process.env.GOOGLE_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching from Google:', err);
    res.status(500).json({ error: 'Google API fetch failed' });
  }
});

// Route: /api/products-by-partner/:partnerId
router.get('/products-by-partner/:partnerId', async (req, res) => {

  const { partnerId } = req.params;
  console.log(req.params);
  try {
    const products = await Product.find({ 'shop.shopId': partnerId });

    res.status(200).json({ products });

    console.log(products);
  } catch (err) {
    console.error('Error fetching partner products:', err);
    res.status(500).json({ message: 'Failed to get products' });
  }
});


// --- ORDERS SCHEMAS & MODELS ---
const CounterSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: '20250421'
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);


const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  shop: {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
    shopName: { type: String, required: true },
  }
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  subOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder' }],
  delivery: {
    town: String,
    location: String,
    fee: Number,
    option: { type: String, enum: ['platform', 'own'], required: true },
  },
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['COD', 'Mpesa', 'PayPal', 'Card'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
// Hook must be BEFORE model is compiled
OrderSchema.pre('save', async function (next) {
  if (this.orderId) return next();

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  try {
    const counter = await Counter.findOneAndUpdate(
      { date: dateStr },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const paddedSeq = String(counter.seq).padStart(6, '0');
    this.orderId = `ANYEAT-${dateStr}-${paddedSeq}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Compile model AFTER hook
// Prevent OverwriteModelError
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const SubOrderSchema = new mongoose.Schema({
  parentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      'Pending',
      'OrderReceived',
      'Preparing',
      'ReadyForPickup',
      'PickedUp',
      'OutForDelivery',
      'Delivered',
    ],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

const SubOrder = mongoose.models.SubOrder || mongoose.model('SubOrder', SubOrderSchema);


// --- ROUTES ---

router.post('/orders/place', async (req, res) => {


  const {
    userId,
    items,           // [{ productId, quantity, price, shop: { shopId, shopName } }, ...]
    delivery,
    paymentMethod
  } = req.body;

  // Validate delivery object thoroughly
  if (!delivery || !delivery.town || !delivery.location || typeof delivery.fee !== 'number' || !delivery.option) {
    return res.status(400).json({ error: 'Incomplete delivery information.' });
  }

  // Enforce strict delivery rules
  if (delivery.option === 'platform' && delivery.fee <= 0) {
    return res.status(400).json({ error: 'Platform delivery must include a valid delivery fee.' });
  }

  if (delivery.option === 'own' && delivery.fee !== 0) {
    return res.status(400).json({ error: 'Own delivery should not have a delivery fee.' });
  }


  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Create main order
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create([{
      user: userId,
      items,
      delivery,
      paymentMethod,
      total // <- Add this
    }], { session });


    // 2. Group items by shop
    const byShop = items.reduce((acc, it) => {
      const sid = it.shop.shopId.toString();
      if (!acc[sid]) acc[sid] = [];
      acc[sid].push(it);
      return acc;
    }, {});

    // 3. Create suborders
    const subOrderIds = [];
    for (let shopId in byShop) {
      const shopItems = byShop[shopId];
      const total = shopItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const subOrder = await SubOrder.create([{
        parentOrder: order[0]._id,
        shop: shopId,
        items: shopItems.map(i => ({
          product: i.product,
          quantity: i.quantity,
          price: i.price
        })),
        total
      }], { session });

      notifyPartner(shopId, {
        message: "New order received!",
        subOrderId: subOrder[0]._id,
        orderId: order[0]._id, // Add this
        total,
        timestamp: new Date(),
      });

      await partnerNotify(shopId, {
        message: "New order received!",
        subOrderId: subOrder[0]._id,
        orderId: order[0]._id,
      });

      subOrderIds.push(subOrder[0]._id);
    }

    // 4. Link subOrders
    order[0].subOrders = subOrderIds;
    await order[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, orderId: order[0]._id });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});



// GET order by ID
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  try {
    // Ensure you populate the user field to get user data
    const order = await Order.findById(orderId)
      .populate('user', 'name email')  // Populating user details (name, email)
      .populate('items.product', 'name price')  // Populating product details
    // .populate('items.shop.shopId', 'name')  // Populating shop details

    // Log the order to check the structure
    console.log('Fetched order:', order);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order has a user and if user matches
    if (!order.user) {
      return res.status(500).json({ error: 'Order user is missing' });
    }

    // Log the order.user for debugging
    console.log('Order user:', order.user);

    // Ensure req.user is populated (you must have middleware setting this)
    if (!req.user) {
      return res.status(403).json({ error: 'User not authenticated' });
    }

    // Now check if the user from the order matches the authenticated user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to order' });
    }

    // If everything is good, send the order as response
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err.message);
    res.status(500).json({ error: 'Server error fetching order' });
  }
});



router.get('/partners/:partnerId/orders', async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Validate partnerId
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ error: 'Invalid partner ID' });
    }

    // Fetch suborders for the partner with nested population
    const subOrders = await SubOrder.find({ shop: partnerId })
      .populate({
        path: 'parentOrder',
        populate: { path: 'user', select: 'names' } // Populate the 'user' field within 'parentOrder'
      })
      .populate('items.product') // Populate product details
      .sort({ createdAt: -1 }); // Sort by most recent

    res.json(subOrders);

  } catch (error) {
    console.error('Error fetching suborders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/suborders/:id', async (req, res) => {
  try {
    const subOrder = await SubOrder.findById(req.params.id)
      .populate('items.product')
      .populate('shop', 'shopName');

    if (!subOrder) return res.status(404).json({ error: 'SubOrder not found.' });

    res.json(subOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch suborder.' });
  }
});


router.put('/suborders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      'Pending',
      'OrderReceived',
      'Preparing',
      'ReadyForPickup',
      'PickedUp',
      'OutForDelivery',
      'Delivered',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const subOrder = await SubOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!subOrder) {
      return res.status(404).json({ error: 'SubOrder not found' });
    }

    res.json(subOrder);
  } catch (error) {
    console.error('Error updating suborder status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PartnerNotificationSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  message: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder' },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const PartnerNotification = mongoose.models.PartnerNotification || mongoose.model('PartnerNotification', PartnerNotificationSchema);

const partnerNotify = async (shopId, { message, subOrderId, orderId, timestamp }) => {
  try {
    await PartnerNotification.create({
      shop: shopId,
      message,
      subOrderId,
      orderId,
      timestamp: timestamp || new Date()
    });
  } catch (err) {
    console.error("Failed to notify partner:", err.message);
  }
};

// Get all notifications for a partner
router.get('/partner-notifications/:partnerId', async (req, res) => {
  try {
    const notifications = await PartnerNotification.find({ shop: req.params.partnerId }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark as read
router.patch('/partner-notifications/:id/read', async (req, res) => {
  try {
    const notif = await PartnerNotification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete
router.delete('/partner-notifications/:id', async (req, res) => {
  try {
    await PartnerNotification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});



// DRIVER DISPATCH MANAGEMENT

const DriverSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },

  nationalId: { type: String, required: true, unique: true },
  driverLicenseNumber: { type: String, required: true, unique: true },
  profilePhotoUrl: { type: String },

  vehicleDetails: {
    make: { type: String },
    model: { type: String },
    plateNumber: { type: String, unique: true },
    type: { type: String },
    color: { type: String }
  },

  profileCompleted: { type: Boolean, default: false },


  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },

  emergencyContact: {
    name: { type: String },
    phoneNumber: { type: String },
    relationship: { type: String }
  },

  deviceInfo: {
    deviceId: { type: String },
    platform: { type: String },
    appVersion: { type: String }
  },

  currentLocation: {
    town: { type: String },
    location: { type: String }
  },

  assignedOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],

  status: {
    type: String,
    enum: ['Available', 'OnDelivery', 'Offline'],
    default: 'Available'
  },

  lastActiveAt: { type: Date }

}, { timestamps: true });


const Driver = mongoose.models.Driver || mongoose.model('Driver', DriverSchema);



router.post('/driver/signup', async (req, res) => {
  const { username, phoneNumber, email, password, nationalId, driverLicenseNumber } = req.body;
  console.log(req.body);

  if (!username || !phoneNumber || !password || !nationalId || !driverLicenseNumber) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingDriver = await Driver.findOne({
      $or: [
        { username },
        { phoneNumber },
        { nationalId },
        { driverLicenseNumber }
      ]
    });
    
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver already exists with provided details' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDriver = new Driver({
      username,
      phoneNumber,
      email,
      password: hashedPassword,
      nationalId,
      driverLicenseNumber,
    });

    await newDriver.save();

    // Create JWT token
    const token = jwt.sign({ id: newDriver._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      driver: {
        id: newDriver._id,
        username: newDriver.username,
        phoneNumber: newDriver.phoneNumber,
        email: newDriver.email,
        status: newDriver.status,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});


router.post('/driver/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username is provided
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find the driver by username or phone number
    const driver = await Driver.findOne({
      $or: [{ username }, { phoneNumber: username }],
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { driverId: driver._id },
      process.env.JWT_SECRET, // Use a secret key from .env
      { expiresIn: '1d' } // Token expiration time
    );

    // Respond with driver data and token
    res.json({
      driver: {
        _id: driver._id,
        username: driver.username,
        phoneNumber: driver.phoneNumber,
        profileCompleted: driver.profileCompleted,
      },
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// get driver details
router.get('/driver/profile', authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.driverId);
  
    console.log(driver);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Return the driver details
    res.json({
      _id: driver._id,
      username: driver.username,
      phoneNumber: driver.phoneNumber,
      nationalId: driver.nationalId,
      driverLicenseNumber: driver.driverLicenseNumber,
      email: driver.email,
      profileCompleted: driver.profileCompleted,
      verificationStatus: driver.verificationStatus,
      assignedOrders: driver.assignedOrders,
      status: driver.status,
      currentLocation: driver.currentLocation,
      emergencyContact: driver.emergencyContact,
      profilePhotoUrl: driver.profilePhotoUrl,
      vehicleDetails: driver.vehicleDetails,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});


// Update driver profile with photo upload

// Route for updating the driver profile
router.put('/driver/updates-profile', authenticateToken, uploadProfileImage, async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const driverId = req.user.driverId;  // <-- Use driverId from the JWT payload
    console.log('Driver ID from JWT:', driverId); 
    // Check if formData is provided in the request
    let parsedFormData = {};
    if (req.body.formData) {
      try {
        parsedFormData = JSON.parse(req.body.formData);  // Parse the formData field if it's available
      } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON in formData' });
      }
    }
    console.log(parsedFormData);
    // Find the driver by ID
    const driver = await Driver.findById(driverId);
    console.log(driver);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    console.log('Driver before update:', driver);

    // Update only the fields that are present in the request
    if (parsedFormData.username) driver.username = parsedFormData.username;
    if (parsedFormData.email) driver.email = parsedFormData.email;
    if (parsedFormData.phoneNumber) driver.phoneNumber = parsedFormData.phoneNumber;
    if (parsedFormData.nationalId) driver.nationalId = parsedFormData.nationalId;
    if (parsedFormData.driverLicenseNumber) driver.driverLicenseNumber = parsedFormData.driverLicenseNumber;
    if (parsedFormData.profileCompleted !== undefined) driver.profileCompleted = parsedFormData.profileCompleted;
    if (parsedFormData.verificationStatus) driver.verificationStatus = parsedFormData.verificationStatus;
    if (parsedFormData.status) driver.status = parsedFormData.status;
    if (parsedFormData.createdAt) driver.createdAt = parsedFormData.createdAt;
    if (parsedFormData.updatedAt) driver.updatedAt = parsedFormData.updatedAt;

    // If currentLocation is updated (e.g., from MapSelector), parse and update it
    if (parsedFormData.currentLocation) {
      driver.currentLocation = parsedFormData.currentLocation;
    }

    // If emergencyContact is updated, parse and update it
    if (parsedFormData.emergencyContact) {
      driver.emergencyContact = parsedFormData.emergencyContact;
    }

    // If vehicleDetails is updated, parse and update it
    if (parsedFormData.vehicleDetails) {
      driver.vehicleDetails = parsedFormData.vehicleDetails;
    }

    // If a new profile image is uploaded, update the profile photo URL
    if (req.file) {
      const profileImage = `/uploads/profile-images/${req.file.filename}`;
      driver.profilePhotoUrl = profileImage;
    }

    // Save the updated driver profile
    await driver.save();

    // Respond with success and the updated driver object
    res.status(200).json({
      message: 'Profile updated successfully',
      driver,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'An error occurred while updating the profile' });
  }
});


router.put('/driver/update-profile', authenticateToken, uploadProfileImage, async (req, res) => {
  try {
    const driverId = req.user.id; // Assuming your authenticate middleware attaches driver id
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Parse JSON fields
    if (req.body.vehicleDetails) {
      driver.vehicleDetails = JSON.parse(req.body.vehicleDetails);
    }
    if (req.body.emergencyContact) {
      driver.emergencyContact = JSON.parse(req.body.emergencyContact);
    }
    if (req.body.currentLocation) {
      driver.currentLocation = JSON.parse(req.body.currentLocation);
    }
    if (req.body.profileCompleted !== undefined) {
      driver.profileCompleted = req.body.profileCompleted === 'true'; // because formData sends strings
    }

    // Handle profile image upload
    if (req.file) {
      // Optionally delete old profile image if needed
      driver.profilePhotoUrl = `/uploads/drivers/${req.file.filename}`;
    }

    // Save the updated driver
    await driver.save();

    res.json(driver);
  } catch (err) {
    console.error('Error updating driver profile:', err);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});


// Mock notifier function
async function notifyDriversInTown(town, orderId) {
  const drivers = await Driver.find({
    'currentLocation.town': town,
    status: 'Available'
  });

  for (const driver of drivers) {
    console.log(`🔔 Notifying driver ${driver.username} about Order ${orderId}`);
    // You would use push notification service here
  }
}

// Route to update suborder status
router.put('/suborders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedSubOrder = await SubOrder.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedSubOrder) {
      return res.status(404).json({ error: 'SubOrder not found' });
    }

    // If status is ReadyForPickup, check all siblings
    if (status === 'ReadyForPickup') {
      const siblingSubOrders = await SubOrder.find({ parentOrder: updatedSubOrder.parentOrder });
      const allReady = siblingSubOrders.every(so => so.status === 'ReadyForPickup');

      if (allReady) {
        const parentOrder = await Order.findById(updatedSubOrder.parentOrder).populate('items.shop.shopId');

        // Get unique towns of shops in the order
        const towns = [
          ...new Set(
            parentOrder.items
              .map(item => item.shop?.shopId?.town)
              .filter(Boolean)
          )
        ];

        for (const town of towns) {
          await notifyDriversInTown(town, parentOrder.orderId);
        }
      }
    }

    res.json({ message: 'SubOrder status updated', subOrder: updatedSubOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


function sendEmailNotification(email, message) {
  const mailOptions = {
    from: email,
    to: 'anyokaeats@gmail.com',
    subject: 'New Contact Form Submission',
    text: `Message from ${email}: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return error;
    }
    console.log('Email sent: ' + info.response);
    return 'Email sent successfully';
  });
}












// PAYMENTS CONTROLS ROUTES
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const shortcode = process.env.SHORTCODE;
const passkey = process.env.PASSKEY;
const ngrokUrl = process.env.NODE_ENV === 'production'
  ? process.env.NGROK_URL
  : process.env.NGROK_URL_LOCAL;
router.post('/mpesa/callback', (req, res) => {
  const callbackData = req.body;
  console.log('M-Pesa Callback Received:', callbackData);

  // Your logic to handle the callback data goes here...
  // Extract relevant information from the callback data
  const { Body, ResultCode, ResultDesc } = callbackData;

  // Log the callback data for debugging or auditing
  console.log('Callback Body:', Body);
  console.log('Result Code:', ResultCode);
  console.log('Result Description:', ResultDesc);

  // Example: Process the callback based on ResultCode
  if (ResultCode === 0) {
    // Successful transaction
    // Update your database, notify user, etc.
    console.log('Payment successful. Update database...');
  } else {
    // Failed transaction
    // Handle failure scenario
    console.log('Payment failed:', ResultDesc);
  }
  // Respond with a success status to acknowledge receipt
  res.sendStatus(200);
});



// Route to handle M-Pesa payment
const generateTimestamp = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};



router.post('/mpesa/pay', async (req, res) => {
  const { phoneNumber, amount } = req.body;
  console.log('Received payment request:', { phoneNumber, amount });

  try {
    const timestamp = generateTimestamp();
    console.log('Generated timestamp:', timestamp);

    // Fetch access token 
    const authResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
      }
    });

    const { access_token } = authResponse.data;
    if (!access_token) {
      throw new Error('Failed to fetch access token');
    }

    console.log('Access Token:', access_token);

    // Generate password and payment data
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const paymentData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: `${ngrokUrl}/mpesa/callback`,
      AccountReference: 4148059,
      TransactionDesc: 'Order Payment'
    };

    console.log('Payment Data:', paymentData);

    // Initiate payment 
    const paymentResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', paymentData, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Payment Response:', paymentResponse.data);
    res.json(paymentResponse.data);
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
  }
});

router.post('/mpesa/status', async (req, res) => {
  const { CheckoutRequestID } = req.body; // The ID from the payment initiation response
  console.log('Checking payment status for:', CheckoutRequestID);

  try {
    // Fetch access token
    const authResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
      }
    });

    const { access_token } = authResponse.data;
    if (!access_token) {
      throw new Error('Failed to fetch access token');
    }

    console.log('Access Token:', access_token);

    // Payment status request data
    const statusRequestData = {
      BusinessShortCode: shortcode,
      Password: Buffer.from(`${shortcode}${passkey}${generateTimestamp()}`).toString('base64'),
      Timestamp: generateTimestamp(),
      CheckoutRequestID: CheckoutRequestID
    };

    // Query payment status
    const statusResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query', statusRequestData, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Payment Status Response:', statusResponse.data);
    res.json(statusResponse.data);
  } catch (error) {
    console.error('Error checking payment status:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to check payment status', details: error.message });
  }
});




//MAILS POST

// Configure your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anyokaeats@gmail.com',
    pass: 'hsvu kcue lejt cmks',
  },
});

// Route to handle form submission
router.post('/send-email', (req, res) => {
  const { email, message } = req.body;
  // console.log(req.body);

  const mailOptions = {
    from: email,
    to: 'anyokaeats@gmail.com', // replace with your email
    subject: 'New Contact Form Submission',
    text: `Message from ${email}: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error); // Log the error details
      return res.status(500).send(error.toString());
    } else {
      // console.log('SMTP Server is ready to take our messages');
    }
    // console.log('Email sent: ' + info.response); // Log success message
    res.status(200).send('Email sent successfully');
  });
});

// DRIVER FORGOT PASSWORD ROUTES

router.post('/driverForgotPassword', async (req, res) => {
  const { email, idNumber } = req.body; // Assuming you send both email and IDNumber from the frontend
  console.log(email, idNumber); // For debugging

  try {
    // Find driver by IDNumber
    const driver = await Driver.findOne({ IDNumber: idNumber }); // Find driver by both email and IDNumber
    if (!driver) {
      return res.status(404).json({ message: 'Driver with this email and IDNumber does not exist.' });
    }
    console.log(driver)
    console.log(driver._id)
    // Generate a reset token with driver ID
    const resetToken = jwt.sign({ driverId: driver._id, idNumber: driver.IDNumber }, RESET_PASSWORD_SECRET, { expiresIn: RESET_PASSWORD_EXPIRY });

    // Construct the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`; // Ensure using backticks for string interpolation

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`, // Use backticks for HTML template
    });

    res.json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Error sending password reset email. Please try again.' });
  }
});


// Password reset route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword, idNumber } = req.body;
  console.log(req.body);

  try {
    // Verify the token
    const decoded = jwt.verify(token, RESET_PASSWORD_SECRET);
    const driverId = decoded.driverId;
    console.log("Decoded Driver ID:", driverId);

    // Find driver by ID and verify ID number
    const driver = await Driver.findById(driverId);
    if (!driver || driver.IDNumber !== Number(idNumber)) {
      return res.status(403).json({ message: 'Invalid ID number. Please try again.' });
    }

    // Hash the new password outside of the pre-save hook
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password directly in the database
    await Driver.findByIdAndUpdate(driverId, { password: hashedPassword });

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// PARTNER FORGOT PASSWORD ROUTES

router.post('/recover-password', async (req, res) => {
  const { email, contactNumber } = req.body;
  console.log(req.body);

  try {
    // Find the partner by email and contact number
    const partner = await Partner.findOne({ contactNumber });
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found with this email and contact number.' });
    }

    console.log(partner);

    // Generate a reset token with partner ID
    const resetToken = jwt.sign(
      { partnerId: partner._id, contactNumber: partner.contactNumber },
      RESET_PASSWORD_SECRET,
      { expiresIn: RESET_PASSWORD_EXPIRY }
    );

    // Construct the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-partner-password?token=${resetToken}`; // Ensure using backticks for string interpolation



    // Send email with reset link
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`, // Use HTML for better formatting
    });

    res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Error in password recovery:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/reset-partner-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, RESET_PASSWORD_SECRET);
    const { partnerId } = decoded;

    // Find the partner by ID
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the partner's password
    partner.password = hashedPassword; // Store the hashed password
    await partner.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
});

// ORDER CONFIRMATION FOR ORDERS

// Route to handle order confirmation email
router.post('/sendConfirmationEmail', (req, res) => {

  const {
    to, // Customer email
    subject, // Subject from frontend
    body // HTML body from frontend
  } = req.body;
  console.log('Received order details:', req.body);
  const mailOptions = {
    from: 'anyokaeats@gmail.com',
    to: to, // Customer email provided in the frontend request
    subject: subject,
    html: body, // Using the HTML content provided in the frontend request
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error); // Log the error details
      return res.status(500).json({ error: 'Failed to send email' });
    } else {
      console.log('Order confirmation email sent:', info.response); // Log success message
      return res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});


module.exports = router;