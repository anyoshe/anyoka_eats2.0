const express = require("express");
const appRouter = express.Router();
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
const { upload, uploadMultiple } = require('../config/multer');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// FOOD SCHEMA AND ITS ROUTES
const foodSchema = new Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  orderCount: { type: Number, default: 0 },
  foodCode: { type: String, required: true, unique: true },
  foodName: { type: String, required: true },
  imageUrl: { type: String, required: false },
  quantity: { type: Number, required: true, default: 1 },
  foodPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  foodCategory: { type: String, required: true },
  vendor: { type: String, required: true },
  vendorLocation: { type: String, required: true},
  subTotal: { type: Number, required: false, default: 0 },
  foodDescription: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  discountedPrice: { type: Number, required: false, default: 0 },
});

// Pre-save middleware to calculate the discounted price

foodSchema.pre('save', function (next) {
  if (this.discount > 0) {
    this.discountedPrice = this.foodPrice - (this.foodPrice * this.discount / 100);
  } else {
    this.discountedPrice = this.foodPrice;
  }
  next();
});

const Food = model("Food", foodSchema);

// Add food to database and vendor
appRouter.post('/foods', (req, res) => {
  console.log('Received request to add food:', req.body);
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
    }

    try {
      const { foodCode, foodName, quantity, foodPrice, foodCategory, vendor, vendorLocation, foodDescription, partnerId } = req.body;
      const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';

      // Check if the vendor already exists
      let existingVendor = await Vendor.findOne({ vendor });

      // If the restaurant doesn't exist, create it
      if (!existingVendor) {
        const newVendor = new Vendor({
          vendor,
          foodCategory
        });
        existingVendor = await newVendor.save();
      }

      // Create the new dish
      const newFood = new Food({
        foodCode,
        foodName,
        quantity,
        foodPrice,
        foodCategory,
        vendor,
        vendorLocation,
        foodDescription,
        partnerId,
        imageUrl
      });

      await newFood.save();
      console.log('New food created:', newFood);
      res.status(201).json({ success: true, food: newFood });
    } catch (error) {
      console.error('Error creating food:', error);
      res.status(500).json({ success: false, message: 'Error creating food', error });
    }
  });
});

// Route to get food details by foodCode
appRouter.get('/food/:foodCode', async (req, res) => {
  try {
    const food = await Food.findOne({ foodCode: req.params.foodCode });
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    res.json(food);
  } catch (error) {
    console.error('Error fetching food details:', error);
    res.status(500).json({ error: 'Failed to fetch food details', message: error.message });
  }
});

// Route to update food details
appRouter.put('/foods/:foodCode', (req, res) => {
  console.log(req.body); // Log the request body to see what's received
  console.log(req.body)
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
    }
    try {
      const { foodName, foodPrice, quantity, foodCategory, vendor, vendorLocation, foodDescription, discount } = req.body;
      let imageUrl;
      if (req.file) {
        imageUrl = '/uploads/images/' + req.file.filename; // Path to the uploaded file
      }
      const updatedFields = {};
      if (foodName) updatedFields.foodName = foodName;
      if (foodPrice) updatedFields.foodPrice = foodPrice;
      if (quantity) updatedFields.quantity = quantity;
      if (foodCategory) updatedFields.foodCategory = foodCategory;
      if (vendor) updatedFields.vendor = vendor;
      if (vendorLocation) updatedFields.vendorLocation = vendorLocation;
      if (foodDescription) updatedFields.foodDescription = foodDescription;
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
      if (updatedFields.foodPrice || updatedFields.discount) {
        const price = updatedFields.foodPrice * 1.2 || foodPrice * 1.2;
        const discountValue = updatedFields.discount || discount;
        updatedFields.discountedPrice = price - (price * discountValue / 100);
      }


      const updatedFood = await Food.findOneAndUpdate({ foodCode: req.params.foodCode }, updatedFields, { new: true });

      if (!updatedFood) {
        return res.status(404).json({ error: 'Food not found' });
      }

      res.json({ message: 'Food updated successfully', food: updatedFood });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update food', message: error.message });
    }
  });
});


// Route to get all foods
appRouter.get('/foods', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// route to fetch discounted dishes
appRouter.get('/discounts', async (req, res) => {
  try {
    // Find foods where the discount field is greater than 1
    const discountedFoods = await Food.find({ discount: { $gt: 1 } });

    res.json(discountedFoods);
  } catch (error) {
    console.error('Error fetching discounted foods:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a food item by foodCode
appRouter.delete('/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Food.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// VENDORS SCHEMA AND ITS ROUTES
const vendorSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  vendorImgUrl: { type: String, required: false },
  vendor: { type: String, required: true,  validate: {
    validator: (v) => v.trim() !== '',
    message: '{VALUE} is required'
  } },
  vendorLocation: { type: String, required: true, validate: {
    validator: (v) => v.trim() !== '',
    message: '{VALUE} is required'
  }},
  foodCategory: { type: String, required: true },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
});

const Vendor = mongoose.model("Vendor", vendorSchema);


appRouter.post('/vendors', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { partnerId, vendor, vendorLocation, foodCategory, vendorImgUrl } = req.body;
    console.log('Extracted fields:', { partnerId, vendor, vendorLocation, foodCategory, vendorImgUrl });
    const newVendor = new Vendor({
      partnerId,
      vendor,
      vendorLocation,
      foodCategory,
      vendorImgUrl,
    });
    console.log('Created new Vendor:', newVendor);
    await newVendor.save();
    console.log('Saved Vendor:', newVendor);
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Check if the partner has any restaurants
appRouter.get('/vendors/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const vendors = await Vendor.find({ partnerId });
    if (vendors.length === 0) {
      return res.status(404).json({ message: 'No vendors found' });
    }
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

appRouter.get('/partner_foods', async (req, res) => {
  const { vendorName } = req.query;

  try {
    const foods = await Food.find({ vendor: vendorName }).sort({ createdAt: -1 });
    res.json({ message: 'Foods retrieved successfully', foods });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching foods', error }); 
  }
});

// //RATING SCHEMA AND ITS ROUTES

const foodRatingSchema = new Schema({
  item_id: { type: Schema.Types.ObjectId, required: true },
  item_type: { type: String, enum: ['Food', 'Vendor'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'], default: 'Order received' },
  createdAt: { type: Date, default: Date.now }
});

const FoodRating = mongoose.model('FoodRating', foodRatingSchema);

appRouter.post('/foodRating', async (req, res) => {
  const { item_id, item_type, rating } = req.body;

  try {
    // Validate input
    if (!item_id || !item_type || rating == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create a new rating
    const newFoodRating = new FoodRating({
      item_id,
      item_type,
      rating
    });

    await newFoodRating.save();

    // Update the average rating for the item
    const ratings = await FoodRating.find({ item_id, item_type });
    const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length) : 0;
    const ratingCount = ratings.length;

    let itemModel;

    if (item_type === 'Food') {
      itemModel = Food;
    } else if (item_type === 'Vendor') {
      itemModel = Vendor;
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

appRouter.get('/rating/:item_id/:item_type', async (req, res) => {
  const { item_id, item_type } = req.params;

  try {
    let itemModel;
    if (item_type === 'Food') {
      itemModel = Food;
    } else if (item_type === 'Vendor') {
      itemModel = Vendor;
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


//ORDER SCHEMAS AND ITS ROUTES
const orderFoodSchema = new Schema({
  food: { type: String, required: true },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  foodPrice: { type: Number, required: true }
});

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  selectedCategory: { type: String, required: false },
  selectedVendor: { type: String, required: true },
  customerLocation: { type: String, required: true },
  expectedDeliveryTime: { type: String, required: true },
  foods: [
    {
      foodCode: { type: String, required: true },
      foodName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  deliveryCharges: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'], default: 'Order received' },
});

const FoodOrder = model('FoodOrder', orderSchema);



//WORKINGS AFTER MPESA PAYMENT HAS BEEN DONE
appRouter.post('/paidFoodOrder', async (req, res) => {
  console.log('Received order data:', req.body);
  console.log('foodOrderDetails');
  try {
    const foodOrderDetails = req.body;

    // Ensure unique order ID
    foodOrderDetails.orderId = uuidv4();

    // Set initial status
    foodOrderDetails.status = 'Order received';

    // Save order to database
    await saveOrder(foodOrderDetails);

    res.status(200).json({ message: 'Order saved successfully' });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Function to save order details in the database
async function saveOrder(foodOrderDetails) {
  const foodOrder = new FoodOrder({
    orderId: foodOrderDetails.orderId,
    phoneNumber: foodOrderDetails.phoneNumber,
    selectedCategory: foodOrderDetails.selectedCategory,
    selectedVendor: foodOrderDetails.selectedVendor,
    customerLocation: foodOrderDetails.customerLocation,
    expectedDeliveryTime: foodOrderDetails.expectedDeliveryTime,
    foods: foodOrderDetails.foods,
    deliveryCharges: foodOrderDetails.deliveryCharges,
    totalPrice: foodOrderDetails.totalPrice,
    delivered: false,
    paid: true, // Assuming the payment was successful
    status: foodOrderDetails.status
  });

  // Conditionally add userId and customerName if they exist
  if (foodOrderDetails.userId) {
    order.userId = foodOrderDetails.userId;
  }

  if (foodOrderDetails.customerName) {
    order.customerName = foodOrderDetails.customerName;
  }

  try {
    await foodOrder.save();
    console.log('Order saved successfully');
  } catch (error) {
    console.error('Error saving order:', error);
    throw error; // Rethrow the error so that it can be handled by the caller
  }
}
//get orders
appRouter.get('/orders/:orderId', async (req, res) => {
  try {
    const foodOrder = await FoodOrder.findOne({ orderId: req.params.orderId });
    if (foodOrder) {
      res.json(foodOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Update order status
appRouter.patch('/updateOrderStatus/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const foodOrder = await FoodOrder.findOneAndUpdate(
      { orderId: orderId },
      { status: status },
      { new: true }
    );

    if (!foodOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', foodOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
});

// Fetch undelivered orders
appRouter.get('/orders/undelivered', async (req, res) => {
  try {
    const orders = await FoodOrder.find({ status: { $ne: 'Delivered' } });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});



module.exports = appRouter;
