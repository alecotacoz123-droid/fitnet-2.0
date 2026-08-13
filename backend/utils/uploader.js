const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for videos and images
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Sube imágenes o videos.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max limit
  }
});

module.exports = upload;
