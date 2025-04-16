const multer = require('multer');
const path = require('path');

// Set storage engine for images
const storage = multer.diskStorage({
  destination: '/var/data/uploads/images',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image');

// Set storage engine for conference files
const conferenceStorage = multer.diskStorage({
  destination: '/var/data/uploads/conferences',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadMultiple = multer({
  storage: conferenceStorage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'venueImages', maxCount: 5 },
  { name: 'videoTours', maxCount: 4 },
  { name: 'floorPlans', maxCount: 4 }
]);

// Set storage engine for profile images
const profileStorage = multer.diskStorage({
  destination: '/var/data/uploads/profile-images',
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('profileImage');

// Set storage engine for business permit PDFs
const permitStorage = multer.diskStorage({
  destination: '/var/data/uploads/business-permits', // <--- you can change this path
  filename: (req, file, cb) => {
    cb(null, 'permit-' + Date.now() + path.extname(file.originalname));
  }
});

const uploadBusinessPermit = multer({
  storage: permitStorage,
  limits: { fileSize: 2000000 }, // 2MB limit for permits
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('businessPermit'); // <--- match with your form field name

// Updated function to check file types
function checkFileType(file, cb) {
  const imageFiletypes = /jpeg|jpg|png|gif/;
  const videoFiletypes = /mp4|webm|ogg/;
  const pdfFiletypes = /pdf/;

  const extname = path.extname(file.originalname).toLowerCase().slice(1); // e.g., 'jpg'
  const mimetype = file.mimetype;

  if (
    (imageFiletypes.test(extname) && imageFiletypes.test(mimetype)) ||
    (videoFiletypes.test(extname) && videoFiletypes.test(mimetype)) ||
    (pdfFiletypes.test(extname) && mimetype === 'application/pdf')
  ) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only Images, Videos, and PDF files are allowed!'));
  }
}


// Set storage engine for product images
const productStorage = multer.diskStorage({
  destination: '/var/data/uploads/products', // Dedicated path for product images
  filename: (req, file, cb) => {
    cb(null, 'product-' + Date.now() + path.extname(file.originalname)); // Unique filename for each product image
  }
});

const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 2000000 }, // 2MB limit for product images
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb); // Reuse the existing file type checker
  }
}).fields([
  { name: 'images', maxCount: 5 },       // regular images
  { name: 'primaryImage', maxCount: 1 }  // primary image
]);
// Updated function to check file types
function checkFileType(file, cb) {
  const imageFiletypes = /jpeg|jpg|png|gif/;
  const extname = path.extname(file.originalname).toLowerCase().slice(1); // e.g., 'jpg'
  const mimetype = file.mimetype;

  if (imageFiletypes.test(extname) && imageFiletypes.test(mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only image files are allowed!'));
  }
}

module.exports = {
  upload,
  uploadMultiple,
  uploadProfileImage,
  uploadBusinessPermit,
  uploadProductImages // Export the new product image uploader
};
