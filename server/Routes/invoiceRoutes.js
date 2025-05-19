const multer = require('multer');
const express = require('express');
const { getInvoicesByMerchantId, generateInvoiceByMerchantIds, getAllInvoices, editInvoice, deleteInvoice, sendInvoicesToMerchant, viewInvoiceByMerchant, createInvoiceManually, editInvoiceManually, uploadInvoicePDFs, editOlderInvoice} = require('../Controllers/invoiceController');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/getInvoicesByMerchantId', auth(["superAdmin", "admin", "merchant"]), getInvoicesByMerchantId);
router.post('/generateInvoiceByMerchantIds', auth(["superAdmin", "admin"]), generateInvoiceByMerchantIds);
router.get('/getAllInvoices', auth(["superAdmin", "admin"]), getAllInvoices);
router.put('/edit-invoice', auth(["superAdmin", "admin"]), editInvoice);
router.delete('/delete-invoice', auth(["superAdmin", "admin"]), deleteInvoice);
router.put('/sendInvoicesToMerchant', auth(["superAdmin", "admin"]), sendInvoicesToMerchant);
router.get('/view-invoice', viewInvoiceByMerchant);
router.post('/create-invoice-manually', auth(["superAdmin", "admin"]), createInvoiceManually);
router.put ('/edit-invoice-manually', auth(["superAdmin", "admin"]), editInvoiceManually)
router.post('/upload-invoice-pdfs', auth(["superAdmin", "admin"]), upload.array('pdfs'), uploadInvoicePDFs);
router.put ('/edit-older-invoice', auth(["superAdmin", "admin"]), editOlderInvoice)

module.exports = router;