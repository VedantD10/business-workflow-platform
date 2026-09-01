const path = require('path');
require('dotenv').config();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const defaultDbPath = isServerless ? path.join('/tmp', 'workflow.db') : path.join(__dirname, '../../data/workflow.db');
const defaultUploadDir = isServerless ? path.join('/tmp', 'uploads') : path.join(__dirname, '../../uploads');

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'vesa_enterprise_workflow_secure_jwt_secret_key_2026_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DB_PATH: process.env.DB_PATH || defaultDbPath,
  UPLOAD_DIR: process.env.UPLOAD_DIR || defaultUploadDir,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
};
