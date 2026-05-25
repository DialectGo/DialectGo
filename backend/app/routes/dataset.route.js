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

router.post('/user/stage', verifyToken, async (req, res, next) => {
    try {
        const { operationType, targetRowId, proposedData, rationale } = req.body;
        const { createPendingAction } = await import('../services/dataset.service.js');
        
        const stagedPr = await createPendingAction(req.user.id, {
            targetTable: 'profiles',
            operationType,
            targetRowId,
            proposedData,
            rationale
        });

        res.status(202).json({ 
            success: true, 
            message: "User account action staged successfully into the audit log layer. Co-admin review required." 
        });
    } catch (err) { next(err); }
});

export default router;