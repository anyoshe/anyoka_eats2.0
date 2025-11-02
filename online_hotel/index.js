require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
// const routes = require('./routes/routes.js');
const { router, Order, SubOrder } = require('./routes/routes.js'); 
const bodyParser = require('body-parser');

const app = express();
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

// Serve static files from the uploads directory
// Serve static files from the uploads directory
// app.use('/uploads', express.static('/var/data/uploads'));
// Serve static files from the 'public' directory
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Passport Configuration
passport.use(new LocalStrategy(
  { usernameField: 'contactNumber' },
  async (username, password, done) => {
    try {
      const partner = await Partner.findOne({ contactNumber: username });
      if (!partner) return done(null, false);
      const match = await bcrypt.compare(password, partner.password);
      if (!match) return done(null, false);
      return done(null, partner); 
    } catch (err) {
      return done(err);
    }
  }
));

// Session Configuration
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', router);

// File Uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '/var/data/uploads')));
app.use('/uploads/images', express.static(path.join('/var/data/uploads/images')));
app.use('/uploads/profile-images', express.static(path.join('/var/data/uploads/profile-images')));
app.use('/uploads/conferences', express.static(path.join('/var/data/uploads/conferences')));
app.use('/uploads/business-permits', express.static(path.join('/var/data/uploads/business-permits')));
app.use('/uploads/products', express.static(path.join('/var/data/uploads/products')));

const fs = require('fs');

// List of upload directories
const uploadDirectories = [
  '/var/data/uploads',
  '/var/data/uploads/images',
  '/var/data/uploads/profile-images',
  '/var/data/uploads/conferences',
  '/var/data/uploads/business-permits',
  '/var/data/uploads/products',
];

// Ensure each directory exists
uploadDirectories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});
// Serve static files
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


const cron = require('node-cron');

// =============================
// CRON JOB: Notify Drivers for Stale Orders
// =============================
cron.schedule('*/5 * * * *', async () => {
  console.log('Checking for stale ReadyForPickup orders...');

  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const staleOrders = await Order.find({
      'delivery.option': 'platform',
      status: { $nin: ['Delivered', 'Confirmed Delivered'] },
      $expr: {
        $and: [
          { $eq: [{ $size: '$subOrders' }, { $size: { $filter: { input: '$subOrders', cond: { $eq: ['$$this.status', 'ReadyForPickup'] } } } }] },
        ],
      },
      $or: [
        { driverNotified: false },
        { driverNotificationSentAt: { $lt: fiveMinutesAgo } }
      ]
    }).populate({
      path: 'subOrders',
      populate: { path: 'shop', select: 'businessName location' }
    });

    for (const order of staleOrders) {
      await notifyDriversForOrder(order);
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

async function notifyDriversForOrder(order) {
  const shopLocations = order.subOrders.map(so => ({
    name: so.shop.businessName,
    location: so.shop.location,
  }));

  let notified = false;

  for (const subOrder of order.subOrders) {
    const shop = subOrder.shop;
    if (!shop?.location) continue;

    const shopCoords = await parsePlusCodeToLatLng(shop.location);
    if (!shopCoords) continue;

    const drivers = await Driver.find({
      status: 'Available',
      'currentLocation.location': { $exists: true }
    });

    for (const driver of drivers) {
      const driverCoords = await parsePlusCodeToLatLng(driver.currentLocation.location);
      if (!driverCoords) continue;

      const distance = geolib.getDistance(shopCoords, driverCoords);
      if (distance > 5000) continue;

      // Send notification
      notifyDriver(driver._id.toString(), {
        type: 'AllSubOrdersReady',
        message: 'All suborders ready for pickup',
        orderId: order._id,
        shops: shopLocations,
      });

      await DriverNotification.create({
        driver: driver._id,
        orderId: order._id,
        message: 'All suborders ready',
        status: 'ReadyForPickup',
      }).catch(err => console.error('Notification error:', err));

      notified = true;
    }
  }

  // Update order
  await Order.findByIdAndUpdate(order._id, {
    driverNotified: true,
    driverNotificationSentAt: new Date(),
    lastDriverCheckAt: new Date(),
  });

  if (notified) {
    console.log(`Notified drivers for stale order ${order._id}`);
  }
}

cron.schedule('0 * * * *', async () => { // every hour
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const staleOrders = await Order.find({
    paymentMethod: 'Mpesa',
    paymentStatus: 'Pending',
    createdAt: { $lt: cutoff },
  });

  for (const order of staleOrders) {
    if (['own', 'platform'].includes(order.delivery.option)) {
      await SubOrder.deleteMany({ parentOrder: order._id });
      await Order.deleteOne({ _id: order._id });
      console.log(`🧹 Removed stale unpaid order ${order._id}`);
    }
  }
});
// Error Handler
function errorHandler(err, req, res, next) {
  console.error(err.stack); 
  res.status(err.status || 500).json({ message: err.message });
}
app.use(errorHandler);

// CORS Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

// Socket.IO Setup

const http = require('http');
// const app = require('./app'); // Your Express app
const { initSocket } = require('./socketServer');

const server = http.createServer(app);

initSocket(server);
// Database Connection Events
database.on('error', (error) => console.log(error));
database.once('connected', () => console.log('Database Connected'));

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
