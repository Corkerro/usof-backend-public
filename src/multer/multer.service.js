import multer from 'multer';
import { multerConfig } from './multer.config.js';

export const avatarUpload = multer(multerConfig);
