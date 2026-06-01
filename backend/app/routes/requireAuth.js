const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboard.controller');

// requireAuth blocks anyone without a valid JWT
router.get('/security', requireAuth, dashboardController.getSecurityDashboard);

module.exports = router;