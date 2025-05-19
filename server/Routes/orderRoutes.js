const multer = require('multer');
const express = require('express');
const { UploadAndParseDocument, GetAllOrders, UpdateOrder, DeleteOrder, AddOrders, GetAllRefundOrders, RecalculateOrderCommission} = require('../Controllers/orderController');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/uploadAndParseDocument', upload.array('files', 10), auth(["superAdmin", "admin"]), UploadAndParseDocument);
router.get('/getAllOrders', auth(["superAdmin", "admin"]), GetAllOrders)
router.put('/updateOrder', auth(["superAdmin", "admin"]), UpdateOrder)
router.delete('/deleteOrder', auth(["superAdmin", "admin"]), DeleteOrder)
router.post('/addOrders', auth(["superAdmin", "admin"]), AddOrders)
router.get('/getAllRefundOrders', auth(["superAdmin", "admin"]), GetAllRefundOrders)
router.post('/recalculateOrderCommission', auth(["superAdmin", "admin"]), RecalculateOrderCommission)

module.exports = router;