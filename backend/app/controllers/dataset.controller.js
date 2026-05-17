import * as DatasetService from '../services/dataset.service.js';

// SELECT ALL (Allowed immediately for display)
export const getDictionaryDataset = async (req, res, next) => {
    try {
        const data = await DatasetService.fetchAllDictionaryEntries();
        res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
};

// STAGE CHANGE REQUEST (Insert/Update/Delete - Requires Authorization)
export const stageDatasetAction = async (req, res, next) => {
    try {
        const { targetTable, operationType, targetRowId, proposedData, rationale } = req.body;
        
        const stagedPr = await DatasetService.createPendingAction(
            req.user.id, 
            { targetTable, operationType, targetRowId, proposedData, rationale }
        );

        res.status(202).json({ 
            success: true, 
            message: "Action staged successfully. This change requires verification from a co-administrator.",
            data: stagedPr 
        });
    } catch (err) { next(err); }
};

// VERIFY REQUEST (Checker approval/rejection handler)
export const verifyDatasetAction = async (req, res, next) => {
    try {
        const { logId } = req.params;
        const { decision } = req.body; // 'approved' or 'rejected'
        
        const result = await DatasetService.processVerification(logId, req.user.id, decision);
        res.status(200).json({ success: true, message: `Staged action has been ${decision}.`, data: result });
    } catch (err) { next(err); }
};

// FETCH NOTIFICATIONS (Pending Actions Audit Trail)
export const getPendingVerifications = async (req, res, next) => {
    try {
        console.log("-----------------------------------------");
        console.log("Notification Request incoming from User ID:", req.user.id);
        console.log("-----------------------------------------");
        
        const alerts = await DatasetService.fetchPendingActions(req.user.id);
        res.status(200).json({ success: true, data: alerts });
    } catch (err) { next(err); }
};
// DATASET BULK EXPORT ENGINE
export const exportDataset = async (req, res, next) => {
    try {
        const { format } = req.query; // 'json' or 'csv'
        const baseData = await DatasetService.fetchAllDictionaryEntries();

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=dictionary_export.csv');
            
            const csvHeaders = 'id,language_id,word_term,part_of_speech,definition,example_usage\n';
            const csvRows = baseData.map(row => 
                `"${row.id}","${row.language_id}","${row.word_term || ''}","${row.part_of_speech || ''}","${(row.definition || '').replace(/"/g, '""')}","${(row.example_usage || '').replace(/"/g, '""')}"`
            ).join('\n');

            return res.status(200).send(csvHeaders + csvRows);
        }

        // Fallback Default to JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=dictionary_export.json');
        return res.status(200).json(baseData);
    } catch (err) { next(err); }
};