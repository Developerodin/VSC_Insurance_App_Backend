import express from 'express';
import { upload, uploadFile, deleteFile } from '../../controllers/common.controller.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

// File upload routes
router.post('/upload', auth(), upload.single('file'), uploadFile);
router.delete('/files/:key', auth(), deleteFile);

export default router; 