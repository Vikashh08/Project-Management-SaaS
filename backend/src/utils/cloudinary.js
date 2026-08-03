const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer storage to directly upload to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'taskflow_ai', // The folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'zip', 'doc', 'docx', 'mp4'],
    resource_type: 'auto', 
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
