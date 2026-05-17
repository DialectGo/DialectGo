import { Router } from 'express';
import * as DatasetController from '../controllers/dataset.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/dictionary', verifyToken, DatasetController.getDictionaryDataset);
router.post('/dictionary/stage', verifyToken, DatasetController.stageDatasetAction);
router.get('/dictionary/verifications', verifyToken, DatasetController.getPendingVerifications);
router.put('/dictionary/verify/:logId', verifyToken, DatasetController.verifyDatasetAction);
router.get('/dictionary/export', verifyToken, DatasetController.exportDataset);

export default router;