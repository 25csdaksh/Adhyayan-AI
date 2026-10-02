const cloudinary = require('cloudinary').v2;
const config = require('./env');

// Initialize Cloudinary SDK
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

const isLiveCloudinaryConfigured = () => {
  return (
    Boolean(config.cloudinary.cloudName) &&
    Boolean(config.cloudinary.apiKey) &&
    Boolean(config.cloudinary.apiSecret) &&
    config.cloudinary.cloudName !== 'your_cloud_name' &&
    config.cloudinary.cloudName !== 'studylm_demo'
  );
};

/**
 * Upload buffer stream to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {Object} options - folder, filename, resource_type
 * @returns {Promise<{ secure_url: string, public_id: string, bytes: number, format: string }>}
 */
const uploadStream = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isLiveCloudinaryConfigured()) {
      // Offline/Local Development simulation fallback
      const simulatedPublicId = `${options.folder || 'studylm/sources'}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return resolve({
        secure_url: `https://res.cloudinary.com/studylm-simulated/raw/upload/${simulatedPublicId}`,
        public_id: simulatedPublicId,
        bytes: fileBuffer?.length || 0,
        format: options.format || 'raw',
      });
    }

    const uploadOptions = {
      folder: options.folder || 'studylm/sources',
      resource_type: options.resourceType || 'raw', // 'raw' preserves PDF and DOCX files without alteration
      use_filename: true,
      unique_filename: true,
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

/**
 * Delete asset from Cloudinary
 * @param {string} publicId
 * @param {string} resourceType - 'raw' | 'image' | 'auto'
 */
const deleteAsset = async (publicId, resourceType = 'raw') => {
  if (!publicId) return;
  if (!isLiveCloudinaryConfigured()) {
    return { result: 'ok' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.warn(`[Cloudinary Warning] Failed to delete asset ${publicId}:`, error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadStream,
  deleteAsset,
  isLiveCloudinaryConfigured,
};
