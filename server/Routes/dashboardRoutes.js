const express = require('express');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');
const { GetOrderHistorySummary, GetTopOrderSummary, GetComparativeOrderAnalysis, GetOrderComissionReport, GetOrderGraphData } = require('../Controllers/dashboardController');


router.get('/getOrderHistorySummary', auth(['superAdmin', 'admin']), GetOrderHistorySummary);
router.get('/topOrderSummary', auth(['superAdmin', 'admin']), GetTopOrderSummary);
router.get('/getComparativeOrderAnalysis', auth(['superAdmin', 'admin']), GetComparativeOrderAnalysis);
router.get('/getOrderComissionReport', auth(['superAdmin', 'admin']), GetOrderComissionReport);
router.get('/getOrderGraphData', auth(['superAdmin', 'admin']), GetOrderGraphData);


router.get('/getMerchantOrderHistorySummary', auth(['superAdmin', 'admin', 'staff', 'support', 'merchant']), GetOrderHistorySummary);
router.get('/getMerchantTopOrderSummary', auth(['superAdmin', 'admin', 'staff', 'support', 'merchant']), GetTopOrderSummary);
router.get('/getMerchantComparativeOrderAnalysis', auth(['superAdmin', 'admin', 'staff', 'support', 'merchant']), GetComparativeOrderAnalysis);
router.get('/getMerchantOrderComissionReport', auth(['superAdmin', 'admin']), GetOrderComissionReport);
router.get('/getMerchantOrderGraphData', auth(['superAdmin', 'admin', 'staff', 'support', 'merchant']), GetOrderGraphData);

module.exports = router;