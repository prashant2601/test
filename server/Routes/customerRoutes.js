const express = require('express');
const {getAllCustomerDetails, addCustomer, editCustomer, deleteCustomer, getCustomerById, uploadAndParseCustomer, getCustomerOrderHistory, searchSwishrCourierCustomer } = require('../Controllers/customerController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const auth = require('../Middlewares/authMiddleware');

router.get('/getAllCustomerDetails', auth(["superAdmin", "admin"]), getAllCustomerDetails(false));
router.post('/add-customer', auth(["superAdmin", "admin"]), addCustomer(false));
router.put('/edit-customer', auth(["superAdmin", "admin"]), editCustomer);
router.delete('/delete-customer', auth(["superAdmin", "admin"]), deleteCustomer);
router.post('/uploadAndParseCustomer', upload.array('files', 10), uploadAndParseCustomer(false)); 
router.get('/getCustomerOrderHistory', auth(["superAdmin", "admin", "merchant", "staff", "support"]), getCustomerOrderHistory )

//for swishrCourier customer
router.get('/searchSwishrCourierCustomer', auth(["superAdmin", "admin"]), searchSwishrCourierCustomer)
router.get('/getAllSwishrCourierCustomerDetails', auth(["superAdmin", "admin"]), getAllCustomerDetails(true));
router.post('/add-swishr-courier-customer', auth(["superAdmin", "admin"]), addCustomer(true));
router.post('/uploadAndParseSwishrCourierCustomer', upload.array('files', 10), uploadAndParseCustomer(true));

module.exports = router;