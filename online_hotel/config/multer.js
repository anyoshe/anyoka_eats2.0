// const multer = require('multer');
// const path = require('path');

// // Set storage engine
// const storage = multer.diskStorage({
//   destination: './uploads/images', // Directory to save images
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// // Initialize upload variable
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }, // 1MB file size limit
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   }
// }).single('image');

// // Setup for multiple file uploads (for conference spaces)
// const conferenceStorage = multer.diskStorage({
//   destination: './uploads/conferences', // Directory to save conference files
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const uploadMultiple = multer({
//   storage: conferenceStorage,
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   }
// }).fields([
//   { name: 'venueImages', maxCount: 5 }, 
//   { name: 'videoTours', maxCount: 4 }, 
//   { name: 'floorPlans', maxCount: 4 }
// ]);


// // Separate storage engine for profile image uploads
// const profileStorage = multer.diskStorage({
//   destination: './uploads/profile-images', // Directory to save profile images
//   filename: (req, file, cb) => {
//     cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
//   }
// });

// // Initialize upload variable for profile images
// const uploadProfileImage = multer({
//   storage: profileStorage,
//   limits: { fileSize: 1000000 }, // 1MB file size limit
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb); // Reusing the checkFileType function
//   }
// }).single('profileImage'); // Ensure the field name matches what you're sending from the frontend

// function checkFileType(file, cb) {
//   // Allowed file extensions for images
//   const imageFiletypes = /jpeg|jpg|png|gif/;
//   // Allowed file extensions for videos
//   const videoFiletypes = /mp4|webm|ogg/;
  
//   // Check if the file is an image
//   const isImage = imageFiletypes.test(path.extname(file.originalname).toLowerCase());
//   // Check if the file is a video
//   const isVideo = videoFiletypes.test(path.extname(file.originalname).toLowerCase());

//   // Check MIME type for images
//   const imageMimetype = imageFiletypes.test(file.mimetype);
//   // Check MIME type for videos
//   const videoMimetype = videoFiletypes.test(file.mimetype);

//   // Allow image or video files based on their MIME type or extension
//   if ((isImage && imageMimetype) || (isVideo && videoMimetype)) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Error: Images and Videos Only!'));
//   }
// }


// module.exports = { upload, uploadMultiple,  uploadProfileImage };

const multer = require('multer');
const path = require('path');

// Set storage engine for images
const storage = multer.diskStorage({
  destination: '/var/data/uploads/images', // <-- Persistent disk location
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable for images
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB file size limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image');

// Set storage engine for conference files
const conferenceStorage = multer.diskStorage({
  destination: '/var/data/uploads/conferences', // <-- Persistent disk location for conferences
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload for multiple conference files
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
  destination: '/var/data/uploads/profile-images', // <-- Persistent disk location for profile images
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable for profile images
const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 1000000 }, // 1MB file size limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('profileImage');

// Function to check file types (reused)
function checkFileType(file, cb) {
  const imageFiletypes = /jpeg|jpg|png|gif/;
  const videoFiletypes = /mp4|webm|ogg/;
  
  const isImage = imageFiletypes.test(path.extname(file.originalname).toLowerCase());
  const isVideo = videoFiletypes.test(path.extname(file.originalname).toLowerCase());

  const imageMimetype = imageFiletypes.test(file.mimetype);
  const videoMimetype = videoFiletypes.test(file.mimetype);

  if ((isImage && imageMimetype) || (isVideo && videoMimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images and Videos Only!'));
  }
}

module.exports = { upload, uploadMultiple, uploadProfileImage };
