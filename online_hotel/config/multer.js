
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

// function checkProfileImageType(file, cb) {
//   const imageFiletypes = /jpeg|jpg|png|gif/;
//   const extname = path.extname(file.originalname).toLowerCase();
//   const mimetype = file.mimetype;
//   if (imageFiletypes.test(extname) && imageFiletypes.test(mimetype)) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Error: Profile image must be an image (jpeg, jpg, png, gif).'));
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

// const uploadSignupFiles = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const destinationFolder = file.fieldname === 'businessPermit' ? 'business-permits' : 'profile-images';
//       cb(null, `/var/data/uploads/${destinationFolder}`);
//     },
//     filename: (req, file, cb) => {
//       const prefix = file.fieldname === 'businessPermit' ? 'permit' : 'profile';
//       const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
//       cb(null, uniqueName);
//     },
//   }),
//   limits: { fileSize: 2000000 }, // Use 2MB limit to accommodate businessPermit
//   fileFilter: (req, file, cb) => {
//     if (file.fieldname === 'profileImage') {
//       checkProfileImageType(file, cb); // Stricter validation for profileImage
//     } else if (file.fieldname === 'businessPermit') {
//       checkFileType(file, cb); // Use existing checkFileType for businessPermit
//     } else {
//       cb(new Error('Error: Unexpected field name.'));
//     }
//   },
// }).fields([
//   { name: 'businessPermit', maxCount: 1 },
//   { name: 'profileImage', maxCount: 1 },
// ]);

// module.exports = {
//   upload,
//   uploadMultiple,
//   uploadProfileImage,
//   uploadBusinessPermit,
//   uploadProductImages,
//   uploadSignupFiles,
// };

// config/multer.js
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ---------- Helpers ----------
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
    cb(new Error('Error: Profile image must be jpeg/jpg/png/gif.'));
  }
}

// ---------- Disk storage helper (for routes that expect disk behavior) ----------
function createDiskStorage(destinationFolder, filenamePrefix) {
  return multer.diskStorage({
    destination: `/var/data/uploads/${destinationFolder}`,
    filename: (req, file, cb) => {
      const uniqueName = `${filenamePrefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

// ---------- Memory-storage Multer configs (for processing via Sharp) ----------

// Small single image (optimized via Sharp later)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('image');

// Multiple files (venues etc)
const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).fields([
  { name: 'venueImages', maxCount: 5 },
  { name: 'videoTours', maxCount: 4 }, // videos → will be saved raw
  { name: 'floorPlans', maxCount: 4 },
]);

// Profile image (memory — will be processed)
const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => checkProfileImageType(file, cb),
}).single('profileImage');

// Business Permit (pdf or image) (memory — processed if image)
const uploadBusinessPermit = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).single('businessPermit');

// Product images (max 5) (memory — processed)
const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per image
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).fields([{ name: 'images', maxCount: 5 }]);

// ---------- RESTORED: uploadSignupFiles (disk storage) ----------
// Kept diskStorage to preserve existing signup route behavior (req.files[].filename, destination, path).
// If you later want Sharp processing during signup, chain a processing middleware after this.
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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit to be permissive
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

// ---------- Sharp Processors ----------
async function processImages(files, folder, prefix) {
  if (!files || files.length === 0) return [];

  const uploadDir = `/var/data/uploads/${folder}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const results = [];
  await Promise.all(
    files.map(async (file, index) => {
      // ensure unique filename (avoid collisions)
      const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index}.jpeg`;
      const filepath = path.join(uploadDir, filename);

      // Resize + compress for images
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        await sharp(file.buffer)
          .resize({ width: 1200, height: 1200, fit: 'inside' })
          .jpeg({ quality: 80 })
          .toFile(filepath);
      } else {
        // Save raw for non-images (pdf/video)
        fs.writeFileSync(filepath, file.buffer);
      }

      results.push(`/uploads/${folder}/${filename}`);
    })
  );

  return results;
}

// Middleware for product images
const processProductImages = async (req, res, next) => {
  if (!req.files || !req.files.images) return next();
  try {
    // processImages expects array of file objects (from memoryStorage)
    req.body.images = await processImages(req.files.images, 'products', 'product');
    // also update req.files to include "filename" style entries to keep compatibility if routes check them
    req.files.images = req.files.images.map((f, i) => ({ ...f, filename: path.basename(req.body.images[i]) }));
    next();
  } catch (err) {
    console.error('Error processing product images:', err);
    next(err);
  }
};

// Middleware for profile images
const processProfileImage = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const results = await processImages([req.file], 'profile-images', 'profile');
    // keep compatibility: set req.file.filename and req.file.path
    req.body.profileImage = results[0];
    req.file.filename = path.basename(results[0]);
    req.file.path = path.join('/var/data/uploads/profile-images', req.file.filename);
    next();
  } catch (err) {
    console.error('Error processing profile image:', err);
    next(err);
  }
};

// Middleware for business permit
const processBusinessPermit = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const results = await processImages([req.file], 'business-permits', 'permit');
    req.body.businessPermit = results[0];
    req.file.filename = path.basename(results[0]);
    req.file.path = path.join('/var/data/uploads/business-permits', req.file.filename);
    next();
  } catch (err) {
    console.error('Error processing business permit:', err);
    next(err);
  }
};

// ---------- Sharp processor for signup files ----------
const processSignupFiles = async (req, res, next) => {
  if (!req.files) return next();

  try {
    // Process profileImage
    if (req.files.profileImage && req.files.profileImage.length > 0) {
      const profileFile = req.files.profileImage[0];
      const uploadDir = `/var/data/uploads/profile-images`;

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpeg`;
      const filepath = path.join(uploadDir, filename);

      // compress + resize
      await sharp(profileFile.path)
        .resize({ width: 800, height: 800, fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(filepath);

      // replace old file with optimized one
      fs.unlinkSync(profileFile.path);
      profileFile.filename = filename;
      profileFile.path = filepath;
      req.body.profileImage = `/uploads/profile-images/${filename}`;
    }

    // Process businessPermit
    if (req.files.businessPermit && req.files.businessPermit.length > 0) {
      const permitFile = req.files.businessPermit[0];
      const uploadDir = `/var/data/uploads/business-permits`;

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      if (permitFile.mimetype.startsWith('image/')) {
        const filename = `permit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpeg`;
        const filepath = path.join(uploadDir, filename);

        await sharp(permitFile.path)
          .resize({ width: 1200, height: 1200, fit: 'inside' })
          .jpeg({ quality: 80 })
          .toFile(filepath);

        fs.unlinkSync(permitFile.path);
        permitFile.filename = filename;
        permitFile.path = filepath;
        req.body.businessPermit = `/uploads/business-permits/${filename}`;
      } else {
        // if pdf, just keep as-is
        req.body.businessPermit = `/uploads/business-permits/${permitFile.filename}`;
      }
    }

    next();
  } catch (err) {
    console.error('Error processing signup files:', err);
    next(err);
  }
};

// ---------- Export ----------
module.exports = {
  upload,
  uploadMultiple,
  uploadProfileImage,
  uploadBusinessPermit,
  uploadProductImages,
  uploadSignupFiles,        // <-- restored for compatibility
  processProductImages,
  processProfileImage,
  processBusinessPermit,
  processSignupFiles,
};
