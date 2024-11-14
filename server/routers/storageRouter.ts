import { Router } from 'express';
import multer from 'multer';
import { createBlob, deleteBlob } from '../storage/client';
import { type UploadResponse, type DeleteResponse } from '@packages/types';
import { authenticator } from '../utils/auth';

const router = Router();
let upload = multer();
router.use(authenticator);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const blob = new Blob([req.file.buffer]);
    const upload = await createBlob({
      blob: blob,
      blobName: req.file.originalname,
      blobMimeType: req.file.mimetype,
    });

    if (upload.status === 'error') {
      res.status(500).json({
        success: false,
        message: upload.message,
      } satisfies UploadResponse);
    } else {
      res.status(201).json({ success: true, url: upload.url } satisfies UploadResponse);
    }
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' } satisfies UploadResponse);
  }
});

router.post('/delete', async (req, res) => {
  try {
    const filename = req.body.name;

    if (filename == null) {
      res
        .status(400)
        .json({ success: false, message: 'Missing name property' } satisfies DeleteResponse);
    }

    const del = await deleteBlob(filename);

    if (del == null) {
      res
        .status(500)
        .json({ success: false, message: `Failed to delete ${filename}` } satisfies DeleteResponse);
    }

    if (del.errorCode != null) {
      res.status(500).json({
        success: false,
        message: `Failed to delete ${filename}`,
        response: del,
      } satisfies DeleteResponse);
    }

    res.status(200).json({ success: true } satisfies DeleteResponse);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' } satisfies DeleteResponse);
  }
});

export default router;
