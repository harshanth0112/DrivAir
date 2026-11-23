import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';
import Document from './documents.model.js';
import { AppError } from '../../middleware/errorHandler.js';

// Configure Cloudinary if credentials are provided
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

// Multer memory storage with strict MIME type & size filtering
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validates actual file signature (magic bytes) to prevent extension/MIME spoofing.
 * - PDF: %PDF- (0x25 0x50 0x44 0x46)
 * - JPEG: 0xFF 0xD8 0xFF
 * - PNG: 0x89 0x50 0x4E 0x47 (0x89 'PNG')
 * - WebP: 'RIFF'....'WEBP'
 */
export const validateFileSignature = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  // PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }
  // WebP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50  // WEBP
  ) {
    return 'image/webp';
  }
  return null;
};

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // 1. MIME type header allowlist
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new AppError(
          `Invalid file type: ${file.mimetype}. Only PDF, JPEG, PNG, and WebP files are allowed.`,
          400
        ),
        false
      );
    }
    // 2. Extension check
    const originalName = file.originalname.toLowerCase();
    const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => originalName.endsWith(ext));
    if (!hasAllowedExt) {
      return cb(
        new AppError(
          `Invalid file extension. Only .pdf, .jpg, .jpeg, .png, and .webp extensions are permitted.`,
          400
        ),
        false
      );
    }
    cb(null, true);
  },
}).single('file');

/**
 * Direct file upload handler:
 * Uploads file buffer directly to Cloudinary (or creates data URI fallback),
 * and creates a verified Document record in MongoDB.
 */
export const uploadDirectFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded. Please select a file from your device.', 400));
    }

    // Magic-byte signature verification: do not trust client-supplied MIME type
    const detectedMime = validateFileSignature(req.file.buffer);
    if (!detectedMime) {
      return next(
        new AppError(
          'File signature validation failed. The file content does not match allowed types (PDF, JPEG, PNG, WebP).',
          400
        )
      );
    }

    const { ownerType, documentType, documentNumber, vehicleId } = req.body;

    if (!ownerType || !documentType) {
      return next(new AppError('ownerType and documentType are required.', 400));
    }

    let secureUrl = '';
    let storageKey = `doc_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
    let storageProvider = 'local';

    // Try Cloudinary upload if configured
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'drivair_documents',
              resource_type: 'auto',
              public_id: `doc_${Date.now()}`,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        secureUrl = uploadResult.secure_url;
        storageKey = uploadResult.public_id;
        storageProvider = 'cloudinary';
      } catch (cloudErr) {
        console.warn('[Cloudinary Warning] Upload failed, falling back to data URL:', cloudErr.message);
      }
    }

    // Fallback if Cloudinary is offline or keys invalid: store Data URI for local preview
    if (!secureUrl) {
      const base64 = req.file.buffer.toString('base64');
      secureUrl = `data:${req.file.mimetype};base64,${base64}`;
      storageProvider = 'local';
    }

    // Save Document in MongoDB
    const document = await Document.create({
      ownerId: req.user._id,
      ownerType,
      vehicleId: vehicleId || undefined,
      documentType,
      documentNumber: documentNumber || '',
      storageProvider,
      storageKey,
      secureUrl,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      verificationStatus: 'pending',
    });

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully and queued for verification!',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocumentRecord = async (req, res, next) => {
  try {
    const document = await Document.create({
      ownerId: req.user._id,
      ...req.body,
      verificationStatus: 'pending',
    });
    res.status(201).json({ status: 'success', data: { document } });
  } catch (error) {
    next(error);
  }
};

export const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: documents.length, data: { documents } });
  } catch (error) {
    next(error);
  }
};

export const getDocumentAccess = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    const isOwner = document.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('Unauthorized to access this document', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        secureUrl: document.secureUrl,
        documentType: document.documentType,
        verificationStatus: document.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
export const getAdminVerificationQueue = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const documents = await Document.find({ verificationStatus: status })
      .populate('ownerId', 'fullName email role')
      .populate('vehicleId', 'vehicleNumber vehicleType')
      .sort({ createdAt: 1 });

    res.status(200).json({ status: 'success', results: documents.length, data: { documents } });
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      },
      { new: true }
    );

    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: `Document ${status} successfully`,
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};
