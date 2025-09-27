import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads', 'posts');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const tempStorage = multer.memoryStorage();

const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const uploadTemp = multer({ 
    storage: tempStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadPost = multer({ 
    storage: postStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const saveUploadedFiles = async (files, content) => {
    if (!files || files.length === 0) return content;

    let processedContent = content;
    
    for (const file of files) {
        const tempIdentifier = file.originalname || `temp_${Date.now()}`;
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        const filepath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filepath, file.buffer);
        
        const imageUrl = `/uploads/posts/${filename}`;
        processedContent = processedContent.replace(`src="temp"`, `src="${imageUrl}"`);
        processedContent = processedContent.replace(`src="${tempIdentifier}"`, `src="${imageUrl}"`);
    }
    
    return processedContent;
};