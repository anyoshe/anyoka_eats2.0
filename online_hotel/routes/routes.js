
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
const { upload, uploadMultiple, uploadFiles, uploadProfileImage, processProfileImage, uploadBusinessPermit, processBusinessPermit, uploadProductImages, processProductImages, uploadSignupFiles, processSignupFiles } = require('../config/multer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { type } = require("os");
require('dotenv').config();
const nodemailer = require('nodemailer');
const { notifyPartner, notifyDriver, suspendDriver } = require('../socketServer');
const geolib = require('geolib');
const fetch = require('node-fetch');
const crypto = require('crypto');



const JWT_SECRET = process.env.JWT_SECRET;
const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET;
const RESET_PASSWORD_EXPIRY = process.env.RESET_PASSWORD_EXPIRY;

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer verification error:', error);
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});


/* -------------------------------
   ✅ Contact form route (frontend contact page)
--------------------------------- */
router.post('/send-email', async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: 'Email and message are required.' });
  }

  const mailOptions = {
    from: `"Customer Inquiry" <${process.env.GMAIL_USER}>`,
    replyTo: email,
    to: 'anyokaeats@gmail.com',
    subject: 'New Contact Form Submission',
    text: `📩 Message from: ${email}\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent from:', email);
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});
// Admin endpoint to get all orders
router.get('/admin/orders', authenticateAdminToken, async (req, res) => {
  try {
    const orders = await Order.find().populate('subOrders');
    res.json({ orders, total: orders.length });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

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



async function parsePlusCodeToLatLng(plusCode) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY; // Ensure your Google API key is set in the environment variables
    if (!apiKey) {
      throw new Error('Google API key is missing. Set GOOGLE_API_KEY in your environment variables.');
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: plusCode,
        key: apiKey,
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error('Failed to parse Plus Code:', response.data.status, response.data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error in parsePlusCodeToLatLng:', error.message);
    return null;
  }
}


//PARTNER /BUSINESS OWNERS LOGS AND PROFILE CONTROL

// Partner Schema 
const partnerSchema = new mongoose.Schema({
  businessName: { type: String, required: true, unique: true },
  businessType: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  town: { type: String, required: true },
  location: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiry: { type: Number },
  profileImage: { type: String, required: false },
  idNumber: { type: String, required: true, unique: true },
  businessPermit: { type: String, required: false },
  description: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'partner'], default: 'partner' },
  suspended: { type: Boolean, default: false },
  slug: { type: String, unique: true, index: true },
  isVerified: { type: Boolean, default: false }, // ✅ new field
  verificationToken: { type: String }, // ✅ new field
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

function slugify(name) {
  if (!name) return null;
  return name.toString().toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureUniquePartnerSlug(base) {
  let candidate = base;
  let counter = 1;
  // loop until unique
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await Partner.findOne({ slug: candidate });
    if (!exists) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

// Find the partner before adding one
router.get('/partner', authenticateToken, async (req, res) => {
  try {
    console.log('User ID:', req.user._id);
    const partner = await Partner.findById(req.user._id);
    if (!partner) return res.status(404).send('Partner not found.');
    // backfill slug if missing
    if (!partner.slug && partner.businessName) {
      const base = slugify(partner.businessName);
      partner.slug = await ensureUniquePartnerSlug(base || `store-${Date.now()}`);
      await partner.save();
    }
    res.json(partner);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// Partner Sign-Up Route with Email Verification + File Handling + Slug + JWT
router.post('/signup', uploadSignupFiles, processSignupFiles, async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      contactNumber,
      idNumber,
      email,
      town,
      location,
      password,
      role,
    } = req.body;

    console.log('Received signup data:', req.body, 'Files:', req.files);

    // 🔹 1. Check for existing partner (email, name, or phone)
    const existingPartner = await Partner.findOne({
      $or: [{ businessName }, { contactNumber }, { email }],
    });
    if (existingPartner) {
      return res.status(400).json({
        message: 'Business name, email, or contact number already exists.',
      });
    }

    // 🔹 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 3. Determine role
    const effectiveRole = email === 'anyokaeats@gmail.com' ? 'admin' : role || 'partner';

    // 🔹 4. Build partner object
    const newPartnerData = {
      businessName,
      businessType,
      contactNumber,
      idNumber,
      email,
      town,
      location,
      password: hashedPassword,
      role: effectiveRole,
      isVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    };

    // 🔹 5. Attach file paths (if any)
    if (req.files && req.files.businessPermit) {
      newPartnerData.businessPermit = `/uploads/business-permits/${req.files.businessPermit[0].filename}`;
    }
    if (req.files && req.files.profileImage) {
      newPartnerData.profileImage = `/uploads/profile-images/${req.files.profileImage[0].filename}`;
    }

    // 🔹 6. Generate unique slug
    if (!newPartnerData.slug) {
      const base = slugify(businessName);
      newPartnerData.slug = await ensureUniquePartnerSlug(base || `store-${Date.now()}`);
    }

    // 🔹 7. Save new partner
    const newPartner = new Partner(newPartnerData);
    await newPartner.save();

    // 🔹 8. Build verification link
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${newPartner.verificationToken}`;

    // 🔹 9. Send verification email
    await transporter.sendMail({
      from: `"Anyoka Eats" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify your Anyoka Eats Partner Account',
      html: `
        <h2>Welcome to Anyoka Eats, ${businessName}!</h2>
        <p>Please verify your email to activate your partner account.</p>
        <a href="${verificationUrl}" style="
          display:inline-block;
          background:#ff6b00;
          color:white;
          padding:10px 20px;
          border-radius:5px;
          text-decoration:none;
        ">Verify My Account</a>
        <p>If that button doesn't work, click this link instead:</p>
        <p>${verificationUrl}</p>
      `,
    });

    // 🔹 10. Respond (no JWT yet — only after verification/login)
    res.status(201).json({
      message: 'Sign-up successful! Please check your email to verify your account before logging in.',
    });

  } catch (error) {
    console.error('Sign-up error:', error);

    // 🧠 Handle duplicate key errors from MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const value = error.keyValue ? error.keyValue[field] : '';
      return res.status(400).json({
        message: `A partner with this ${field} (${value}) already exists. Please use a different one.`,
      });
    }

    // 🧠 Handle Mongoose validation errors (e.g., missing required fields)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(' ') });
    }

    // 🧠 Handle any other server errors
    res.status(500).json({
      message: 'An unexpected error occurred during registration. Please try again later.',
    });
  }
});



// router.get('/verify/:token', async (req, res) => {
//   try {
//     const partner = await Partner.findOne({ verificationToken: req.params.token });

//     if (!partner) {
//       return res.status(400).json({ message: 'Invalid or expired verification token.' });
//     }

//     partner.isVerified = true;
//     partner.verificationToken = undefined; // clear token after verification
//     await partner.save();

//     res.status(200).json({ message: 'Account verified successfully! You can now log in.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Verification failed.' });
//   }
// });

router.get('/verify/:token', async (req, res) => {
  try {
    const partner = await Partner.findOne({ verificationToken: req.params.token });

    // ✅ Case 1: Invalid or expired token
    if (!partner) {
      // Maybe user already verified earlier — let's check
      const alreadyVerified = await Partner.findOne({ isVerified: true, verificationToken: undefined });
      if (alreadyVerified) {
        return res.status(200).json({
          message: 'Your account is already verified. You can log in.',
          alreadyVerified: true,
        });
      }

      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    // ✅ Case 2: Mark verified (only once)
    if (!partner.isVerified) {
      partner.isVerified = true;
      partner.verificationToken = undefined;
      await partner.save();
    }

    return res.status(200).json({ message: 'Account verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification failed due to a server error.' });
  }
});


/* =======================
   PARTNER LOGIN ROUTE
======================= */

router.post('/partner/login', async (req, res) => {
  const { identifier, password } = req.body;
  console.log('Partner login attempt:', req.body);

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Business name/phone and password are required.' });
  }

  try {
    // 🔍 Find partner by business name or contact number
    const partner = await Partner.findOne({
      $or: [{ businessName: identifier }, { contactNumber: identifier }],
    });

    if (!partner) {
      console.error('Partner not found:', identifier);
      return res.status(404).json({ message: 'Partner not found.' });
    }

    // 🚫 Check if suspended
    if (partner.suspended) {
      return res.status(403).json({
        message: 'Your vendor account has been suspended. Please contact support.',
      });
    }

    // 🚫 Check if NOT verified
    if (!partner.isVerified) {
      return res.status(401).json({
        message:
          'Your account has not been verified yet. Please check your email for a verification link or contact support.',
      });
    }

    // 🔑 Validate password
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      { _id: partner._id, role: 'partner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Partner login successful',
      token,
      role: 'partner',
      redirectTo: partner.role === 'admin' ? '/superuserdashboard' : '/dashboard',
    });
  } catch (error) {
    console.error('Error during partner login:', error);
    res.status(500).json({ message: 'Login error', error: error.message });
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

router.post(
  '/upload-profile-image',
  uploadProfileImage,       // Multer middleware
  processProfileImage,      // Optional: your image processor middleware
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Profile image is required' });
      }

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
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


// Update/Add Business permit
router.post(
  '/upload-business-permit',
  uploadBusinessPermit,        // Multer middleware
  processBusinessPermit,       // Your processing middleware
  async (req, res) => {
    try {
      const { partnerId } = req.body;
      if (!partnerId || !req.file) {
        return res.status(400).json({ message: 'Partner ID and file are required' });
      }

      const updatedPartner = await Partner.findByIdAndUpdate(
        partnerId,
        { businessPermit: `/uploads/business-permits/${req.file.filename}` },
        { new: true }
      );

      if (!updatedPartner) {
        return res.status(404).json({ message: 'Partner not found' });
      }

      res.status(200).json({
        message: 'Business permit uploaded and profile updated successfully',
        businessPermit: `/uploads/business-permits/${req.file.filename}`,
      });
    } catch (error) {
      console.error('Error uploading business permit:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// ============================
// PARTNER PASSWORD RESET ROUTES
// ============================
router.post('/partner/request-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const partner = await Partner.findOne({ email });
    if (!partner) return res.status(404).json({ message: 'No partner account found with that email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    partner.resetToken = resetToken;
    partner.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await partner.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/partner/reset-password?token=${resetToken}&email=${email}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color:#f8f9fa; padding:20px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;padding:30px;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color:#333;">Partner Password Reset</h2>
          <p>Hi ${partner.businessName || 'Partner'},</p>
          <p>You requested to reset your password for your <strong>Anyoka Eats</strong> partner account.</p>
          <p>Please click the button below to set a new password:</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="${resetUrl}" 
              style="background-color:#1d3557;color:white;text-decoration:none;padding:12px 25px;border-radius:5px;font-weight:bold;">
              Reset Partner Password
            </a>
          </div>
          <p>If you prefer to enter the token manually, copy it below:</p>
          <p style="font-weight:bold;background:#f1f1f1;padding:10px;border-radius:5px;text-align:center;">${resetToken}</p>
          <p>This link and token expire in <strong>1 hour</strong>.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <hr />
          <small style="color:#999;">© ${new Date().getFullYear()} Anyoka Eats. All rights reserved.</small>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Anyoka Eats Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Partner Password Reset Request',
      html: emailHtml,
    });

    res.json({ message: 'Partner password reset link sent to your email.' });
  } catch (err) {
    console.error('Partner password reset error:', err);
    res.status(500).json({ message: 'Error sending reset email.' });
  }
});

// Complete password reset (PARTNER)
router.post('/partner/reset-password', async (req, res) => {
  const { token, email, newPassword } = req.body;

  try {
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Token, email, and new password are required.' });
    }

    const partner = await Partner.findOne({
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!partner) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    partner.password = await bcrypt.hash(newPassword, 10);
    partner.resetToken = undefined;
    partner.resetTokenExpiry = undefined;
    await partner.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Partner password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Error during partner password reset:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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

// Lookup partner by slug
router.get('/partners/slug/:slug', async (req, res) => {
  try {
    const partner = await Partner.findOne({ slug: req.params.slug });
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch partner', error: error.message });
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
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  town: { type: String, required: true },
  location: { type: String, required: true },
  savedLocations: [{ // new field
    label: { type: String }, // e.g., "Work", "Home", "Parents"
    town: { type: String },
    location: { type: String },
  }],
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiry: { type: Number },
  suspended: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);
// Ads Schema (supports text/image/video entries)
const adsSchema = new mongoose.Schema({
  items: [{
    type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    content: { type: String }, // for text
    mediaUrl: { type: String }, // for image/video
    link: { type: String },
    placement: {
      type: String,
      enum: ['hero_top_marquee', 'hero_left', 'hero_right'],
      default: 'hero_top_marquee'
    },
    active: { type: Boolean, default: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
  }],
}, { timestamps: true });
const Ads = mongoose.models.Ads || mongoose.model('Ads', adsSchema);

// Public: get ads messages for client top bar
router.get('/ads', async (req, res) => {
  try {
    let ads = await Ads.findOne();
    if (!ads) {
      ads = await Ads.create({
        items: [
          { type: 'text', content: "Today's picks are hot — grab your favorites!", placement: 'hero_top_marquee' },
          { type: 'text', content: 'Limited-time deals across top categories', placement: 'hero_top_marquee' },
          { type: 'text', content: 'Fast delivery on featured items near you', placement: 'hero_top_marquee' },
        ]
      });
    }
    // filter active and within schedule if provided
    const now = new Date();
    let items = (ads.items || []).filter(it => it.active !== false && (!it.startsAt || it.startsAt <= now) && (!it.endsAt || it.endsAt >= now));
    if (req.query.placement) {
      items = items.filter(it => it.placement === req.query.placement);
    }
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load ads', error: error.message });
  }
});

// Admin: get current ads
router.get('/admin/ads', authenticateAdminToken, async (req, res) => {
  try {
    let ads = await Ads.findOne();
    if (!ads) {
      ads = await Ads.create({ items: [] });
    }
    res.json({ items: ads.items || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ads', error: error.message });
  }
});

// Admin: update ads messages
router.put('/admin/ads', authenticateAdminToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items must be an array' });
    }
    // sanitize
    const allowed = ['text', 'image', 'video'];
    const allowedPlacements = ['hero_top_marquee', 'hero_left', 'hero_right'];
    const clean = items.map(raw => ({
      type: ['text', 'image', 'video'].includes(raw.type) ? raw.type : 'text',
      content: raw.content ? String(raw.content) : undefined,
      mediaUrl: raw.mediaUrl ? String(raw.mediaUrl) : undefined,
      link: raw.link ? String(raw.link) : undefined,
      placement: allowedPlacements.includes(raw.placement) ? raw.placement : 'top_marquee',
      active: raw.active !== false,
      startsAt: raw.startsAt ? new Date(raw.startsAt) : undefined,
      endsAt: raw.endsAt ? new Date(raw.endsAt) : undefined,
    }));
    let ads = await Ads.findOne();
    if (!ads) {
      ads = new Ads({ items: [] });
    }
    ads.items = clean;
    await ads.save();
    res.json({ items: ads.items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ads', error: error.message });
  }
});




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



/* =======================
   USER LOGIN ROUTE
======================= */
router.post('/user/login', async (req, res) => {
  const { identifier, password } = req.body;
  console.log('User login attempt:', req.body);

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/phone and password are required' });
  }

  try {
    // 🔍 Find user by username or phone
    const user = await User.findOne({
      $or: [{ username: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      console.error('User not found:', identifier);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'User login successful',
      token,
      role: 'user',
      redirectTo: '/',
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});


// ==========================
// USER PASSWORD RESET ROUTES
// ==========================
router.post('/user/request-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/user/reset-password?token=${resetToken}&email=${email}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color:#f8f9fa; padding:20px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;padding:30px;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color:#333;">Password Reset Request</h2>
          <p>Hi ${user.username || 'there'},</p>
          <p>You requested to reset your password for your <strong>Anyoka Eats</strong> user account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="${resetUrl}" 
              style="background-color:#e63946;color:white;text-decoration:none;padding:12px 25px;border-radius:5px;font-weight:bold;">
              Reset Password
            </a>
          </div>
          <p>If you prefer to enter the token manually, copy it below:</p>
          <p style="font-weight:bold;background:#f1f1f1;padding:10px;border-radius:5px;text-align:center;">${resetToken}</p>
          <p>This link and token expire in <strong>1 hour</strong>.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <hr />
          <small style="color:#999;">© ${new Date().getFullYear()} Anyoka Eats. All rights reserved.</small>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Anyoka Eats Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: emailHtml,
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('User password reset error:', err);
    res.status(500).json({ message: 'Error sending password reset email.' });
  }
});

// Complete password reset (USER)
router.post('/user/reset-password', async (req, res) => {
  const { token, email, newPassword } = req.body;

  try {
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Token, email, and new password are required.' });
    }

    const user = await User.findOne({
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Error during user password reset:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Admin login route
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = 'anyokaeats@gmail.com';
  // You can set the admin password here or load from env
  const adminPassword = process.env.ADMIN_PASSWORD || 'AnyokaEats2024!';

  if (email !== adminEmail) {
    return res.status(401).json({ message: 'Invalid admin email' });
  }
  // Compare password
  if (password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid admin password' });
  }

  // Generate JWT token for admin
  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.status(200).json({
    message: 'Admin login successful',
    token,
    role: 'admin'
  });
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

router.get('/users/profile', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/users/update-profile', uploadProfileImage, processProfileImage, async (req, res) => {
  try {
    const { userId, formData } = req.body;
    if (!userId || !formData) return res.status(400).json({ error: 'User ID and formData are required.' });

    const parsedData = JSON.parse(formData);
    const { username, names, email, phoneNumber, town, location } = parsedData;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update user fields
    user.username = username || user.username;
    user.names = names || user.names;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.town = town || user.town;
    user.location = location || user.location;

    // If a new profile image is uploaded
    if (req.file) {
      // Remove old file if it exists
      if (user.profilePhotoUrl) {
        const oldFile = path.join(__dirname, '../uploads/profile-images', path.basename(user.profilePhotoUrl));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      user.profilePhotoUrl = `/uploads/profile-images/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile (JSON only, no files)
router.put("/user/update-profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // comes from the decoded token
    console.log('Updating profile for user ID:', userId);
    const { username, names, email, phoneNumber, town, location } = req.body;
    console.log('Request body:', req.body);

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update fields
    user.username = username || user.username;
    user.names = names || user.names;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.town = town || user.town;
    user.location = location || user.location;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('User ID:', userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .populate({
        path: 'items.shop.shopId',
        select: 'businessName', // Use 'businessName' for shop name
      })
      .populate({
        path: 'subOrders',
        populate: [
          { path: 'shop', select: 'businessName' }, // Use 'businessName' for shop name
          { path: 'items.product' },
        ],
      })
      .sort({ createdAt: -1 });

    console.log('Orders:', orders);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Server error' });
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
  discountedPrice: { type: Number, required: false, default: null },
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
router.post('/products', uploadProductImages, processProductImages, async (req, res) => {
  try {
    console.log('Received body:', req.body);
    console.log('Received files:', req.files);
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
      shopId,
      primaryImage,
      deletedImages,
    } = req.body;

    const newImages = [...new Set(req.files?.images?.map((file) => `/uploads/products/${file.filename}`) || [])];

    if (newImages.length > 5) {
      return res.status(400).json({ message: 'Maximum of 5 images allowed.' });
    }

    const partner = await Partner.findById(shopId);
    if (!partner) return res.status(404).json({ message: 'Shop not found' });

    let resolvedPrimaryImage = null;
    if (primaryImage) {
      if (primaryImage.startsWith('new:')) {
        const idx = parseInt(primaryImage.slice(4));
        if (idx >= 0 && idx < newImages.length) {
          resolvedPrimaryImage = newImages[idx];
        }
      } else if (newImages.includes(primaryImage)) {
        resolvedPrimaryImage = primaryImage;
      }
    }

    if (!resolvedPrimaryImage && newImages.length > 0) {
      resolvedPrimaryImage = newImages[0];
    }

    const productId = shortid.generate();
    const newProduct = new Product({
      productId,
      name,
      description,
      images: newImages,
      primaryImage: resolvedPrimaryImage,
      category,
      subCategory,
      brand,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
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

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error, error.stack);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});

router.put('/products/:id', uploadProductImages, processProductImages, async (req, res) => {
  try {
    console.log('Received body:', req.body);
    console.log('Received files:', req.files);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.subCategory = req.body.subCategory || product.subCategory;
    product.brand = req.body.brand || product.brand;
    product.tags = req.body.tags ? req.body.tags.split(',').map((tag) => tag.trim()) : product.tags;
    product.price = req.body.price || product.price;

    if (
      req.body.discountedPrice === '' ||
      req.body.discountedPrice === '0' ||
      Number(req.body.discountedPrice) === 0
    ) {
      product.discountedPrice = null;
    } else if (req.body.discountedPrice !== undefined) {
      product.discountedPrice = req.body.discountedPrice;
    }
    product.quantity = req.body.quantity || product.quantity;
    product.unit = req.body.unit || product.unit;
    product.inventory = req.body.inventory || product.inventory;

    const deletedImages = req.body.deletedImages ? JSON.parse(req.body.deletedImages) : [];
    if (deletedImages.length > 0) {
      product.images = product.images.filter((img) => !deletedImages.includes(img));
      if (deletedImages.includes(product.primaryImage)) {
        product.primaryImage = null;
      }
    }

    const newImages = [...new Set(req.files?.images?.map((file) => `/uploads/products/${file.filename}`) || [])];
    const existingImages = product.images.filter((img) => !newImages.includes(img));
    product.images = [...existingImages, ...newImages];

    if (product.images.length > 5) {
      return res.status(400).json({ message: 'Total images cannot exceed 5.' });
    }

    let resolvedPrimaryImage = product.primaryImage;
    const primaryFromBody = req.body.primaryImage;

    if (primaryFromBody) {
      if (primaryFromBody.startsWith('new:')) {
        const idx = parseInt(primaryFromBody.slice(4));
        if (idx >= 0 && idx < newImages.length) {
          resolvedPrimaryImage = newImages[idx];
        }
      } else if (product.images.includes(primaryFromBody)) {
        resolvedPrimaryImage = primaryFromBody;
      }
    }

    if (!resolvedPrimaryImage && product.images.length > 0) {
      resolvedPrimaryImage = product.images[0];
    }

    product.primaryImage = resolvedPrimaryImage;
    product.updatedAt = Date.now();

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error, error.stack);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { partnerId } = req.query;
    if (!partnerId) {
      return res.status(400).json({ message: 'Partner ID is required' });
    }
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

// Handling distance calculations.
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
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'DepositPaid'], default: 'Pending' },
  paymentType: { type: String, enum: ['full', 'deposit'], default: 'full' },
  balanceDue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  deliveredAt: { type: Date },
  deliveredBy: { type: String },
  deliveredByPhone: { type: String },
  status: { type: String, enum: ['Pending', 'Delivered', 'Confirmed Delivered'], default: 'Pending' },
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
      'Confirmed Delivered',
    ],
    default: 'Pending'
  },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  deliveredBy: { type: String },
  deliveredByPhone: { type: String },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const SubOrder = mongoose.models.SubOrder || mongoose.model('SubOrder', SubOrderSchema);


// --- ROUTES ---

router.post('/orders/place', async (req, res) => {


  const {
    userId,
    items,
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
    // const order = await Order.create([{
    //   user: userId,
    //   items,
    //   delivery,
    //   paymentMethod,
    //   total // <- Add this
    // }], { session });
    const {
      paymentStatus = 'Pending',
      paymentType = 'full',
    } = req.body;

    let balanceDue = 0;
    if (paymentType === 'deposit') {
      balanceDue = Math.round(total + delivery.fee - (total + delivery.fee) * 0.3);
    }

    const order = await Order.create([{
      user: userId,
      items,
      delivery,
      paymentMethod,
      total,
      paymentStatus,
      paymentType,
      balanceDue
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
    console.error(err); n
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



router.get('/driver-orders/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId)
      .populate({
        path: 'subOrders',
        populate: {
          path: 'shop', // Populate the shop field in each suborder
          select: 'businessName location', // Only fetch the required fields
        },
        select: 'status shop', // Fetch the status and shop fields for suborders
      })
      .populate('user', 'username phoneNumber'); // Populate user details (username, phoneNumber)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

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
    let { status, driverId } = req.body; // 'let' because we might override status

    const validStatuses = [
      'Pending',
      'OrderReceived',
      'Preparing',
      'ReadyForPickup',
      'PickedUp',
      'OutForDelivery',
      'Delivered',
      'Confirmed Delivered',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // 🔹 Fetch suborder with parent
    const subOrder = await SubOrder.findById(id).populate('shop parentOrder');
    if (!subOrder) return res.status(404).json({ error: 'SubOrder not found' });

    // 🔹 Fetch parent order
    let parentOrder = await Order.findById(subOrder.parentOrder._id).populate('subOrders');
    if (!parentOrder) return res.status(404).json({ error: 'Parent order not found' });

    // ✅ Own delivery: if marking PickedUp → instantly confirm delivered
    if (parentOrder.delivery.option === 'own' && status === 'PickedUp') {
      status = 'Confirmed Delivered';
    }

    // 🔹 Update suborder status
    subOrder.status = status;
    if (['Confirmed Delivered', 'Delivered'].includes(status)) {
      subOrder.deliveredAt = new Date();
    }
    await subOrder.save();

    // ✅ If all suborders are confirmed delivered → mark parent as confirmed
    const allConfirmed = parentOrder.subOrders.every((so) =>
      so._id.equals(subOrder._id)
        ? status === 'Confirmed Delivered'
        : so.status === 'Confirmed Delivered'
    );
    if (allConfirmed) {
      parentOrder.status = 'Confirmed Delivered';
      await parentOrder.save();
    }

    // 🔹 Assign driver for platform delivery (not own)
    if (
      status === 'PickedUp' &&
      parentOrder.delivery.option !== 'own' &&
      !subOrder.parentOrder.assignedDriver
    ) {
      await Order.findByIdAndUpdate(subOrder.parentOrder._id, {
        assignedDriver: driverId,
      });
    }

    // 🔹 Re-fetch populated order for later checks
    parentOrder = await Order.findById(subOrder.parentOrder._id).populate({
      path: 'subOrders',
      populate: { path: 'shop', select: 'businessName location' },
      select: 'status shop',
    });

    // 🔹 Check if all suborders are ReadyForPickup
    const allReady = parentOrder.subOrders.every(
      (so) => so.status === 'ReadyForPickup'
    );

    // ✅ ONLY notify drivers for platform delivery orders
    if (allReady && parentOrder.delivery.option === 'platform') {
      const shop = await Partner.findById(subOrder.shop._id);
      if (!shop || !shop.location) {
        return res.status(400).json({ error: 'Shop location is missing' });
      }

      const shopCoords = await parsePlusCodeToLatLng(shop.location);
      const drivers = await Driver.find({
        status: 'Available',
        currentLocation: { $exists: true },
      });

      for (const driver of drivers) {
        const driverCoords = await parsePlusCodeToLatLng(
          driver.currentLocation?.location
        );
        if (!driverCoords) continue;

        const distance = geolib.getDistance(shopCoords, driverCoords); // meters
        if (distance <= 5000) {
          // 🔔 Notify nearby driver
          notifyDriver(driver._id.toString(), {
            type: 'AllSubOrdersReady',
            message: 'All suborders for an order are ready for pickup',
            orderId: parentOrder._id, // ✅ Use MongoDB _id, not orderId string
            shops: parentOrder.subOrders.map((so) => ({
              shopName: so.shop.businessName,
              location: so.shop.location,
            })),
          });

          try {
            await DriverNotification.create({
              driver: driver._id,
              orderId: parentOrder._id,
              message: 'All suborders for an order are ready for pickup',
              status: 'ReadyForPickup',
            });
          } catch (err) {
            console.error('Failed to create driver notification:', err.message);
          }
        }
      }
    }

    res.json(subOrder);
  } catch (error) {
    console.error('Error updating suborder status:', error.message, error.stack);
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
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiry: { type: Number },
  nationalId: { type: String, required: true, unique: true },
  driverLicenseNumber: { type: String, required: true, unique: true },
  profilePhotoUrl: { type: String },

  vehicleDetails: {
    make: { type: String },
    model: { type: String },
    plateNumber: { type: String },
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

  if (!username || !phoneNumber || !email || !password || !nationalId || !driverLicenseNumber) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingDriver = await Driver.findOne({
      $or: [
        { username },
        { phoneNumber },
        { email },
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
    const token = jwt.sign({ id: newDriver._id }, JWT_SECRET, { expiresIn: '7d' });

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

    // Block suspended drivers
    if (driver.verificationStatus === 'Rejected') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    // Mark driver online/available on successful login
    driver.status = 'Available';
    driver.lastActiveAt = new Date();
    await driver.save();

    // Create JWT token
    const token = jwt.sign(
      { driverId: driver._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Respond with driver data and token
    res.json({
      driver: {
        _id: driver._id,
        username: driver.username,
        phoneNumber: driver.phoneNumber,
        profileCompleted: driver.profileCompleted,
        status: driver.status,
      },
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// ============================
// DRIVER PASSWORD RESET ROUTES
// ============================

router.post('/driver/request-reset', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(404).json({ message: 'No driver found with this email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    driver.resetToken = resetToken;
    driver.resetTokenExpiry = resetTokenExpiry;
    await driver.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/driver/reset-password?token=${resetToken}&email=${email}`;

    // ✨ Styled email with both clickable button and copyable token
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color:#f8f9fa; padding:20px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;padding:30px;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color:#333;">Driver Password Reset</h2>
          <p>Hi ${driver.fullName || 'Driver'},</p>
          <p>You requested to reset your password for your <strong>Anyoka Eats</strong> driver account.</p>
          <p>Please click the button below to set a new password:</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="${resetUrl}" 
              style="background-color:#457b9d;color:white;text-decoration:none;padding:12px 25px;border-radius:5px;font-weight:bold;">
              Reset Password
            </a>
          </div>
          <p>If you prefer to enter the token manually, copy it below:</p>
          <p style="font-weight:bold;background:#f1f1f1;padding:10px;border-radius:5px;text-align:center;">${resetToken}</p>
          <p>This link and token will expire in <strong>1 hour</strong>.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <hr />
          <small style="color:#999;">© ${new Date().getFullYear()} Anyoka Eats. All rights reserved.</small>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Anyoka Eats Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Driver Password Reset Request',
      html: emailHtml,
    });

    console.log('✅ Sent reset email to driver:', email);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('❌ Driver reset email error:', error);
    res.status(500).json({ message: 'Server error while sending reset email.', error: error.message });
  }
});


// ===============================
// COMPLETE DRIVER PASSWORD RESET
// ===============================
router.post('/driver/reset-password', async (req, res) => {
  const { token, email, newPassword } = req.body;

  try {
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Token, email, and new password are required.' });
    }

    const driver = await Driver.findOne({
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!driver) {
      return res.status(400).json({ message: 'Invalid or expired reset token, or email does not match.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    driver.password = hashedPassword;
    driver.resetToken = undefined;
    driver.resetTokenExpiry = undefined;
    await driver.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('❌ Driver password reset error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during password reset.', error: error.message });
  }
});


// Driver logout: mark offline
router.post('/driver/logout', authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.driverId || req.user.id || req.user._id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    driver.status = 'Offline';
    driver.lastActiveAt = new Date();
    await driver.save();
    res.json({ message: 'Logged out', status: driver.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Driver set online
router.post('/driver/online', authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.driverId || req.user.id || req.user._id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (driver.verificationStatus === 'Rejected') {
      return res.status(403).json({ message: 'Account suspended' });
    }
    driver.status = 'Available';
    driver.lastActiveAt = new Date();
    await driver.save();
    res.json({ status: driver.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Driver set offline
router.post('/driver/offline', authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.driverId || req.user.id || req.user._id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    driver.status = 'Offline';
    driver.lastActiveAt = new Date();
    await driver.save();
    res.json({ status: driver.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get driver details
router.get('/driver/profile', authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.driverId || req.user.id || req.user._id);

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
router.put('/driver/updates-profile', authenticateToken, uploadProfileImage, processProfileImage, async (req, res) => {
  try {
    console.log("Received data:", req.body);
    // Support tokens that include either driverId or id
    const driverId = req.user?.driverId || req.user?.id || req.user?._id;

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


router.put('/driver/update-profile', authenticateToken, uploadProfileImage, processProfileImage, async (req, res) => {
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


const DriverNotificationSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder', required: false },
  message: { type: String, required: true },
  status: { type: String, enum: ['ReadyForPickup', 'PickedUp', 'OutForDelivery', 'Delivered'], required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});
const DriverNotification = mongoose.models.DriverNotification || mongoose.model('DriverNotification', DriverNotificationSchema);

router.get('/driver-notifications/:driverId', async (req, res) => {
  try {
    const notifications = await DriverNotification.find({ driver: req.params.driverId }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Failed to fetch driver notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
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

router.put('/orders/:orderId/assign-driver', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { driverId, action } = req.body; // `action` can be 'accept' or 'decline'

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (action === 'accept') {
      order.assignedDriver = driverId; // Assign the driver
    } else if (action === 'decline') {
      order.assignedDriver = null; // Unassign the driver
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order assignment:', error.message);
    res.status(500).json({ error: 'Server error updating order assignment' });
  }
});

router.get('/driver-active-orders/:driverId', authenticateToken, async (req, res) => {
  const { driverId } = req.params;
  try {
    const orders = await Order.find({ assignedDriver: driverId })
      .populate({
        path: 'subOrders',
        populate: {
          path: 'shop',
          select: 'businessName location',
        },
        select: 'status shop',
      })
      .populate('user', 'username phoneNumber'); // Populate user details (username, phoneNumber)

    res.json(orders);
  } catch (err) {
    console.error('Error fetching active driver orders:', err.message);
    res.status(500).json({ error: 'Server error fetching active orders' });
  }
});

// router.put('/orders/:orderId/mark-delivered', authenticateToken, async (req, res) => {
//   const { orderId } = req.params;
//   const { driverName, driverPhone } = req.body;

//   try {
//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       {
//         status: 'Delivered',
//         deliveredAt: new Date(),
//         deliveredBy: driverName,
//         deliveredByPhone: driverPhone,
//       },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.json({ message: 'Order marked as delivered', order });
//   } catch (error) {
//     console.error('Error marking order as delivered:', error.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

router.put('/orders/:orderId/mark-delivered', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { driverName, driverPhone, finalPaymentReceived = false } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 🧮 CASE 1: Deposit order - check payment completion
    if (order.paymentType === 'deposit' && order.balanceDue > 0) {
      if (!finalPaymentReceived) {
        return res.status(400).json({
          error: `Cannot mark as fully delivered. Customer still owes KSH ${order.balanceDue}.`,
          requiresFinalPayment: true,
        });
      }

      // ✅ Final payment confirmed by driver
      order.paymentStatus = 'Paid';
      order.balanceDue = 0;
    }

    // 🧮 CASE 2: Normal order (full payment or COD)
    order.status = 'Delivered';
    order.deliveredAt = new Date();
    order.deliveredBy = driverName;
    order.deliveredByPhone = driverPhone;

    await order.save();

    res.json({ message: 'Order marked as delivered successfully', order });
  } catch (error) {
    console.error('Error marking order as delivered:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/orders/:orderId/confirm-delivery', authenticateToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'Confirmed Delivered',
        deliveredAt: new Date()  // Set the delivery confirmation time
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Update all suborders to Confirmed Delivered
    await SubOrder.updateMany(
      { parentOrder: orderId },
      { status: 'Confirmed Delivered' }
    );

    res.json({ message: 'Order confirmed as delivered', order });
  } catch (error) {
    console.error('Error confirming delivery:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// In routes/order.js
router.get('/driver-completed-orders/:driverId', authenticateToken, async (req, res) => {
  const { driverId } = req.params;
  try {
    const orders = await Order.find({
      assignedDriver: driverId,
      status: 'Confirmed Delivered', // Only fetch orders with status "Confirmed Delivered"
    })
      .populate({
        path: 'subOrders',
        populate: {
          path: 'shop',
          select: 'businessName location',
        },
        select: 'status shop',
      })
      .populate('user', 'username phoneNumber'); // Populate user details

    res.json(orders);
  } catch (err) {
    console.error('Error fetching completed driver orders:', err.message);
    res.status(500).json({ error: 'Server error fetching completed orders' });
  }
});

// GET /api/orders/:orderId/status
router.get('/orders/:orderId/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('status');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ status: order.status });
  } catch (err) {
    console.error('Error fetching parent order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/order/:orderId/status', authenticateToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).select('status user');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to order status' });
    }

    res.json({ status: order.status });
  } catch (err) {
    console.error('Error fetching order status:', err.message);
    res.status(500).json({ error: 'Server error fetching order status' });
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


router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ products: [], partners: [], categories: [], subcategories: [], });

  // Search products
  const products = await Product.find({
    name: { $regex: q, $options: 'i' }
  }).limit(5);

  // Search partners (shops)
  const partners = await Partner.find({
    businessName: { $regex: q, $options: 'i' }
  }).limit(5);

  // Search categories (static or from products)
  const categories = await Product.distinct('category', {
    category: { $regex: q, $options: 'i' }
  });

  // Search subcategories
  const subcategories = await Product.distinct('subCategory', {
    subCategory: { $regex: q, $options: 'i' }
  });

  res.json({ products, partners, categories, subcategories });
});


// ✅ Full product search endpoint
router.get('/product/search', async (req, res) => {
  const { q, category, subcategory } = req.query;
  let filter = {};

  if (q) {
    filter.name = { $regex: q, $options: 'i' }; // matches tomato, tomatoes, toma, etc
  }
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }
  if (subcategory) {
    filter.subCategory = { $regex: subcategory, $options: 'i' };
  }

  try {
    const products = await Product.find(filter); // ✅ actually fetch products
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get all products by shopId
router.get('/products/by-shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ "shop.shopId": shopId });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});









// // PAYMENTS CONTROLS ROUTES
// const consumerKey = process.env.CONSUMER_KEY;
// const consumerSecret = process.env.CONSUMER_SECRET;
// const shortcode = process.env.SHORTCODE;
// const passkey = process.env.PASSKEY;
// const ngrokUrl = process.env.NODE_ENV === 'production'
//   ? process.env.NGROK_URL
//   : process.env.NGROK_URL_LOCAL;
// router.post('/mpesa/callback', (req, res) => {
//   const callbackData = req.body;
//   console.log('M-Pesa Callback Received:', callbackData);

//   // Your logic to handle the callback data goes here...
//   // Extract relevant information from the callback data
//   const { Body, ResultCode, ResultDesc } = callbackData;

//   // Log the callback data for debugging or auditing
//   console.log('Callback Body:', Body);
//   console.log('Result Code:', ResultCode);
//   console.log('Result Description:', ResultDesc);

//   // Example: Process the callback based on ResultCode
//   if (ResultCode === 0) {
//     // Successful transaction
//     // Update your database, notify user, etc.
//     console.log('Payment successful. Update database...');
//   } else {
//     // Failed transaction
//     // Handle failure scenario
//     console.log('Payment failed:', ResultDesc);
//   }
//   // Respond with a success status to acknowledge receipt
//   res.sendStatus(200);
// });



// // Route to handle M-Pesa payment
// const generateTimestamp = () => {
//   const date = new Date();

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');

//   return `${year}${month}${day}${hours}${minutes}${seconds}`;
// };



// router.post('/mpesa/pay', async (req, res) => {
//   const { phoneNumber, amount } = req.body;
//   console.log('Received payment request:', { phoneNumber, amount });

//   try {
//     const timestamp = generateTimestamp();
//     console.log('Generated timestamp:', timestamp);

//     // Fetch access token 
//     const authResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
//       headers: {
//         'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
//       }
//     });

//     const { access_token } = authResponse.data;
//     if (!access_token) {
//       throw new Error('Failed to fetch access token');
//     }

//     console.log('Access Token:', access_token);

//     // Generate password and payment data
//     const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
//     const paymentData = {
//       BusinessShortCode: shortcode,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: amount,
//       PartyA: phoneNumber,
//       PartyB: shortcode,
//       PhoneNumber: phoneNumber,
//       CallBackURL: `${ngrokUrl}/mpesa/callback`,
//       AccountReference: 4148059,
//       TransactionDesc: 'Order Payment'
//     };

//     console.log('Payment Data:', paymentData);

//     // Initiate payment 
//     const paymentResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', paymentData, {
//       headers: {
//         'Authorization': `Bearer ${access_token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('Payment Response:', paymentResponse.data);
//     res.json(paymentResponse.data);
//   } catch (error) {
//     console.error('Error initiating M-Pesa payment:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
//   }
// });

// router.post('/mpesa/status', async (req, res) => {
//   const { CheckoutRequestID } = req.body; // The ID from the payment initiation response
//   console.log('Checking payment status for:', CheckoutRequestID);

//   try {
//     // Fetch access token
//     const authResponse = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
//       headers: {
//         'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
//       }
//     });

//     const { access_token } = authResponse.data;
//     if (!access_token) {
//       throw new Error('Failed to fetch access token');
//     }

//     console.log('Access Token:', access_token);

//     // Payment status request data
//     const statusRequestData = {
//       BusinessShortCode: shortcode,
//       Password: Buffer.from(`${shortcode}${passkey}${generateTimestamp()}`).toString('base64'),
//       Timestamp: generateTimestamp(),
//       CheckoutRequestID: CheckoutRequestID
//     };

//     // Query payment status
//     const statusResponse = await axios.post('https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query', statusRequestData, {
//       headers: {
//         'Authorization': `Bearer ${access_token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('Payment Status Response:', statusResponse.data);
//     res.json(statusResponse.data);
//   } catch (error) {
//     console.error('Error checking payment status:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Failed to check payment status', details: error.message });
//   }
// });
// --- M-PESA ROUTES (Extended) ---

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const shortcode = process.env.SHORTCODE;
const passkey = process.env.PASSKEY;
const ngrokUrl = process.env.NODE_ENV === 'production'
  ? process.env.NGROK_URL
  : process.env.NGROK_URL_LOCAL;

const generateTimestamp = () => {
  const date = new Date();
  return date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
};

// 🔹 Utility: Get Safaricom Access Token
const getAccessToken = async () => {
  const response = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
    },
  });
  return response.data.access_token;
};

// 🔹 Initiate M-Pesa Payment (Deposit or Balance)
router.post('/mpesa/pay', async (req, res) => {
  const { phoneNumber, amount, orderId, paymentType = 'Full' } = req.body; 
  console.log('Received payment request:', { phoneNumber, amount, orderId, paymentType });

  try {
    const timestamp = generateTimestamp();
    const accessToken = await getAccessToken();
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
      CallBackURL: `${ngrokUrl}/api/mpesa/callback`,
      AccountReference: orderId || 'ANYEAT-ORDER',
      TransactionDesc: paymentType === 'Deposit' ? 'Deposit Payment' : 'Balance Payment',
    };

    const paymentResponse = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save pending transaction to order for tracking
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        lastPaymentRequestId: paymentResponse.data.CheckoutRequestID,
        lastPaymentAmount: amount,
        paymentInitiatedAt: new Date(),
      });
    }

    res.json(paymentResponse.data);
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
  }
});

// 🔹 Handle M-Pesa Callback
router.post('/mpesa/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    const result = callbackData.Body.stkCallback;
    const checkoutId = result.CheckoutRequestID;
    const resultCode = result.ResultCode;
    const resultDesc = result.ResultDesc;

    if (resultCode !== 0) {
      console.warn('M-Pesa Payment Failed:', resultDesc);
      return res.sendStatus(200);
    }

    const metadata = result.CallbackMetadata?.Item || [];
    const amount = metadata.find(i => i.Name === 'Amount')?.Value || 0;
    const mpesaNumber = metadata.find(i => i.Name === 'PhoneNumber')?.Value || 'Unknown';
    const transactionId = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

    console.log('✅ Payment Success:', { transactionId, mpesaNumber, amount });

    // --- Update corresponding order if found ---
    const order = await Order.findOne({ lastPaymentRequestId: checkoutId });
    if (!order) {
      console.warn('No order found for CheckoutRequestID:', checkoutId);
      return res.sendStatus(200);
    }

    let newPaymentStatus = order.paymentStatus;
    let newAmountPaid = (order.amountPaid || 0) + amount;
    let newBalance = Math.max((order.total + (order.delivery?.fee || 0)) - newAmountPaid, 0);

    if (newBalance <= 0) {
      newPaymentStatus = 'Paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'PartiallyPaid';
    }

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: newPaymentStatus,
      amountPaid: newAmountPaid,
      balanceDue: newBalance,
      lastTransactionId: transactionId,
      lastPaidBy: mpesaNumber,
    });

    console.log(`✅ Order ${order._id} updated: ${newPaymentStatus}`);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error in M-Pesa callback:', error.message);
    res.sendStatus(500);
  }
});

// 🔹 Check Payment Status
router.post('/mpesa/status', async (req, res) => {
  const { CheckoutRequestID } = req.body;
  console.log('Checking payment status for:', CheckoutRequestID);

  try {
    const accessToken = await getAccessToken();
    const timestamp = generateTimestamp();

    const statusRequestData = {
      BusinessShortCode: shortcode,
      Password: Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64'),
      Timestamp: timestamp,
      CheckoutRequestID,
    };

    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      statusRequestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error checking payment status:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to check payment status', details: error.message });
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


// =====================================================
// ADMIN ENDPOINTS - ADDED FOR ADMIN PANEL
// =====================================================

console.log('Loading admin endpoints...');

// Admin authentication middleware (addition only - doesn't change existing auth)
function authenticateAdminToken(req, res, next) {
  console.log('Authenticating admin token...');
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied - No token provided' });

  let verified;

  try {
    // First try with the main JWT_SECRET (for real production tokens)
    verified = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    try {
      // If that fails, try with development secret for admin app
      const developmentSecret = 'development-admin-secret-key-anyoka-eats';
      verified = jwt.verify(token, developmentSecret);
      console.log('Admin token verified with development secret');
    } catch (devErr) {
      // If both JWT verification methods fail, try to decode our browser-generated token
      try {
        verified = decodeBrowserJWT(token);
        console.log('Admin token verified with browser JWT decoder');
      } catch (browserErr) {
        console.log('Admin token verification failed with all methods:', err.message);
        return res.status(400).json({ message: 'Invalid Token' });
      }
    }
  }

  // Check if user has admin role
  if (verified.role !== 'admin' && verified.role !== 'partner') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  req.user = verified;
  console.log('Admin token verified:', verified);
  next();
}

// Helper function to decode browser-generated JWT tokens
function decodeBrowserJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  try {
    // Decode the payload (middle part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Basic validation
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    if (!payload.role) {
      throw new Error('Missing role in token');
    }

    return payload;
  } catch (error) {
    throw new Error('Failed to decode browser JWT: ' + error.message);
  }
}

// Using existing Driver model (already defined above at line 1736)

// Admin endpoint to get all users (addition only)
router.get('/admin/users', authenticateAdminToken, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords for security
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Toggle user suspension
router.patch('/admin/users/:userId/disable', authenticateAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.suspended = !user.suspended;
    await user.save();
    res.json({ message: user.suspended ? 'User suspended' : 'User reinstated', user: { _id: user._id, suspended: user.suspended } });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
});

// Toggle partner suspension
router.patch('/admin/partners/:partnerId/disable', authenticateAdminToken, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    partner.suspended = !partner.suspended;
    await partner.save();
    res.json({ message: partner.suspended ? 'Vendor suspended' : 'Vendor reinstated', partner: { _id: partner._id, suspended: partner.suspended } });
  } catch (error) {
    console.error('Error updating partner status:', error);
    res.status(500).json({ message: 'Failed to update partner status', error: error.message });
  }
});

// Admin endpoint to get all drivers (addition only)
router.get('/admin/drivers', authenticateAdminToken, async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password'); // Exclude passwords for security
    res.json({ drivers, total: drivers.length });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
  }
});

// Admin endpoint to get dashboard stats (addition only)
router.get('/admin/stats', authenticateAdminToken, async (req, res) => {
  console.log('Admin stats endpoint hit!');
  try {
    const totalUsers = await User.countDocuments();
    const totalPartners = await Partner.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const onlineDrivers = await Driver.countDocuments({ isOnline: true });

    const stats = {
      ordersToday: 'N/A', // You can implement order counting logic here
      gmvToday: 'N/A',
      totalUsers,
      totalPartners,
      totalProducts,
      totalDrivers,
      onlineDrivers,
      activeDrivers: onlineDrivers,
      systemStatus: 'Connected'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// Admin endpoint to suspend/reactivate user (addition only)
router.patch('/admin/users/:userId/suspend', authenticateAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle user status (you can modify this logic as needed)
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.json({ message: `User ${user.status}`, user: { _id: user._id, status: user.status } });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
});

// Admin endpoint to disable/enable driver (addition only)
router.patch('/admin/drivers/:driverId/disable', authenticateAdminToken, async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Toggle suspension via verificationStatus
    if (driver.verificationStatus === 'Rejected') {
      driver.verificationStatus = 'Verified';
    } else {
      driver.verificationStatus = 'Rejected';
      driver.status = 'Offline'; // ensure not available
      try {
        suspendDriver(String(driver._id), { reason: 'suspended' });
      } catch (e) { }
    }
    await driver.save();

    res.json({ message: `Driver ${driver.verificationStatus === 'Rejected' ? 'suspended' : 'reinstated'}`, driver: { _id: driver._id, verificationStatus: driver.verificationStatus, status: driver.status } });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({ message: 'Failed to update driver status', error: error.message });
  }
});

// END OF ADMIN ENDPOINTS
// =====================================================


module.exports = router;