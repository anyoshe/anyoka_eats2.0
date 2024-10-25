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
      const { foodCode, foodName, quantity, foodPrice, foodCategory, vendor, foodDescription, partnerId } = req.body;
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
      const { foodName, foodPrice, quantity, foodCategory, vendor, foodDescription, discount } = req.body;
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

// Delete a food item
appRouter.delete('/foods/:identifier', async (req, res) => {
  const { identifier } = req.params;
 

  try {
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier not provided' });
    }

    const deletedFood = await Food.findOneAndDelete({
      $or: [
        { foodCode: new RegExp(`^${identifier}$`, 'i') },
        { _id: identifier }
      ]
    });

    if (!deletedFood) {
      return res.status(404).json({ error: 'Food not found' });
    }

    res.json({ message: 'Food deleted successfully', deletedFood });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food', message: error.message });
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
  ratingCount: { type: Number, default: 0 },
  _id: { type: String, required: true }
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



appRouter.put('/vendors/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(updateData);

  try {
    // Fetch the existing vendor from the database
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const oldVendorName = vendor.vendor; // Save the original vendor name

    // Update only the provided fields, keeping original values for others
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== '') {
        vendor[key] = updateData[key]; // Update field only if value is not undefined or null or empty
      }
    });

    // Save the updated vendor document
    const updatedVendor = await vendor.save();

    // If the vendor name has changed, update all related foods
    if (updateData.vendor && updateData.vendor !== oldVendorName) {
      const result = await Food.updateMany(
        { vendor: oldVendorName }, // Match foods with the old vendor name
        { $set: { vendor: updateData.vendor } } // Update to the new vendor name
      );
      console.log(`Updated ${result.nModified} foods with new vendor name.`);
    }

    res.status(200).json({ message: 'Vendor and associated foods updated successfully', vendor: updatedVendor });
  } catch (error) {
    console.error('Error updating vendor or foods:', error);
    res.status(500).json({ message: 'Error updating vendor or foods', error });
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
// Route to get vendor location
appRouter.get('/vendors/vendor/:vendorName', async (req, res) => {
  try {
    // Get vendor name from URL and normalize (trim and lowercase)
    const vendorName = req.params.vendorName.trim().toLowerCase();
    console.log('Received request for vendor location:', vendorName);

    // Search for the vendor in the database, case-insensitive
    const vendor = await Vendor.findOne({ vendor: new RegExp(`^${vendorName}$`, 'i') });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Respond with the vendor's location
    return res.status(200).json({
      vendorLocation: vendor.vendorLocation,
    });
  } catch (error) {
    console.error('Error fetching vendor location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
appRouter.get('/vendors/:vendorId', async (req, res) => {
  const { vendorId } = req.params;

  try {
    // Fetch the vendor details from the database
    const vendor = await Vendor.findById(vendorId).select('vendor vendorLocation');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Respond with the vendor details
    res.json({
      vendorName: vendor.vendor,
      vendorLocation: vendor.vendorLocation
    });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


appRouter.delete('/vendors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Find the vendor by ID
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get the vendor name to identify associated foods
    const vendorName = vendor.vendor;

    // Delete all foods associated with this vendor
    await Food.deleteMany({ vendor: vendorName });

    // Delete the restaurant
    await Vendor.findByIdAndDelete(id);

    res.status(200).json({ message: 'Vendor and associated foods deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Error deleting vendor', error });
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

// Example of a backend route
appRouter.get('/partners/:id/vendors', async (req, res) => {
  try {
    const partnerId = req.params.id;
    const vendors = await Vendor.find({ partnerId: partnerId });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
  customerLocation: { type: String, required: true },
  expectedDeliveryTime: { type: String, required: true },
  deliveryCharges: { type: Number, required: true },
  // Track vendor-specific orders
  vendorOrders: [
    {
      vendor: { type: String, required: true },  // Reference to the vendor
      foods: [
        {
          foodCode: { type: String, required: true },
          foodName: { type: String, required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true }
        }
      ],
      deliveryCharges: { type: Number, required: false },
      vendorLocation: { type: String, required: true },
      totalPrice: { type: Number, required: true },
      status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'], default: 'Order received' },
      processedTime: { type: Date } // To track when each vendor order is processed
    }
  ],

  // General status tracking
  totalPrice: { type: Number, required: true },  // Total price of the combined orders
  createdAt: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  
  // Overall order status
  overallStatus: { type: String, enum: ['Waiting for vendors', 'Ready for pickup', 'Dispatched', 'On Transit', 'Delivered'], default: 'Waiting for vendors' },
  driverId: { type: String, required: false },
  driverDetails: {
    name: { type: String },
    contactNumber: { type: String },
    vehicleRegistration: { type: String }
  },
  pickedAt: { type: Date }
});


const FoodOrder = model('FoodOrder', orderSchema);


const vendorOrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true }, 
  parentOrderId: { type: String, required: true },
  vendor: { type: String, required: true },
  foods: {
    type: [{
      foodCode: { type: String, required: true },
      foodName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }],
    validate: {
      validator: function(foods) {
        return foods && foods.length > 0; // Ensure there is at least one food item
      },
      message: 'At least one food item is required.'
    },
    required: true // Set this to true to ensure the field itself is required
  },
  deliveryCharges: { type: Number, required: false },
  vendorLocation: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'], 
    default: 'Order received' 
  },
  processedTime: { type: Date },
  driverId: { type: String, required: false },
  driverDetails: {
    name: { type: String },
    contactNumber: { type: String },
    vehicleRegistration: { type: String }
  },
  pickedAt: { type: Date },
 
});

const VendorOrder = model('VendorOrder', vendorOrderSchema);

appRouter.post('/paidFoodOrder', async (req, res) => {
  console.log('Received order data:', req.body);
  console.log('Received order data (stringified):', JSON.stringify(req.body, null, 2));

  try {
    const foodOrderDetails = req.body;

    // Ensure unique parent order ID
    // foodOrderDetails.orderId = uuidv4(); // Parent order ID
    foodOrderDetails.status = 'Order received';

    console.log('Generated unique parent order ID:', foodOrderDetails.orderId);

    // Save both parent and child orders
    await saveOrder(foodOrderDetails);

    res.status(200).json({ message: 'Order saved successfully' });
  } catch (error) {
    console.error('Error in /paidFoodOrder route:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
});


async function saveOrder(foodOrderDetails) {
  console.log('Inside saveOrder function. Details:', foodOrderDetails);

  try {
    // First, create the parent order without the vendorOrders
    const parentOrder = new FoodOrder({
      orderId: foodOrderDetails.orderId,
      phoneNumber: foodOrderDetails.phoneNumber,
      customerLocation: foodOrderDetails.customerLocation,
      expectedDeliveryTime: foodOrderDetails.expectedDeliveryTime,
      totalPrice: foodOrderDetails.totalPrice,
      deliveryCharges: foodOrderDetails.deliveryCharges,
      delivered: false,
      paid: true,
      status: foodOrderDetails.status,
      createdAt: new Date(),
      vendorOrders: [] // This will be updated later
    });

    if (foodOrderDetails.userId) {
      parentOrder.userId = foodOrderDetails.userId;
    }

    if (foodOrderDetails.customerName) {
      parentOrder.customerName = foodOrderDetails.customerName;
    }

    console.log('Parent order (initial) to be saved:', parentOrder);

    // Now map through vendorOrders, already passed via `foodOrderDetails`
    const vendorOrders = foodOrderDetails.vendorOrders.map(order => {
      if (!order.foods || order.foods.length === 0) {
        console.error(`Error: No foods found for vendor ${order.vendor}. Skipping this vendor.`);
        return null; // Skip this vendor if no foods
      }

      return {
        ...order,
        orderId: uuidv4() // Generate unique order ID for each vendor order
      };
    }).filter(order => order !== null); // Filter out null orders if no foods

    console.log('Mapped vendor orders:', vendorOrders);

    // Save the parent order first without vendor orders
    await parentOrder.save();
    console.log('Parent order saved successfully:', parentOrder);

    // Save each vendor-specific order as a child order
    const savedVendorOrders = [];
    for (const vendorOrder of vendorOrders) {
      const childOrder = new VendorOrder({
        parentOrderId: parentOrder.orderId, // Reference to the parent order
        vendor: vendorOrder.vendor,
        foods: vendorOrder.foods,
        totalPrice: vendorOrder.totalPrice,
        vendorLocation: vendorOrder.vendorLocation,
        status: vendorOrder.status,
        processedTime: vendorOrder.processedTime,
        orderId: vendorOrder.orderId // Reuse the generated unique order ID for each vendor order
      });

      const savedChildOrder = await childOrder.save();
      console.log(`Child order for vendor ${vendorOrder.vendor} saved successfully with ID: ${savedChildOrder.orderId}`);
      
      savedVendorOrders.push(savedChildOrder); // Collect saved vendor orders
    }

    // Update the parent order with the saved vendor orders
    parentOrder.vendorOrders = savedVendorOrders;
    await parentOrder.save(); // Save the updated parent order
    console.log('Parent order updated with vendor orders:', parentOrder);

  } catch (error) {
    console.error('Error saving order in saveOrder function:', error);
    throw error;
  }
}

// Assuming you're using Express and have already set up your app and router
appRouter.get('/driverDashboard/orders/readyForPickup', async (req, res) => {
  try {
    // Log incoming request details
    console.log('Incoming request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body // Note: req.body will only show data if you're using body parsing middleware like body-parser
    });

    // Fetch parent orders with status 'Ready for pickup'
    const orders = await FoodOrder.find({ overallStatus: 'Ready for pickup' })
      .populate('vendorOrders.foods') // Populate food details within vendor orders
      .exec();

    // Check if orders are found
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders ready for pickup found.' });
    }

    // Respond with the fetched orders
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders for driver dashboard:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders for driver dashboard.' });
  }
});

// Update driver ID and status for a food order and its vendor orders
appRouter.patch('/driverUpdateFoodOrderStatus/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status, driverId } = req.body;
  console.log('Request received with driverId:', driverId);

  try {
    // Find and update the parent food order
    const updatedOrder = await FoodOrder.findOneAndUpdate(
      { orderId },  // Query to find the order by orderId
      {
        // Update the overallStatus and driverId separately
        $set: {
          'vendorOrders.$[].status': status,  // Update all vendor orders' status
          overallStatus: status,  // Update the parent food order status
          driverId: driverId  // Set the driverId
        }
      },
      { new: true }  // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Food order not found' });
    }

    console.log('Food order updated with driverId and status:', updatedOrder);
    res.json(updatedOrder);  // Respond with the updated order

  } catch (error) {
    console.error('Error updating food order status:', error);
    res.status(500).json({ message: 'Error updating food order status' });
  }
});


appRouter.patch('/updateVendorOrderStatus/:vendorId', async (req, res) => {
  const { vendorId } = req.params;
  const { status } = req.body;

  try {
      const updatedVendorOrder = await VendorOrder.findByIdAndUpdate(vendorId, { status }, { new: true });

      if (!updatedVendorOrder) {
          return res.status(404).json({ message: 'Vendor order not found' });
      }

      res.status(200).json(updatedVendorOrder);
  } catch (error) {
      res.status(500).json({ message: 'Failed to update vendor order status', error });
  }
});

// PATCH route to update vendor-specific food orders for the given parent order
appRouter.patch('/updateVendorOrderStatus/:vendorOrderId', async (req, res) => {
  try {
      const { vendorOrderId } = req.params;
      const { status } = req.body;

      // Update the specific vendor order's status
      const updatedVendorOrder = await FoodOrder.updateOne(
          { 'vendorOrders._id': vendorOrderId }, // Find the specific vendor order by ID
          { $set: { 'vendorOrders.$.status': status } } // Update its status
      );

      if (updatedVendorOrder.nModified === 0) {
          return res.status(404).json({ message: 'Vendor order not found' });
      }

      res.json({ message: 'Vendor order status updated successfully', updatedVendorOrder });
  } catch (error) {
      console.error('Error updating vendor order status:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

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

const updateVendorOrderStatus = async (orderId, vendorId, newStatus) => {
  // Step 1: Retrieve the parent order using the orderId
  const order = await FoodOrder.findOne({ orderId });
  
  if (!order) {
    throw new Error('Order not found');
  }

  // Step 2: Find the specific vendor's order within the parent order's vendorOrders
  const vendorOrder = order.vendorOrders.find(v => v.vendor === vendorId);
  
  if (!vendorOrder) {
    throw new Error('Vendor order not found');
  }

  // Step 3: Update the status of the vendor's order
  vendorOrder.status = newStatus;

  // Step 4: If the new status is "Processed and packed", update the processedTime
  if (newStatus === 'Processed and packed') {
    vendorOrder.processedTime = Date.now();
  }

  // Step 5: Check if all vendor orders are 'Processed and packed'
  const allProcessed = order.vendorOrders.every(v => v.status === 'Processed and packed');

  // Step 6: If all vendor orders are 'Processed and packed', update the overall status
  if (allProcessed) {
    order.overallStatus = 'Ready for pickup';
  }

  // Step 7: Save the updated order
  await order.save();
  return order;
};

// PATCH route for updating a vendor order's status
appRouter.patch('/updateFoodOrderStatus/:orderId/:vendorId', async (req, res) => {
  try {
    const { orderId, vendorId } = req.params;
    const { status } = req.body;

    // Update the vendor order status
    const updatedOrder = await updateVendorOrderStatus(orderId, vendorId, status);

    res.json({ message: 'Order status updated successfully', updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

appRouter.patch('/updateFoodOrderStatus/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { overallstatus } = req.body; // Incorrect field name

    // Use correct field name from the schema
    const foodOrder = await FoodOrder.findOneAndUpdate(
      { orderId: orderId },
      { overallStatus: overallstatus }, // Correct field name is `overallStatus`
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




// Assuming you're using Express and Mongoose
appRouter.patch('/updateVendorOrderStatus/:vendorOrderId', async (req, res) => {
  try {
      const { vendorOrderId } = req.params;
      const { status } = req.body;

      // Update the specific vendor order's status
      const updatedVendorOrder = await FoodOrder.updateOne(
          { 'vendorOrders._id': vendorOrderId }, // Find the specific vendor order by ID
          { $set: { 'vendorOrders.$.status': status } } // Update its status
      );

      if (updatedVendorOrder.nModified === 0) {
          return res.status(404).json({ message: 'Vendor order not found' });
      }

      res.json({ message: 'Vendor order status updated successfully', updatedVendorOrder });
  } catch (error) {
      console.error('Error updating vendor order status:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// appRouter.patch('/revertVendorOrderStatus/:vendorId', async (req, res) => {
//   try {
//     const { vendorId } = req.params;  // Ensure the vendor order ID is correct
//     const { status } = req.body;      // The new status to revert to

//     // Log the request for debugging purposes
//     console.log(`Reverting vendor order ${vendorId} with status: ${status}`);

//     // Log the incoming status value
//     console.log('Status in request body:', status);

//     // Check if the status is one of the valid enum values
//     const validStatuses = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: 'Invalid status value' });
//     }

//     // Fetch the vendor order first to ensure it exists
//     const vendorOrder = await VendorOrder.findById(vendorId).exec();
//     if (!vendorOrder) {
//       console.log(`Vendor order ${vendorId} not found`);
//       return res.status(404).json({ message: 'Vendor order not found' });
//     }

//     // Proceed with the update
//     const updatedVendorOrder = await VendorOrder.findByIdAndUpdate(
//       vendorId,
//       { status: status },   // Correctly update the status field
//       { new: true }         // Return the updated document
//     ).exec();
    
//     console.log('Updated vendor order:', updatedVendorOrder);

//     // Check if the update was successful
//     if (!updatedVendorOrder) {
//       return res.status(404).json({ message: 'Vendor order not found after update attempt' });
//     }

//     // Respond with success
//     res.json({ message: 'Vendor order status reverted successfully', updatedVendorOrder });
//   } catch (error) {
//     console.error('Error reverting vendor order status:', error);
//     res.status(500).json({ message: 'Error reverting vendor order status', error: error.message });
//   }
// });
appRouter.patch('/revertVendorOrderStatus/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;  // vendorId refers to the ID inside vendorOrders array
    const { status } = req.body;      // The new status to revert to

    // Log the request details for debugging
    console.log(`Attempting to revert status for vendor order ${vendorId} with status: ${status}`);

    const validStatuses = ['Order received', 'Processed and packed', 'Dispatched', 'On Transit', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the parent order and update the vendor order within the array
    const parentOrder = await FoodOrder.findOneAndUpdate(
      { 'vendorOrders._id': vendorId },   // Replace ParentOrder with FoodOrder
      {
        $set: {
          'vendorOrders.$.status': status,
          'vendorOrders.$.processedTime': new Date(),
        },
      },
      { new: true }  // Return the updated document
    ).exec();

    // Check if the parent order was found
    if (!parentOrder) {
      console.error(`Vendor order with ID ${vendorId} not found`);
      return res.status(404).json({ message: 'Vendor order not found' });
    }

    // Log the updated parent order for verification
    console.log('Vendor order status successfully reverted:', parentOrder);

    // Return success response
    res.json({ message: 'Vendor order status reverted successfully', parentOrder });
  } catch (error) {
    // Log the detailed error message
    console.error('Error reverting vendor order status:', error);
    res.status(500).json({ message: 'Error reverting vendor order status', error: error.message });
  }
});


// Define the new route to fetch the fresh food order by status
appRouter.get('/fetchFoodOrderByStatus/:orderId/:driverId', async (req, res) => {
  const { orderId, driverId } = req.params;
  console.log("Order ID:", orderId, "Driver ID:", driverId);

  try {
      const foodOrder = await FoodOrder.findOne({ orderId, driverId });
      console.log("Fetched Order:", foodOrder);

      if (!foodOrder) {
          console.error(`Food order not found for Order ID: ${orderId}, Driver ID: ${driverId}`);
          return res.status(404).json({ error: 'Fresh food order not found' });
      }

      res.json(foodOrder);
  } catch (error) {
      console.error('Error fetching fresh food order:', error);
      res.status(500).json({ error: 'Failed to fetch the fresh food order' });
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

// Fetch parent orders with status "Ready for pickup" for driver dashboard
appRouter.get('/driverOrders', async (req, res) => {
  console.log(req.body);
  try {
    // Find parent orders that are "Ready for pickup" and not yet delivered
    const parentOrders = await FoodOrder.find({
      delivered: false, 
      overallStatus: 'Ready for pickup'  // Update to use overallStatus
    }).populate('vendorOrders'); // Ensure vendorOrders is correctly populated

    console.log("Fetched Parent Orders:", parentOrders);
    
    // Return the fetched parent orders to the driver dashboard
    res.status(200).json(parentOrders);
  } catch (error) {
    console.error('Error fetching driver orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders for driver' });
  }
});

// Example route for fetching food orders
appRouter.get('/foodOrders', async (req, res) => {
  try {
    const foodOrders = await FoodOrder.find(); // Adjust this according to your database schema
    res.json(foodOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food orders' });
  }
});

appRouter.get('/getFoodOrder/:orderId', async (req, res) => {
  const { orderId } = req.params;
  console.log(orderId);
  try {
    const foodOrder = await FoodOrder.findOne({ orderId }); // Ensure you're querying by the custom UUID
    console.log(foodOrder);
    if (!foodOrder) {
      return res.status(404).json({ message: 'Food order not found' });
    }
    
    res.json(foodOrder);
  } catch (error) {
    console.error('Error fetching food order:', error);
    res.status(500).json({ message: 'Error fetching food order' });
  }
});
// Update Parent Food Order Status
appRouter.patch('/updateParentFoodOrderStatus/:orderId', async (req, res) => {
  const { orderId } = req.params; // This is your custom order ID
  const { overallStatus } = req.body;

  try {
    // Use findOneAndUpdate to find the order by your custom field "orderId"
    const updatedOrder = await FoodOrder.findOneAndUpdate(
      { orderId }, // Match the orderId field (UUID in your case)
      { overallStatus }, 
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Food order not found' });
    }

    res.status(200).json({
      message: 'Food order status updated successfully',
      overallStatus: updatedOrder.overallStatus
    });
  } catch (error) {
    console.error('Error updating parent food order status:', error);
    res.status(500).json({ message: 'Error updating parent food order status' });
  }
});




module.exports = appRouter;
