// const multer = require('multer');
// const path = require('path');

// // Helper function to check file types (consolidated for all use cases)
// function checkFileType(file, cb) {
//   const imageFiletypes = /jpeg|jpg|png|gif/;
//   const videoFiletypes = /mp4|webm|ogg/;
//   const pdfFiletypes = /pdf/;

//   const extname = path.extname(file.originalname).toLowerCase();
//   const mimetype = file.mimetype;

//   // Check file extension and mimetype for allowed types
//   if (
//     (imageFiletypes.test(extname) && imageFiletypes.test(mimetype)) ||
//     (videoFiletypes.test(extname) && videoFiletypes.test(mimetype)) ||
//     (pdfFiletypes.test(extname) && mimetype === 'application/pdf')
//   ) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Error: Only Images, Videos, and PDF files are allowed!'));
//   }
// }

// // Reusable storage setup function
// function createStorage(destinationFolder, filenamePrefix) {
//   return multer.diskStorage({
//     // destination: path.join(__dirname, `../uploads/${destinationFolder}`),
//         destination: `/var/data/uploads/${destinationFolder}`,
//     filename: (req, file, cb) => {
//       cb(null, `${filenamePrefix}-${Date.now()}${path.extname(file.originalname)}`);
//     },
//   });
// }

// // Multer upload setup for images
// const upload = multer({
//   storage: createStorage('images', 'image'),
//   limits: { fileSize: 1000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).single('image');

// // Multer upload setup for multiple conference-related files
// const uploadMultiple = multer({
//   storage: createStorage('conferences', 'conference'),
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).fields([
//   { name: 'venueImages', maxCount: 5 },
//   { name: 'videoTours', maxCount: 4 },
//   { name: 'floorPlans', maxCount: 4 }
// ]);

// // Multer upload setup for profile images
// const uploadProfileImage = multer({
//   storage: createStorage('profile-images', 'profile'),
//   limits: { fileSize: 1000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).single('profileImage');

// // Multer upload setup for business permit PDFs
// const uploadBusinessPermit = multer({
//   storage: createStorage('business-permits', 'permit'),
//   limits: { fileSize: 2000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).single('businessPermit');

// // Multer upload setup for product images
// const uploadProductImages = multer({
//   storage: createStorage('products', 'product'),
//   limits: { fileSize: 2000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).fields([
//   { name: 'images', maxCount: 5 },       // regular images
//   { name: 'primaryImage', maxCount: 1 }  // primary image
// ]);

// module.exports = {
//   upload,
//   uploadMultiple,
//   uploadProfileImage,
//   uploadBusinessPermit,
//   uploadProductImages,
// };
const multer = require('multer');
const path = require('path');

// Helper function to check file types
function checkFileType(file, cb) {
  const imageFiletypes = /jpeg|jpg|png|gif/;
  const videoFiletypes = /mp4|webm|ogg/;
  const pdfFiletypes = /pdf/;
  const extname = path.extname(file.originalname).toLowerCase();
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

// Reusable storage setup function
function createStorage(destinationFolder, filenamePrefix) {
  return multer.diskStorage({
    destination: `/var/data/uploads/${destinationFolder}`,
    filename: (req, file, cb) => {
      const uniqueName = `${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

// Multer upload setup for images
const upload = multer({
  storage: createStorage('images', 'image'),
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('image');

// Multer upload setup for multiple conference-related files
const uploadMultiple = multer({
  storage: createStorage('conferences', 'conference'),
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).fields([
  { name: 'venueImages', maxCount: 5 },
  { name: 'videoTours', maxCount: 4 },
  { name: 'floorPlans', maxCount: 4 },
]);

// Multer upload setup for profile images
const uploadProfileImage = multer({
  storage: createStorage('profile-images', 'profile'),
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('profileImage');

// Multer upload setup for business permit PDFs
const uploadBusinessPermit = multer({
  storage: createStorage('business-permits', 'permit'),
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('businessPermit');

// Multer upload setup for product images
const uploadProductImages = multer({
  storage: createStorage('products', 'product'),
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).array('images', 5);

module.exports = {
  upload,
  uploadMultiple,
  uploadProfileImage,
  uploadBusinessPermit,
  uploadProductImages,
};