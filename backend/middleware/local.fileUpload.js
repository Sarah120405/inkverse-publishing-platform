import multer from "multer";
import path from "path";

const store = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/localupload');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const ext = path.extname(file.originalname);
    if (allowedTypes.test(ext.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
}

const localFileUpload = multer({
    storage: store,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})

export default localFileUpload;
