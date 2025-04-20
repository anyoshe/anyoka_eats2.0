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
const { upload, uploadMultiple, uploadProfileImage, uploadBusinessPermit, uploadProductImages } = require('../config/multer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { type } = require("os");
require('dotenv').config();
const nodemailer = require('nodemailer');
const { getIo, connectedPartners, pendingOrders } = require('../socket');


const JWT_SECRET = process.env.JWT_SECRET;
const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET;
const RESET_PASSWORD_EXPIRY = process.env.RESET_PASSWORD_EXPIRY;

function authenticateToken(req, res, next) {
  console.log('Authenticating token...');
  const token = req.header('Authorization')?.split(' ')[1];
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
  role: { type: String, enum: ['admin', 'partner'], default: 'partner' }
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

    if (req.file) {
      newPartnerData.businessPermit = req.file.filename;
    }

    const newPartner = new Partner(newPartnerData);
    await newPartner.save();
    res.status(201).json(newPartner);

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

    res.status(200).json({ message: 'Partner updated successfully', updatedPartner });
  } catch (error) {
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



// Dealing with the user

//USER SCHEMA AND ROUTES
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  names: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  town: { type: String, required: true },
  location: { type: String, required: true },
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
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

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
      { expiresIn: '7d' }
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


    //     const images = req.files?.images?.map(file => file.path) || [];
    // const primaryImageFile = req.files?.primaryImage?.[0]?.path;
    // const primaryImage = primaryImageFile || req.body.primaryImage;
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


// Function to notify the supplier about a new order
const notifySupplier = async (order) => {
  try {
    console.log('Sending order details:', order);
    const restaurant = await Restaurant.findOne({ restaurant: order.selectedRestaurant }).populate('partnerId');

    if (!restaurant || !restaurant.partnerId) {
      console.log(`❌ No partner found for restaurant: ${order.selectedRestaurant}`);
      return;
    }

    const partnerId = restaurant.partnerId._id.toString();
    const partnerSocket = connectedPartners.get(partnerId);

    if (partnerSocket) {
      // If online, send the order immediately
      partnerSocket.emit('newOrder', { orderId: order.orderId, orderDetails: order });
      console.log(`✅ Order ${order.orderId} sent to partner ${partnerId}`);
    } else {
      // If offline, store the order for later
      console.log(`⚠️ Partner ${partnerId} is offline. Storing order.`);
      if (!pendingOrders.has(partnerId)) pendingOrders.set(partnerId, []);
      pendingOrders.get(partnerId).push({ orderId: order.orderId, orderDetails: order });
      console.log(`Stored orders for ${partnerId}:`, pendingOrders.get(partnerId));

    }
  } catch (error) {
    console.error('🚨 Error notifying supplier:', error);
  }
};






// Dish SCHEMA AND ITS ROUTES

const dishSchema = new Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  orderCount: { type: Number, default: 0 },
  dishCode: { type: String, required: true, unique: true },
  dishName: { type: String, required: true },
  imageUrl: { type: String, required: false },
  quantity: { type: Number, required: true, default: 1 },
  dishPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  dishCategory: { type: String, required: true },
  restaurant: { type: String, required: true },
  subTotal: { type: Number, required: false, default: 0 },
  dishDescription: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  discountedPrice: { type: Number, required: false, default: 0 },
});
// Pre-save middleware to calculate the discounted price

dishSchema.pre('save', function (next) {
  if (this.discount > 0) {
    this.discountedPrice = this.dishPrice - (this.dishPrice * this.discount / 100);
  } else {
    this.discountedPrice = this.dishPrice;
  }
  next();
});

const Dish = model("Dish", dishSchema);

//add dish to database and restaurant
router.post('/dishes', (req, res) => {
  // console.log('Received request to add dish:', req.body);
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
    }

    try {
      const { dishCode, dishName, quantity, dishPrice, dishCategory, restaurant, dishDescription, partnerId } = req.body;
      const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';

      if (!partnerId) {
        return res.status(400).json({ error: 'partnerId is required' });
      }
      // Check if the restaurant already exists
      let existingRestaurant = await Restaurant.findOne({ restaurant });

      // If the restaurant doesn't exist, create it
      if (!existingRestaurant) {
        const newRestaurant = new Restaurant({
          restaurant,
          dishCategory
        });
        existingRestaurant = await newRestaurant.save();
      }

      // Create the new dish
      const newDish = new Dish({
        dishCode,
        dishName,
        quantity,
        dishPrice,
        dishCategory,
        restaurant,
        dishDescription,
        partnerId,
        imageUrl
      });

      await newDish.save();
      // console.log('New dish created:', newDish);
      res.status(201).json({ success: true, dish: newDish });
    } catch (error) {
      console.error('Error creating dish:', error);
      res.status(500).json({ success: false, message: 'Error creating dish', error });
    }
  });
});

//route to put or update a dish
router.put('/dishes/:dishCode', (req, res) => {
  // console.log(req.body); // Log the request body to see what's received

  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
    }
    try {
      const { dishName, dishPrice, quantity, dishCategory, restaurant, dishDescription, discount } = req.body;
      let imageUrl;
      if (req.file) {
        imageUrl = '/uploads/images/' + req.file.filename; // Path to the uploaded file
      }

      const updatedFields = {};
      if (dishName) updatedFields.dishName = dishName;
      if (dishPrice) updatedFields.dishPrice = dishPrice;
      if (quantity) updatedFields.quantity = quantity;
      if (dishCategory) updatedFields.dishCategory = dishCategory;
      if (restaurant) updatedFields.restaurant = restaurant;
      if (dishDescription) updatedFields.dishDescription = dishDescription;
      if (imageUrl) updatedFields.imageUrl = imageUrl;

      if (discount) {
        const discountValue = parseFloat(discount);
        if (!isNaN(discountValue) && discountValue >= 0 && discountValue <= 100) {
          updatedFields.discount = discountValue;
        } else {
          return res.status(400).json({ error: 'Invalid discount value' });
        }
      }

      // Calculate the discounted price
      if (updatedFields.dishPrice || updatedFields.discount) {
        const price = updatedFields.dishPrice * 1.2 || dishPrice * 1.2;
        const discountValue = updatedFields.discount || discount;
        updatedFields.discountedPrice = price - (price * discountValue / 100);
      }

      const updatedDish = await Dish.findOneAndUpdate(
        { dishCode: req.params.dishCode },
        updatedFields,
        { new: true }
      );

      if (!updatedDish) {
        return res.status(404).json({ error: 'Dish not found' });
      }

      res.json({ message: 'Dish updated successfully', dish: updatedDish });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update dish', message: error.message });
    }
  });
});


// route to fetch discounted dishes
router.get('/discounted-dishes', async (req, res) => {
  try {
    const discountedDishes = await Dish.find({ discount: { $gt: 0 } }).exec();
    res.json({ dishes: discountedDishes });
  } catch (error) {
    console.error('Error fetching discounted dishes:', error);
    res.status(500).json({ message: 'Error fetching discounted dishes' });
  }
});

// Route to delete a dish by dish code or _id
router.delete('/dishes/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Log the identifier for debugging
    // console.log('Identifier received:', identifier);

    if (!identifier) {
      return res.status(400).json({ error: 'Identifier not provided' });
    }

    // Attempt to find and delete the dish by either dishCode or _id
    const deletedDish = await Dish.findOneAndDelete({
      $or: [
        { dishCode: new RegExp(`^${identifier}$`, 'i') }, // Case-insensitive match for dishCode
        { _id: identifier } // Match by _id if identifier is an ObjectId
      ]
    });

    if (!deletedDish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    res.json({ message: 'Dish deleted successfully', deletedDish });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({ error: 'Failed to delete dish', message: error.message });
  }
});
// Route to search for a dish by dishCode or dishName
router.get('/dishes/search', async (req, res) => {
  try {
    const { query } = req.query;

    // Check if query is provided
    if (!query) {
      return res.status(400).json({ error: 'Query parameter not provided' });
    }

    // Search for dish by dishCode or dishName
    const dish = await Dish.findOne({
      $or: [{ dishCode: query }, { dishName: query }]
    });

    // Check if dish was found
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    res.json({ message: 'Dish found', dish });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search dish', message: error.message });
  }
});

//getting all dishes
router.get('/dishes', async (req, res) => {
  try {
    const dishes = await Dish.find({});
    res.json({ message: 'Dishes retrieved successfully', dishes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve dishes', message: error.message });
  }
});

//getting a dish using dishCode
router.get('/dishes/:dishCode', async (req, res) => {
  try {
    const dish = await Dish.findOne({ dishCode: req.params.dishCode });
    if (!dish) {
      return res.status(404).send({ message: 'Dish not found' });
    }
    res.send(dish);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Endpoint to get dishes by category
router.get('/category-dishes', async (req, res) => {
  try {
    const category = req.query.category;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const dishes = await Dish.find({ dishCategory: category });

    // Group dishes by restaurant
    const groupedDishes = dishes.reduce((acc, dish) => {
      if (!acc[dish.restaurant]) {
        acc[dish.restaurant] = [];
      }
      acc[dish.restaurant].push(dish);
      return acc;
    }, {});

    res.json(groupedDishes);
  } catch (error) {
    console.error('Error fetching dishes by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Modified endpoint to fetch dishes by restaurant
router.get('/restaurant-dishes', async (req, res) => {
  try {
    const { restaurant, sortBy } = req.query;
    let query = {};

    // If restaurant is provided, filter by restaurant
    if (restaurant) {
      query.restaurant = restaurant;
    }

    // Sort by popular or all dishes (sortBy can be 'popular' or 'all')
    let sortOptions = {};
    if (sortBy === 'popular') {
      sortOptions = { orderCount: -1 }; // Sort by orderCount descending for popular dishes
    }

    const dishes = await Dish.find(query).sort(sortOptions);
    res.json({ message: 'Dishes retrieved successfully', dishes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve dishes', message: error.message });
  }
});

//fetching dishes for particular restaurant
router.get('/restaurantDishes', async (req, res) => {
  const restaurantName = req.query.restaurant; // Access restaurant name from query parameter

  try {
    const restaurantName = req.query.restaurant; // Access restaurant name from query parameter

    if (!restaurantName) {
      // Fetch all dishes if no restaurant specified (default behavior)
      const dishes = await Dish.find().exec();
      return res.json({ dishes });
    }
    const lowerCaseRestaurantName = restaurantName.toLowerCase(); // Convert to lowercase
    // Replace with your actual database query logic
    // Replace with your actual database query logic with case-insensitive comparison
    const dishes = await Dish.find({ restaurant: { $regex: lowerCaseRestaurantName, $options: 'i' } }).exec();
    res.json({ dishes });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//fetching dishes by category
router.get('/v1/dishes', async (req, res) => {
  try {
    const { category } = req.query; // Get category from query parameter

    let dishes;
    if (category) {
      dishes = await Dish.find({ dishCategory: category }); // Filter by category if provided
    } else {
      dishes = await Dish.find({}); // Retrieve all dishes if no category specified
    }

    res.json({ message: 'Dishes retrieved successfully', dishes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve dishes', message: error.message });
  }
});

router.get('/dishes/details/:dishCode', async (req, res) => {
  const { dishCode } = req.params;

  try {
    // Fetch the dish details from the database
    const dishDetail = await Dish.findOne({ dishCode: dishCode }, '-_id'); // Exclude '_id' field if not needed

    // Check if the dish detail was found
    if (!dishDetail) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dishDetail);
  } catch (error) {
    console.error('Error fetching dish details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/universal-search', async (req, res) => {
  const searchTerm = req.query.q;

  try {
    // Searching across different collections
    const dishes = await Dish.find({ dishName: new RegExp(searchTerm, 'i') });
    const restaurants = await Restaurant.find({ restaurant: new RegExp(searchTerm, 'i') });
    const categories = await Category.find({ dishCategory: new RegExp(searchTerm, 'i') });

    // Combine results
    const results = [
      ...dishes.map(dish => ({ type: 'dish', name: dish.dishName, ...dish._doc })),
      ...restaurants.map(restaurant => ({ type: 'restaurant', name: restaurant.restaurant, ...restaurant._doc })),
      ...categories.map(category => ({ type: 'category', name: category.dishCategory, ...category._doc })),
    ];

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during search' });
  }
});

//RESTAURANT SCHEMA AND ITS ROUTES
const restaurantSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  restaurantImgUrl: { type: String, required: false },
  restaurant: { type: String, required: true },
  dishCategory: { type: String, required: false },
  location: { type: String, required: true },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);


// route to get dishes by restaurant name
router.get('/partner_dishes', async (req, res) => {
  const { restaurantName } = req.query;

  try {
    const dishes = await Dish.find({ restaurant: restaurantName }).sort({ createdAt: -1 });
    res.json({ message: 'Dishes retrieved successfully', dishes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dishes', error });
  }
});


// Check if the partner has any restaurants
router.get('/restaurants/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const restaurants = await Restaurant.find({ partnerId });
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found' });
    }
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
// Fetch partner's restaurants
router.get('/partners/:_id/restaurants', async (req, res) => {
  try {
    const partnerId = req.params._id;

    // Find the partner
    const partner = await Partner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ errors: ['Partner not found'] });
    }

    // Get the partner's restaurants
    // const partnerRestaurants = await partner.restaurants;
    const partnerRestaurants = await Restaurant.find({ partnerId: partner._id }).exec();

    res.json(partnerRestaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['An unexpected error occurred'] });
  }
});


// Add a new restaurant
router.post('/restaurants', async (req, res) => {
  try {
    const { partnerId, restaurant, dishCategory, location, restaurantImgUrl } = req.body;
    const newRestaurant = new Restaurant({
      partnerId,
      restaurant,
      location,
      dishCategory,
      restaurantImgUrl,
    });
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.put('/restaurants/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(updateData);

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const oldRestaurantName = restaurant.restaurant; // Save the original restaurant name

    // Update only the fields present in the request body
    Object.keys(updateData).forEach((key) => {
      restaurant[key] = updateData[key]; // Dynamically update the fields
    });

    // Save the updated restaurant document
    await restaurant.save();

    // Check if the restaurant name was changed and update dishes if necessary
    if (updateData.restaurant && updateData.restaurant !== oldRestaurantName) {
      // Update all dishes with the old restaurant name to the new restaurant name
      await Dish.updateMany(
        { restaurant: oldRestaurantName }, // Match dishes with the old name
        { $set: { restaurant: updateData.restaurant } } // Update to the new name
      );
    }

    res.status(200).json({ message: 'Restaurant and associated dishes updated successfully', restaurant });
  } catch (error) {
    console.error('Error updating restaurant or dishes:', error);
    res.status(500).json({ message: 'Error updating restaurant or dishes', error });
  }
});


// fetch restaurants for menu
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Dish.distinct('restaurant');
    res.json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

//Endpoint to get restaurant details by name// GET route to fetch restaurant location by name
// Your router
router.get('/restaurants/location/:restaurantName', async (req, res) => {
  console.log('Received request for restaurant:', req.params.restaurantName);
  const { restaurantName } = req.params;

  try {
    console.log('Searching for restaurant:', restaurantName);
    const restaurant = await Restaurant.findOne({
      restaurant: { $regex: new RegExp(`^${restaurantName}$`, 'i') }
    });
    console.log('Found restaurant:', restaurant);
    if (!restaurant) {
      console.log('Restaurant not found');
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    console.log('Returning location:', restaurant.location);
    res.status(200).json({ location: restaurant.location });
  } catch (error) {
    console.error('Error fetching restaurant location:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/restaurants/:id', async (req, res) => {
  console.log('Attempting to fetch restaurant details for ID:', req.params.id);
  const { id } = req.params;
  console.log('Restaurants retrieved', id);

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found', id: id });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    console.error('Error in /restaurants/:id route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/restaurants', async (req, res) => {
  const { restaurant, dishCategory } = req.body;

  try {
    let existingRestaurant = await Restaurant.findOne({ restaurant });

    if (!existingRestaurant) {
      const newRestaurant = new Restaurant({
        restaurant,
        dishCategory
      });
      existingRestaurant = await newRestaurant.save();
    }

    res.status(200).json({ success: true, restaurant: existingRestaurant });
  } catch (error) {
    console.error('Error creating or fetching restaurant:', error);
    res.status(500).json({ success: false, message: 'Error' });
  }
});

router.delete('/restaurants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Find the restaurant by ID
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get the restaurant name to identify associated dishes
    const restaurantName = restaurant.restaurant;

    // Delete all dishes associated with this restaurant
    await Dish.deleteMany({ restaurant: restaurantName });

    // Delete the restaurant
    await Restaurant.findByIdAndDelete(id);

    res.status(200).json({ message: 'Restaurant and associated dishes deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Error deleting restaurant', error });
  }
});

//fetching restaurants
router.get('/restaurants/:cuisineType', async (req, res) => {
  try {
    const cuisineType = req.params.cuisineType;
    const restaurants = await Dish.find({ dishCategory: cuisineType }).distinct('restaurant').exec();

    // Remove duplicates
    const uniqueRestaurants = [...new Set(restaurants)];

    res.json(uniqueRestaurants); // Send the restaurants as JSON
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    // Send a JSON response with an error message
    res.status(500).json({ error: 'Server error' });
  }
});




//CATEGORY SCHEMA AND ITS ROUTES
const Category = mongoose.model('Category', new mongoose.Schema({
  dishCategory: { type: String, required: true },
  restaurant: { type: String, required: true },
}));


router.get('/categories', async (req, res) => {
  try {
    const categories = await Dish.distinct('dishCategory');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});


//ORDER SCHEMAS AND ITS ROUTES
const orderDishSchema = new Schema({
  dish: { type: String, required: true },
  dishName: { type: String, required: true },
  quantity: { type: Number, required: true },
  dishPrice: { type: Number, required: true }
});

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  selectedCategory: { type: String, required: false },
  selectedRestaurant: { type: String, required: true },
  customerLocation: { type: String, required: true },
  expectedDeliveryTime: { type: String, required: true },
  dishes: [
    {
      dishCode: { type: String, required: true },
      dishName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  deliveryCharges: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'], default: 'Order received' },
  driverId: { type: String, required: false },
  driverDetails: {
    name: { type: String },
    contactNumber: { type: String },
    vehicleRegistration: { type: String }
  },
  pickedAt: { type: Date }
});

const Order = model('Order', orderSchema);


//Function to generate custom order IDs
async function generateOrderId() {
  const latestOrder = await Order.findOne({}, {}, { sort: { 'createdAt': -1 } });
  if (latestOrder) {
    const latestOrderId = latestOrder?.orderId?.substring(1); // Extract numeric part
    const nextOrderId = parseInt(latestOrderId) + 1;
    return 'O' + String(nextOrderId).padStart(4, '0'); // Format as O0001, O0002, etc.
  } else {
    return 'O0001'; // Initial ID if no existing orders
  }
}

// Function to create a new order
async function createOrder(orderData) {
  try {
    const orderId = await generateOrderId(); // Generate custom order ID
    orderData.orderId = orderId; // Assign custom ID to the order data
    const { selectedCategory, selectedRestaurant, ...otherOrderData } = orderData;
    const newOrder = new Order({
      ...otherOrderData,
      selectedCategory,
      selectedRestaurant
    });
    if (!selectedCategory || !selectedRestaurant) {
      throw new Error('Missing required order details: selectedCategory and selectedRestaurant');
    }
    const savedOrder = await newOrder.save();
    return savedOrder;
  } catch (error) {
    throw error;
  }
}

module.exports = { Order, createOrder };
// Your route handler for creating a new order
router.post('/orders', async (req, res) => {
  try {
    // Extract order data from the request body
    const orderData = req.body;

    // Generate custom order ID and assign it to the order data
    const orderId = await generateOrderId();
    orderData.orderId = orderId;

    // Create a new order and save it to the database
    const newOrder = await createOrder(orderData);

    // Send a success response with the newly created order
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    // Handle any errors and send an error response
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Endpoint to save order
router.post('/save-order', async (req, res) => {
  const orderDetails = req.body;
  try {
    await saveOrder(orderDetails);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Route to fetch orders for a partner
// Route to fetch all orders
router.get('/orders', async (req, res) => {
  try {
    // Fetch all orders from the database
    const allOrders = await Order.find().exec();

    // Send the response with all orders
    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Endpoint to retrieve orders by user ID
router.get('/user/orders', async (req, res) => {
  const userId = req.user._id; // Assuming you have user authentication in place and req.user contains the logged-in user info

  try {
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
//find orders by id
router.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (order) {
      res.json(order);

    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// server.js or appropriate routes file
router.get('/driverOrders', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'Processed and packed' });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


// Route to fetch delivered orders and calculate total sales and commission
router.get('/orders/delivered', async (req, res) => {
  try {
    // Find all delivered orders
    const deliveredOrders = await Order.find({ delivered: true });

    // Calculate total sales and commission
    let totalSales = 0;
    deliveredOrders.forEach(order => {
      totalSales += order.totalPrice;
    });

    const commission = totalSales * 0.1; // Assuming commission is 10% of total sales

    // Send the delivered orders, total sales, and commission in the response
    res.json({ orders: deliveredOrders, totalSales, commission });
  } catch (error) {
    console.error('Error fetching delivered orders:', error);
    res.status(500).json({ error: 'Failed to fetch delivered orders' });
  }
});

//WORKINGS AFTER MPESA PAYMENT HAS BEEN DONE

router.post('/paidOrder', async (req, res) => {
  try {
    const orderDetails = req.body;

    console.log('Order details received:', orderDetails);

    // Generate a unique order ID
    orderDetails.orderId = uuidv4();
    orderDetails.status = 'Order received';

    // Save order to database
    const savedOrder = await saveOrder(orderDetails);

    // Fetch the restaurant and partner details
    const restaurant = await Restaurant.findOne({ restaurant: orderDetails.selectedRestaurant }).populate('partnerId');

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Notify the partner
    if (restaurant.partnerId && connectedPartners[restaurant.partnerId.toString()]) {
      const partnerSocketId = connectedPartners[restaurant.partnerId.toString()];
      io.to(partnerSocketId).emit('newOrder', {
        message: 'You have a new order!',
        orderId: savedOrder.orderId,
        orderDetails: orderDetails,
      });
      console.log(`Notification sent to partner: ${restaurant.partnerId}`);
    }
    // Return order ID in the response
    res.status(200).json({
      message: 'Order saved successfully',
      orderId: savedOrder.orderId // Send back the orderId
    });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Function to save order details in the database
async function saveOrder(orderDetails) {
  const order = new Order({
    orderId: orderDetails.orderId,
    phoneNumber: orderDetails.phoneNumber,
    selectedCategory: orderDetails.selectedCategory,
    selectedRestaurant: orderDetails.selectedRestaurant,
    customerLocation: orderDetails.customerLocation,
    expectedDeliveryTime: orderDetails.expectedDeliveryTime,
    dishes: orderDetails.dishes,
    deliveryCharges: orderDetails.deliveryCharges,
    totalPrice: orderDetails.totalPrice,
    delivered: false,
    paid: true, // Assuming the payment was successful
    status: orderDetails.status
  });

  // Conditionally add userId and customerName if they exist
  if (orderDetails.userId) {
    order.userId = orderDetails.userId;
  }

  if (orderDetails.customerName) {
    order.customerName = orderDetails.customerName;
  }

  // try {
  //   await order.save();
  try {
    const savedOrder = await order.save();
    return savedOrder; // Return the saved order to access its fields

    // console.log('Order saved successfully');
  } catch (error) {
    console.error('Error saving order:', error);
    throw error; // Rethrow the error so that it can be handled by the caller
  }
}
// Update order status
router.patch('/updateOrderStatus/:orderId', async (req, res) => {
  console.log('Updating order status for:', req.params.orderId);
  console.log('Request body:', req.body);
  try {
    const { orderId } = req.params;
    const { status, driverDetails, pickedAt } = req.body; // Added new fields from frontend

    // Find order by orderId (UUID) and update the status
    const order = await Order.findOneAndUpdate(
      { orderId: orderId }, // Match the UUID
      { status, driverDetails, pickedAt },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
});
// Backend API route to accept an order
router.patch('/driverUpdateOrderStatus/:orderId', async (req, res) => {
  console.log('Updating order status for:', req.params.orderId); // Check if orderId is correctly received
  console.log('Request body:', req.body); // Ensure driverId and status are included

  try {
    const { orderId } = req.params; // Get orderId from the URL parameter
    const { status, driverId } = req.body; // Ensure you're receiving driverId and status

    // Find and update the order using the orderId field
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId }, // Use the orderId field in the query
      { status, driverId }, // Set the new status and driverId
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      console.log('Order not found for ID:', orderId); // Log if order is not found
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order updated successfully:', updatedOrder); // Log the updated order
    res.json(updatedOrder); // Respond with the updated order
  } catch (error) {
    console.error('Error updating order status:', error); // Log the error
    res.status(500).json({ message: 'Error updating order status' }); // Respond with a 500 error
  }
});


router.patch('/revertOrderStatus/:orderId', async (req, res) => {
  console.log('Reverting order status for:', req.params.orderId); // Log the orderId
  console.log('Request body:', req.body); // Ensure driverId is included

  try {
    const { orderId } = req.params; // Get orderId from the URL parameter
    const { driverId } = req.body; // Extract driverId from request body

    // Find the order using the orderId
    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      console.log('Order not found for ID:', orderId); // Log if order is not found
      return res.status(404).json({ message: 'Order not found' });
    }

    // Logic to revert the order status (this will depend on your specific flow)
    // For instance, reverting from 'Delivered' to 'Dispatched' or to the previous status
    let newStatus;
    switch (order.status) {
      case 'Delivered':
        newStatus = 'Dispatched';
        break;
      case 'Dispatched':
        newStatus = 'Processed and packed';
        break;
      case 'Processed and packed':
        newStatus = 'Order received';
        break;
      default:
        return res.status(400).json({ message: 'Cannot revert status any further' });
    }

    // Update the order with the reverted status and remove the driverId
    order.status = newStatus;
    order.driverId = null; // Optionally clear driverId if reverting removes driver assignment
    const revertedOrder = await order.save();

    console.log('Order status reverted successfully:', revertedOrder); // Log success
    res.json(revertedOrder); // Respond with the reverted order details

  } catch (error) {
    console.error('Error reverting order status:', error); // Log any errors
    res.status(500).json({ message: 'Error reverting order status' }); // Respond with a 500 error
  }
});

// GET order by ID
router.get('/getOrder/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    // Fetch the order details from the database
    const order = await Order.findById(orderId).populate('driverId'); // Assuming driverId references a Driver model

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send the order details back to the client
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/fetchOrderByStatus/:orderId/:driverId', async (req, res) => {
  const { orderId, driverId } = req.params;

  try {
    // Find the order by matching the order ID and driver ID
    const order = await Order.findOne({ orderId: orderId, driverId: driverId });

    // If no order is found, return a 404 status with a message
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Respond with the found order
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// New route to fetch dispatched orders for a specific driver
router.get('/fetchDriverDispatchedOrders/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const dispatchedOrders = await Order.find({ driverId, status: 'Dispatched' });
    res.json(dispatchedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dispatched orders' });
  }
});

// Backend API route to fetch orders accepted by a specific driver
router.get('/fetchOrdersByDriver/:driverId', async (req, res) => {
  const { driverId } = req.params;

  try {
    const orders = await Order.find({ driverId, status: 'Dispatched' });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this driver' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver\'s orders' });
  }
});


// Fetch undelivered orders
router.get('/orders/undelivered', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Delivered' } });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});



//SPECIAL ORDER SCHEMA AND ITS ROUTES
const specialOrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  deliveryTime: { type: String, required: true },
  orderDetails: { type: String, required: true },
  specialInstructions: { type: String },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'], default: 'Order received' },
  createdAt: { type: Date, default: Date.now }
});
const SpecialOrder = mongoose.model('SpecialOrder', specialOrderSchema);


//make special orders
router.post('/special-orders', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryLocation,
      deliveryDate,
      deliveryTime,
      orderDetails,
      specialInstructions
    } = req.body;
    const newOrder = new SpecialOrder({
      customerName,
      customerEmail,
      customerPhone,
      deliveryLocation,
      deliveryDate,
      deliveryTime,
      orderDetails,
      specialInstructions,
      status: 'Order received' // or any other initial status
    });
    await newOrder.save();
    res.status(201).send({ message: 'Special order placed successfully!' });
  } catch (error) {
    console.error('Error placing special order:', error);
    res.status(500).send({ message: 'Failed to place the order. Please try again.' });
  }
});
//OUTSIDE/EVENT ORDER CATERING SCHEMAS AND ITS ROUTES
const eventOrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  message: { type: String }
});

const EventOrder = mongoose.model('EventOrder', eventOrderSchema);

router.post('/submit-event-order', (req, res) => {
  const { name, email, phone, eventDate, eventLocation, message } = req.body;

  // Validate the request body
  if (!name || !email || !phone || !eventDate || !eventLocation) {
    return res.status(400).send('All fields are required');
  }

  // Create a new event order
  const eventOrder = new EventOrder({
    name,
    email,
    phone,
    eventDate,
    eventLocation,
    message
  });

  // Save to the database
  eventOrder.save()
    .then(() => res.status(200).send('Event order submitted successfully'))
    .catch(err => {
      console.error('Error saving event order:', err);
      res.status(500).send('Internal Server Error');
    });
});



//CONFERENCE SCHEMA AND ITS ROUTES

const ConferenceSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  venueName: { type: String, required: true },
  address: { type: String, required: true },
  gpsCoordinates: { type: String, required: false },
  seatingCapacity: { type: String, required: true },
  layoutOptions: { type: String, required: false },
  roomDimensions: { type: String, required: false },
  avEquipment: { type: String, required: false },
  cateringServices: { type: String, required: false },
  wiFiAccess: { type: String, required: false },
  airConditioning: { type: String, required: false },
  parkingFacilities: { type: String, required: false },
  accessibility: { type: String, required: false },
  pricingStructure: { type: String, required: true },
  bookingAvailability: { type: String, required: true },
  paymentOptions: { type: String, required: true },
  venueImagesUrl: { type: [String], required: false },
  videoToursUrl: { type: [String], required: false },
  floorPlansUrl: { type: [String], required: false },
  eventPlanningAssistance: { type: String, required: false },
  decorationServices: { type: String, required: false },
  transportServices: { type: String, required: false },
  securityServices: { type: String, required: false },
  contactPerson: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
});

const Conference = mongoose.model('Conference', ConferenceSchema);


router.post('/conferences', (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      console.error('Error during file upload:', err);
      return res.status(500).json({ error: 'Failed to upload files.' });
    }

    // console.log('req.files:', req.files);
    // console.log('req.body:', req.body);
    // console.log('req.files:', JSON.stringify(req.files, null, 2));
    // console.log('req.body:', JSON.stringify(req.body, null, 2));

    const {
      venueName, address, gpsCoordinates, seatingCapacity, layoutOptions, roomDimensions,
      avEquipment, cateringServices, wiFiAccess, airConditioning, parkingFacilities,
      accessibility, pricingStructure, bookingAvailability, paymentOptions,
      eventPlanningAssistance, decorationServices, transportServices, securityServices,
      contactPerson, phoneNumber, emailAddress, partnerId
    } = req.body;

    const venueImagesUrl = req.files['venueImages'] ? req.files['venueImages'].map(file => file.path) : [];
    const videoToursUrl = req.files['videoTours'] ? req.files['videoTours'].map(file => file.path) : [];
    const floorPlansUrl = req.files['floorPlans'] ? req.files['floorPlans'].map(file => file.path) : [];

    const newConference = new Conference({
      venueName, address, gpsCoordinates, seatingCapacity, layoutOptions, roomDimensions,
      avEquipment, cateringServices, wiFiAccess, airConditioning, parkingFacilities,
      accessibility, pricingStructure, bookingAvailability, paymentOptions,
      venueImagesUrl, videoToursUrl, floorPlansUrl, eventPlanningAssistance, decorationServices,
      transportServices, securityServices, contactPerson, phoneNumber, emailAddress, partnerId
    });

    try {
      const savedConference = await newConference.save();
      // console.log('Conference saved:', savedConference); // Debug log
      res.status(201).json({ message: 'Conference added successfully!', data: savedConference });
    } catch (error) {
      console.error('Error during conference creation:', error);
      res.status(500).json({ error: 'Failed to create conference.' });
    }
  });
});



// Route to get all conferences for a specific partner
router.get('/conferences/:partnerId', async (req, res) => {
  const { partnerId } = req.params;

  try {
    const conferences = await Conference.find({ partnerId });
    res.status(200).json(conferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conferences' });
  }
});
// Fetch conference by venueName
router.get('/venue/:venueName', async (req, res) => {
  try {
    const conference = await Conference.findOne({ venueName: req.params.venueName });
    if (!conference) {
      return res.status(404).json({ message: 'Conference not found' });
    }
    res.json(conference);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/conferences/:id', upload, async (req, res) => {
  try {
    // console.log('req.files:', req.files);
    // console.log('req.body:', JSON.stringify(req.body, null, 2));

    const id = req.params.id;
    const conferenceId = req.body.conferenceId || req.query.conferenceId;

    if (!conferenceId) {
      return res.status(400).json({ message: 'Conference ID is required' });
    }

    const conferenceToUpdate = await ConferenceModel.findById(conferenceId);

    if (!conferenceToUpdate) {
      return res.status(404).json({ message: 'Conference not found' });
    }

    // Update conference fields
    conferenceToUpdate.venueName = req.body.venueName || conferenceToUpdate.venueName;
    conferenceToUpdate.address = req.body.address || conferenceToUpdate.address;
    conferenceToUpdate.gpsCoordinates = req.body.gpsCoordinates || conferenceToUpdate.gpsCoordinates;
    conferenceToUpdate.seatingCapacity = req.body.seatingCapacity || conferenceToUpdate.seatingCapacity;
    conferenceToUpdate.pricingStructure = req.body.pricingStructure || conferenceToUpdate.pricingStructure;
    conferenceToUpdate.contactPerson = req.body.contactPerson || conferenceToUpdate.contactPerson;
    conferenceToUpdate.phoneNumber = req.body.phoneNumber || conferenceToUpdate.phoneNumber;
    conferenceToUpdate.emailAddress = req.body.emailAddress || conferenceToUpdate.emailAddress;

    // Handle layout options
    if (req.body.layoutOptions && Array.isArray(req.body.layoutOptions)) {
      conferenceToUpdate.layoutOptions = req.body.layoutOptions;
    } else if (req.body.layoutOptions) {
      conferenceToUpdate.layoutOptions = [req.body.layoutOptions];
    }

    // Save updated conference
    await conferenceToUpdate.save();

    // Process uploaded files
    const venueImages = req.files.filter(file => file.fieldname === 'venueImages');
    const videoTours = req.files.filter(file => file.fieldname === 'videoTours');
    const floorPlans = req.files.filter(file => file.fieldname === 'floorPlans');

    // Process each file type separately
    processVenueImages(venueImages);
    processVideoTours(videoTours);
    processFloorPlans(floorPlans);

    res.json({
      success: true,
      message: 'Conference updated successfully',
      data: { ...conferenceToUpdate._doc }
    });

  } catch (error) {
    console.error('Error updating conference:', error);
    res.status(500).json({ message: 'An error occurred while updating the conference.' });
  }
});

// Helper functions to process uploaded files
function processVenueImages(images) {
  images.forEach(image => {
    fs.renameSync(image.path, `${process.cwd()}${image.destination}/${image.filename}`);
  });
}

function processVideoTours(tours) {
  tours.forEach(tour => {
    fs.renameSync(tour.path, `${process.cwd()}${tour.destination}/${tour.filename}`);
  });
}

function processFloorPlans(plans) {
  plans.forEach(plan => {
    fs.renameSync(plan.path, `${process.cwd()}${plan.destination}/${plan.filename}`);
  });
}
// Route to get a conference
router.get('/conference', async (req, res) => {
  const { venueName } = req.query;
  try {
    const conference = await Conference.findOne({ venueName });
    if (!conference) {
      return res.status(404).send('Conference not found');
    }
    res.json(conference);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//route to fetch all the conferences
// GET route for fetching conferences
router.get('/conferences', async (req, res) => {
  try {
    // Fetch all conference documents from the database
    const conferences = await Conference.find({});
    // Send the fetched data as JSON
    res.status(200).json(conferences);
  } catch (error) {
    // Handle any errors that occur during the fetch
    console.error('Error fetching conferences:', error);
    res.status(500).json({ message: 'Failed to fetch conferences' });
  }
});

// Delete a specific conference
router.delete('/conferences/:id', async (req, res) => {
  try {
    const deletedConference = await Conference.findByIdAndDelete(req.params.id);

    if (!deletedConference) {
      return res.status(404).json({ message: 'Conference not found' });
    }

    res.status(200).json({ message: 'Conference deleted successfully' });
  } catch (error) {
    console.error('Error deleting conference:', error);
    res.status(500).json({ message: 'Error deleting conference', error });
  }
});


//RATING SCHEMA AND ITS ROUTES
const ratingSchema = new Schema({
  // user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  item_id: { type: Schema.Types.ObjectId, required: true },
  item_type: { type: String, enum: ['Dish', 'Restaurant'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'], default: 'Order received' },
  createdAt: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;

router.post('/rating', async (req, res) => {
  // console.log(item_id, item_type, rating);
  const { item_id, item_type, rating } = req.body;
  // console.log(item_id, item_type, rating);
  try {
    // Validate input
    if (!item_id || !item_type || rating == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create a new rating
    const newRating = new Rating({
      item_id,
      item_type,
      rating
    });

    await newRating.save();

    // Update the average rating for the item
    const ratings = await Rating.find({ item_id, item_type });
    const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length) : 0;
    const ratingCount = ratings.length;

    let itemModel;

    if (item_type === 'Dish') {
      itemModel = Dish;
    } else if (item_type === 'Restaurant') {
      itemModel = Restaurant;
    } else {
      throw new Error('Invalid item type');
    }

    await itemModel.findByIdAndUpdate(item_id, { averageRating, ratingCount });

    res.status(201).json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
});
router.get('/rating/:item_id/:item_type', async (req, res) => {
  const { item_id, item_type } = req.params;

  try {
    let itemModel;
    if (item_type === 'Dish') {
      itemModel = Dish;
    } else if (item_type === 'Restaurant') {
      itemModel = Restaurant;
    } else {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    const item = await itemModel.findById(item_id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      averageRating: item.averageRating.toFixed(2),
      ratingCount: item.ratingCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/dishes-and-restaurants', async (req, res) => {
  try {
    const dishes = await Dish.find().populate('restaurant');
    const restaurants = await Restaurant.find();

    const dishesWithRatings = await Promise.all(dishes.map(async (dish) => {
      const ratings = await Rating.find({ item_id: dish._id, item_type: 'Dish' });
      const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length) : 0;
      const ratingCount = ratings.length;
      return { ...dish.toObject(), averageRating, ratingCount };
    }));

    const restaurantsWithRatings = await Promise.all(restaurants.map(async (restaurant) => {
      const ratings = await Rating.find({ item_id: restaurant._id, item_type: 'Restaurant' });
      const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length) : 0;
      const ratingCount = ratings.length;
      return { ...restaurant.toObject(), averageRating, ratingCount };
    }));

    res.json({ dishes: dishesWithRatings, restaurants: restaurantsWithRatings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// USER HISTORY SCHEMA AND ITS ROUTES
const userSearchHistorySchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dishCode: { type: String, required: true },
  searchedAt: { type: Date, default: Date.now },
});

const UserSearchHistory = mongoose.model('UserSearchHistory', userSearchHistorySchema);

router.get('/userSearchHistory', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const userSearchHistory = await UserSearchHistory.find({ userId }); // Adjust based on your schema
    if (!userSearchHistory) {
      return res.status(404).json({ success: false, message: 'No search history found' });
    }

    res.json({ success: true, searchHistory: userSearchHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


//DOING SEARCHES IN DATABASE ROUTES

router.get('/details', async (req, res) => {
  const { id, type } = req.query;

  try {
    let result;
    if (type === 'dishes') {
      result = await Dish.findById(id);
    } else if (type === 'restaurants') {
      result = await Restaurant.findById(id);
    } else if (type === 'categories') {
      result = await dishCategory.findById(id);
    }

    if (!result) {
      return res.status(404).send('No details found');
    }

    res.send(result);
  } catch (error) {
    console.error('Error fetching details:', error);
    res.status(500).send('Server error');
  }
});
router.get('/search', async (req, res) => {
  // console.log('query', req.query);
  const { query, type } = req.query;
  // console.log('query', req.query);

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    let results = [];

    if (!type || type === 'dishes') {
      results.push(...await Dish.find({ dishName: new RegExp(query, 'i') }));
    }

    if (!type || type === 'restaurants') {
      results.push(...await Restaurant.find({ restaurant: new RegExp(query, 'i') }));
    }

    if (!type || type === 'categories') {
      results.push(...await Category.find({ dishCategory: new RegExp(query, 'i') }));
    }

    res.json(results);
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/searchA', async (req, res) => {
  const { query, type } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    let results = [];

    if (!type || type === 'dishes') {
      results.push(...await Dish.find({ dishName: new RegExp(query, 'i') }));
    }

    if (!type || type === 'restaurants') {
      results.push(...await Restaurant.find({ restaurant: new RegExp(query, 'i') }));
    }

    if (!type || type === 'categories') {
      results.push(...await Category.find({ categoryName: new RegExp(query, 'i') }));
    }

    res.json(results);
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/search', async (req, res) => {
  const query = req.query.query;
  const type = req.query.type;

  if (!query || !type) {
    return res.status(400).json({ error: 'Missing query or type parameter' });
  }

  try {
    let results;
    switch (type) {
      case 'dishes':
        results = await Dish.find({
          $or: [
            { dishName: { $regex: query, $options: 'i' } },
            { dishDescription: { $regex: query, $options: 'i' } }
          ]
        });
        break;
      case 'restaurants':
        results = await Dish.find({ restaurant: { $regex: query, $options: 'i' } }).distinct('restaurant');
        break;
      case 'categories':
        results = await Dish.find({ dishCategory: { $regex: query, $options: 'i' } }).distinct('dishCategory');
        break;
      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }

    res.json({ results });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function searchData(query, type) {
  const regex = new RegExp(query, 'i'); // Case-insensitive regex for partial matching
  switch (type) {
    case 'dishes':
      return await Dish.find({
        $or: [
          { dishName: regex },
          { dishDescription: regex },
          { dishCategory: regex },
          { restaurant: regex },
        ]
      });
    case 'restaurants':
      return await Dish.find({ dishCategory: regex }).distinct('restaurant');
    case 'categories':
      return await Dish.find({ dishCategory: regex }).distinct('dishCategory');
    default:
      return [];
  }
}

router.get('/searchAny', async (req, res) => {
  // console.log('Received search request');
  const searchTerm = req.query.q;
  const type = req.query.type;
  // console.log('Received request:', req.query);
  if (!searchTerm || !type) {
    // console.log('Bad request: Missing required query parameters');
    return res.status(400).json({ error: 'Bad Request', message: 'Missing required query parameters: q and type' });
  }

  let filter = {};
  if (type === 'suggestion') {
    if (!searchTerm) {
      return res.json([]); // Return empty array for empty search
    }
    filter.$or = [
      { dishName: { $regex: searchTerm, $options: 'i' } },
      { dishDescription: { $regex: searchTerm, $options: 'i' } },
      { dishCategory: { $regex: searchTerm, $options: 'i' } }
    ];
  } else if (type === 'exact') {
    filter = { name: searchTerm };
  }

  try {
    const results = await Dish.find(filter).exec(); // Use the model to find documents
    // console.log('Search results:', results);
    res.json(results);
  } catch (err) {
    console.error('Error occurred during the search:', err);
    res.status(500).json({ error: 'An error occurred during the search.', details: err.message });
  }
});


// Route for category suggestions
router.get('/categories/suggestions', async (req, res) => {
  const { categoryName } = req.query;
  try {
    const categories = await Category.find({ name: { $regex: categoryName, $options: 'i' } });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching category suggestions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for restaurant suggestions
router.get('/restaurants/suggestions', async (req, res) => {
  const { restaurantName } = req.query;
  try {
    const restaurants = await Restaurant.find({ name: { $regex: restaurantName, $options: 'i' } });
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurant suggestions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// New track search endpoint
router.post('/trackSearch', async (req, res) => {
  try {
    const { userId, dishCode } = req.body;

    if (!userId || !dishCode || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    const newSearch = new UserSearchHistory({
      userId: mongoose.Types.ObjectId(userId),
      dishCode
    });
    await newSearch.save();

    res.status(201).json({ message: 'Search history recorded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//DRIVER'S SCHEMA AND ROUTES
const driverSchema = new mongoose.Schema({
  OfficialNames: { type: String, required: true },
  IDNumber: { type: Number, required: true, unique: true },
  DriverLicenceNumber: { type: String, required: true },
  NumberPlate: { type: String, required: false },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  location: { type: String, default: '' },
  contactNumber: { type: Number, default: 0 },
  vehicleType: { type: String, default: '' },
  driverImage: { type: String, default: null }
});

// Pre-save hook to hash the password
driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
driverSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Driver = mongoose.model('Driver', driverSchema);


router.get('/driver', authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id); // Assuming req.user.id is set after token authentication
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);  // Ensure driver object is returned in JSON format
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Backend Example - Driver Signup (Express.js)


const generateAuthToken = (user) => {
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });  // Adjust the secret and expiration as needed
  return token;
};
router.post('/driverSignup', async (req, res) => {
  const { OfficialNames, IDNumber, DriverLicenceNumber, NumberPlate, password } = req.body;

  // Create a new driver instance using the DriverModel
  const newDriver = new Driver({
    OfficialNames,
    IDNumber,
    DriverLicenceNumber,
    NumberPlate,
    password,
    // MongoDB automatically generates an _id field
  });

  try {
    await newDriver.save();

    // Generate a token after saving the driver
    const token = generateAuthToken(newDriver); // JWT generation logic

    // Respond with the driver's ID and any other necessary data
    res.status(201).json({
      _id: newDriver._id,  // Ensure this is included
      token,  // If you're returning a token as well
      driver: {
        // Return the MongoDB generated _id as driverId
        driverId: newDriver._id, // Use MongoDB's generated ID
        OfficialNames: newDriver.OfficialNames,
        IDNumber: newDriver.IDNumber,
        DriverLicenceNumber: newDriver.DriverLicenceNumber,
        NumberPlate: newDriver.NumberPlate,
        password: newDriver.password
      },
    });
  } catch (err) {
    console.error('Error during driver signup:', err.message);
    res.status(400).send(err.message); // Return error message
  }
});

router.post('/driverLogin', async (req, res) => {
  console.log('Received login request:', req.body); // Log incoming request body

  try {
    const { IDNumber, password } = req.body;
    const driver = await Driver.findOne({ IDNumber });

    if (!driver) {
      console.log('Driver not found for ID:', IDNumber);
      return res.status(400).json({ message: 'Driver not found' });
    }

    // Log stored password and input password
    console.log('Stored hashed password:', driver.password);
    console.log('Password being compared:', password);

    // Compare the password
    const isMatch = await bcrypt.compare(password, driver.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid credentials for ID:', IDNumber);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: driver._id,
        role: 'driver',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error); // Log the error
    res.status(500).json({ error: 'Failed to login driver' });
  }
});

router.get('/driverDetails/:id', async (req, res) => {
  try {
    const driverId = req.params.id; // Get driver ID from request parameters

    // Find the driver by ID
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Return driver details including the driver ID
    res.status(200).json({
      OfficialNames: driver.OfficialNames,
      IDNumber: driver.IDNumber,
      DriverLicenceNumber: driver.DriverLicenceNumber,
      NumberPlate: driver.NumberPlate,
      location: driver.location,
      contactNumber: driver.contactNumber,
      vehicleType: driver.vehicleType,
      driverImage: driver.driverImage,
      _id: driver._id // Include the driver ID
    });
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET driver details by driverId
router.get('/getDriverDetails/:driverId', async (req, res) => {
  try {
    const driverId = req.params.driverId;

    // Fetch the driver's details from the database
    const driver = await Driver.findById(driverId);

    // If driver not found, return an error
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Return driver details
    res.status(200).json({
      name: driver.OfficialNames,
      contactNumber: driver.contactNumber,
      vehicleRegistration: driver.NumberPlate
    });
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.patch('/driverDetails', upload, async (req, res) => {
  console.log("Request received:", req.body);

  const { location, contactNumber, vehicleType, driverId } = req.body; // Destructure location, contactNumber, vehicleType, and driverId from request body
  const driverImage = req.file ? `/uploads/images/${req.file.filename}` : null; // Handle uploaded image

  // Ensure driverId is provided and valid
  if (!driverId) {
    return res.status(400).json({ message: 'Driver ID is required' });
  }

  try {
    // Build the update object dynamically
    const updateData = { location, contactNumber, vehicleType };

    // Only add driverImage if a new image was uploaded
    if (driverImage) {
      updateData.driverImage = driverImage;
    }

    // Find the driver by driverId and update the details
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId, // Use driverId from request body to find driver
      updateData, // Update with location, vehicleType, and optionally driverImage
      { new: true, runValidators: true } // Return updated document after validation
    );

    // Handle case where driver is not found
    if (!updatedDriver) {
      console.log("Driver not found");
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Successfully updated the driver details
    res.status(200).json({
      message: 'Driver details updated successfully',
      driver: updatedDriver
    });
  } catch (error) {
    // Handle any errors during the update
    console.error('Error updating driver details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


const dailyEarningsSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  driverDetails: {
    OfficialNames: { type: String },
    contactNumber: { type: String },
    NumberPlate: { type: String }
  },
  date: { type: String, required: true },
  orders: [{
    orderId: { type: String, required: true },
    netPay: { type: Number, required: true },
    paidStatus: { type: String, enum: ['Paid', 'Not Paid'], default: 'Not Paid' }
  }],
  totalEarnings: { type: Number, default: 0 }
});

const DailyEarnings = mongoose.model('DailyEarnings', dailyEarningsSchema);

// Route to get daily earnings for a specific date
router.get('/daily-earnings', async (req, res) => {
  const { date, driverId } = req.query; // Extract driverId from the query
  console.log("Date:", date, "Driver ID:", driverId);
  console.log("Received Driver ID:", driverId); // Debugging log
  if (!driverId) {
    return res.status(400).json({ message: "Driver ID is required." });
  }


  try {
    // Use driverId from the query instead of req.user.id
    const earnings = await DailyEarnings.findOne({ driverId, date });
    if (!earnings) {
      return res.status(404).json({ message: "No earnings found for this date." });
    }
    res.json(earnings);
    console.log("Earnings:", earnings);
  } catch (error) {
    console.error("Error retrieving daily earnings:", error);
    res.status(500).json({ message: "Server error", error: error.message }); // Log the actual error message for debugging
  }
});

router.get('/get-driver-earnings', async (req, res) => {
  const { driverId, date } = req.query;

  try {
    const earnings = await DailyEarnings.findOne({ driverId, date });
    if (!earnings) {
      return res.status(404).json({ message: "No earnings found for the date." });
    }

    res.json({ orders: earnings.orders, totalEarnings: earnings.totalEarnings });
  } catch (error) {
    console.error("Error fetching daily earnings:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post('/update-earnings', async (req, res) => {
  console.log("Request Body:", req.body);
  const { date, driverId, driverDetails, orderId, netPay, paidStatus } = req.body;

  if (!driverId) {
    return res.status(400).json({ message: "Driver ID is required." });
  }

  try {
    // Add the new order data
    const result = await DailyEarnings.findOneAndUpdate(
      { driverId: driverId, date },  // Unique per driver per day
      {
        $setOnInsert: { driverDetails: driverDetails, date: date },
        $push: { orders: { orderId, netPay, paidStatus } },
        $inc: { totalEarnings: netPay }
      },
      { upsert: true, new: true }
    );

    res.json(result);
    console.log(result);
  } catch (error) {
    console.error("Error updating daily earnings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/// GET all driver earnings
router.get('/driverEarnings', async (req, res) => {
  try {
    const earningsData = await DailyEarnings.find();

    // If no earnings found
    if (!earningsData || earningsData.length === 0) {
      return res.status(404).json({ message: 'No earnings found' });
    }

    // Send the earnings data as the response
    res.status(200).json(earningsData);
  } catch (error) {
    console.error('Error fetching driver earnings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//PAYMENTS AND UPDATE ROUTES
router.post('/updatePaidStatus', async (req, res) => {
  // console.log('Received updatePaidStatus request');
  const { restaurant, orderIds } = req.body;
  // console.log(restaurant, orderIds);
  //console.log(Order.find().explain('executionStats'));
  try {
    // Execute the updateMany operation
    const result = await Order.updateMany(
      { selectedRestaurant: restaurant, orderId: { $in: orderIds } },
      { $set: { paid: true } }
    );

    // Log the response from the update operation
    // console.log(result);

  } catch (error) {
    console.error('Error updating orders:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


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


// Route to handle Cash on Delivery (COD) payment method

router.post('/cash/pay', async (req, res) => {
  try {
    const { phoneNumber, email, selectedRestaurant, customerLocation, expectedDeliveryTime, dishes, deliveryCharges, totalPrice, userId, customerName } = req.body;

    console.log('Received cash order:', { phoneNumber, email, selectedRestaurant, customerLocation, expectedDeliveryTime, dishes, deliveryCharges, totalPrice });

    // Generate unique order ID
    const orderId = uuidv4();

    // Find restaurant details to notify the partner
    const restaurant = await Restaurant.findOne({ restaurant: selectedRestaurant }).populate('partnerId');

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Save order to the database
    const order = new Order({
      orderId,
      phoneNumber,
      email,
      selectedRestaurant: selectedRestaurant,  // Ensure consistency with paid orders
      customerLocation,
      expectedDeliveryTime,
      dishes,
      deliveryCharges,
      totalPrice,
      paymentMethod: 'cash',
      paid: false, // Explicitly marking as unpaid
      status: 'Order received', // Align with paid orders
      delivered: false,
    });

    // Add userId and customerName if available
    if (userId) {
      order.userId = userId;
    }
    if (customerName) {
      order.customerName = customerName;
    }

    await order.save();

    console.log('Cash order saved successfully:', order);

    if (restaurant.partnerId) {
      notifySupplier(order);
    } else {
      console.log(`No partner ID associated with the restaurant: ${selectedRestaurant}`);
    }

    // Send email confirmation
    try {
      await sendEmailNotification({
        to: email,
        subject: `Order Confirmation - ${orderId}`,
        body: `Your order has been placed successfully. Your order ID is ${orderId}. It will be delivered to ${customerLocation} by ${expectedDeliveryTime}.`,
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    // Respond with success
    res.status(200).json({
      message: 'Order placed successfully with Cash on Delivery!',
      orderId,
    });

  } catch (error) {
    console.error('Error saving cash order:', error);
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
});


// TESTMONIALS SECTION 

const testimonials = [
  { message: "The food was amazing and the service was excellent!", name: "John Doe" },
  { message: "A wonderful experience with delicious meals.", name: "Jane Smith" }
];

router.get('/testimonials', (req, res) => {
  res.json({ testimonials });
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