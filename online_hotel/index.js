// require('dotenv').config();
// const bodyParser = require('body-parser');
// const { body } = require('express-validator');
// const express = require('express');
// const mongoose = require('mongoose');
// const routes = require('./routes/routes.js');
// const cors = require('cors');
// const shortid = require('shortid')
// const { connect, connection, Schema, model, Types} = mongoose;
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcryptjs');
// const session = require('express-session');
// const path = require('path');
// const mongoString = process.env.DATABASE_URL;
//  mongoose.connect(mongoString);
// const database = mongoose.connection
// const multer = require('multer');
// const { upload, uploadMultiple } = require('./config/multer');
// //M-Pesa credentials
// const consumerKey = 'qQwrKakcvG7xbcsm3ml5RYaxCrpAZADQxepMd2XdaGF7qtAi';
// const consumerSecret = 'UablzGVv3McnA6YIve1SdyGGelzAfVcqEXAVknvPa4JPyVYhIZCf7ClBXd4PURXz';
// const shortcode = '174379';
// const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0d8bf5a7b3e5e92e4773cfcc102ecb';


// const app = express(); 

// app.use(express.json());   
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(session({
//     secret: 'secret',
//     resave: false, 
//     saveUninitialized: false,
// }));

// function errorHandler(err, req, res, next) {
//     console.error(err.stack); // Log the error stack trace
//     res.status(500).send('An error occurred'); // Send a generic error response
//   }
  
//   app.use(errorHandler);

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(cors()); 
// app.use('/api', routes);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// // CORS headers for local development
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     next();
//   });

// app.listen(3000, () => {
//     console.log(`Server Started at ${3000}`) 
// })
// database.on('error', (error) => {
//     console.log(error)
// })  

// database.once('connected', () => {
//     console.log('Database Connected');
// })

require('dotenv').config();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes.js');
const cors = require('cors');
const { connect, connection, Schema, model, Types} = mongoose;
const shortid = require('shortid')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const appRoutes = require('./routes/appRouter.js');  // Correctly require your appRouter
const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;
const multer = require('multer');
const { upload, uploadMultiple } = require('./config/multer');

// server.js or any backend file
const googleApiKey = process.env.GOOGLE_API_KEY;


const app = express();

app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));

function errorHandler(err, req, res, next) {
  console.error(err.stack); // Log the error stack trace
  res.status(500).send('An error occurred'); // Send a generic error response
}

app.use(errorHandler);

app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', appRoutes);  // Correctly use your appRouter

// CORS headers for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
});

database.on('error', (error) => {
  console.log(error)
});

database.once('connected', () => {
  console.log('Database Connected');
});
