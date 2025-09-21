// const multer = require('multer');
// const path = require('path');

// function checkFileType(file, cb) {
//   const imageFiletypes = /jpeg|jpg|png|gif/;
//   const videoFiletypes = /mp4|webm|ogg/;
//   const pdfFiletypes = /pdf/;
//   const extname = path.extname(file.originalname).toLowerCase();
//   const mimetype = file.mimetype;
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

// function createStorage(destinationFolder, filenamePrefix) {
//   return multer.diskStorage({
//     destination: `/var/data/uploads/${destinationFolder}`,
//     filename: (req, file, cb) => {
//       const uniqueName = `${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
//       cb(null, uniqueName);
//     },
//   });
// }

// const upload = multer({
//   storage: createStorage('images', 'image'),
//   limits: { fileSize: 1000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).single('image');

// const uploadMultiple = multer({
//   storage: createStorage('conferences', 'conference'),
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).fields([
//   { name: 'venueImages', maxCount: 5 },
//   { name: 'videoTours', maxCount: 4 },
//   { name: 'floorPlans', maxCount: 4 },
// ]);

// const uploadProfileImage = multer({
//   storage: createStorage('profile-images', 'profile'),
//   limits: { fileSize: 1000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).single('profileImage');

// const uploadBusinessPermit = multer({
//   storage: createStorage('business-permits', 'permit'),
//   limits: { fileSize: 2000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).single('businessPermit');

// const uploadProductImages = multer({
//   storage: createStorage('products', 'product'),
//   limits: { fileSize: 2000000 },
//   fileFilter: (req, file, cb) => checkFileType(file, cb),
// }).fields([{ name: 'images', maxCount: 5 }]);

// module.exports = {
//   upload,
//   uploadMultiple,
//   uploadProfileImage,
//   uploadBusinessPermit,
//   uploadProductImages,
// };

const multer = require('multer');
const path = require('path');

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

function checkProfileImageType(file, cb) {
  const imageFiletypes = /jpeg|jpg|png|gif/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  if (imageFiletypes.test(extname) && imageFiletypes.test(mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Profile image must be an image (jpeg, jpg, png, gif).'));
  }
}

function createStorage(destinationFolder, filenamePrefix) {
  return multer.diskStorage({
    destination: `/var/data/uploads/${destinationFolder}`,
    filename: (req, file, cb) => {
      const uniqueName = `${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

const upload = multer({
  storage: createStorage('images', 'image'),
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('image');

const uploadMultiple = multer({
  storage: createStorage('conferences', 'conference'),
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).fields([
  { name: 'venueImages', maxCount: 5 },
  { name: 'videoTours', maxCount: 4 },
  { name: 'floorPlans', maxCount: 4 },
]);

const uploadProfileImage = multer({
  storage: createStorage('profile-images', 'profile'),
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('profileImage');

const uploadBusinessPermit = multer({
  storage: createStorage('business-permits', 'permit'),
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('businessPermit');

const uploadProductImages = multer({
  storage: createStorage('products', 'product'),
  limits: { fileSize: 2000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).fields([{ name: 'images', maxCount: 5 }]);

const uploadSignupFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const destinationFolder = file.fieldname === 'businessPermit' ? 'business-permits' : 'profile-images';
      cb(null, `/var/data/uploads/${destinationFolder}`);
    },
    filename: (req, file, cb) => {
      const prefix = file.fieldname === 'businessPermit' ? 'permit' : 'profile';
      const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 2000000 }, // Use 2MB limit to accommodate businessPermit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      checkProfileImageType(file, cb); // Stricter validation for profileImage
    } else if (file.fieldname === 'businessPermit') {
      checkFileType(file, cb); // Use existing checkFileType for businessPermit
    } else {
      cb(new Error('Error: Unexpected field name.'));
    }
  },
}).fields([
  { name: 'businessPermit', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
]);

module.exports = {
  upload,
  uploadMultiple,
  uploadProfileImage,
  uploadBusinessPermit,
  uploadProductImages,
  uploadSignupFiles,
};