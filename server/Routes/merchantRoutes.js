const express = require('express');
const {getAllMerchantDetails, addMerchant, editMerchant, deleteMerchant, getMerchantDetailsById, searchMerchant, getMerchantItemDetails, addMerchantItemDetails, editMerchantItemDetails, deleteMerchantItem,getMerchantOrderHistory } = require('../Controllers/merchantController');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');


router.get('/getAllMerchantDetails', auth(["superAdmin", "admin"]),  getAllMerchantDetails);
router.post('/add-merchant', auth(["superAdmin", "admin"]), addMerchant);
router.put('/edit-merchant', auth(["superAdmin", "admin"]), editMerchant);
router.delete('/delete-merchant', auth(["superAdmin", "admin"]), deleteMerchant);
router.get('/getMerchantDetailsById/:id', auth(["superAdmin", "admin", "merchant"]), getMerchantDetailsById);
router.get('/searchMerchant', auth(["superAdmin", "admin"]), searchMerchant);
router.get('/getMerchantItemDetails', auth(["superAdmin", "admin"]),  getMerchantItemDetails);
router.post('/add-merchant-item', auth(["superAdmin", "admin"]), addMerchantItemDetails);
router.post('/edit-merchant-item', auth(["superAdmin", "admin"]), editMerchantItemDetails );
router.delete('/delete-merchant-item', auth(["superAdmin", "admin"]), deleteMerchantItem);
router.get('/getMerchantOrderHistory', auth(["superAdmin", "admin", "merchant"]), getMerchantOrderHistory )


module.exports = router;