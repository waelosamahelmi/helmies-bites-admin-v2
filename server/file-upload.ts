import multer from 'multer';
import path from 'path';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from './cloudinary';
import { uploadImageToHostinger, deleteImageFromHostinger } from './hostinger-upload';

// Image upload strategy: 'hostinger' or 'cloudinary'
const UPLOAD_STRATEGY = process.env.IMAGE_UPLOAD_STRATEGY || 'hostinger';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

// Function to upload image (supports both Hostinger and Cloudinary)
export async function uploadImageToSupabase(
  file: Express.Multer.File, 
  restaurantName: string = 'default-restaurant',
  folder: string = 'menu'
): Promise<string> {
  try {
    // Choose upload strategy
    if (UPLOAD_STRATEGY === 'hostinger') {
      console.log('📸 Uploading image to Hostinger FTP...');
      const imageUrl = await uploadImageToHostinger(file, folder);
      console.log('✅ Image uploaded successfully to Hostinger:', imageUrl);
      return imageUrl;
    } else {
      console.log('📸 Uploading image to Cloudinary...');
      const imageUrl = await uploadImageToCloudinary(file, restaurantName, folder);
      console.log('✅ Image uploaded successfully to Cloudinary:', imageUrl);
      return imageUrl;
    }
    
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Function to delete image (supports both Hostinger and Cloudinary)
export async function deleteImageFromSupabase(imageUrl: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting image...');
    
    // Detect storage provider from URL
    const isHostinger = imageUrl.includes('ravintolababylon.fi') || imageUrl.includes('images.ravintolababylon.fi');
    
    let success: boolean;
    if (isHostinger) {
      success = await deleteImageFromHostinger(imageUrl);
    } else {
      success = await deleteImageFromCloudinary(imageUrl);
    }
    
    if (success) {
      console.log('✅ Image deleted successfully');
    } else {
      console.warn('⚠️ Image deletion failed or was skipped');
    }
    
    return success;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Function to ensure storage is ready
export async function ensureStorageBucket(): Promise<void> {
  if (UPLOAD_STRATEGY === 'hostinger') {
    console.log('📦 Using Hostinger FTP for image storage');
  } else {
    console.log('📦 Using Cloudinary for image storage');
  }
}

export { upload };
