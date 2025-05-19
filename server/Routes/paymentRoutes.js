const express = require('express');
const { GetAllBankAccounts, EditBankAccounts, DeleteBankAccounts, AddBankAccounts} = require('../Controllers/paymentController');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');

router.get('/getAllBankAccounts', auth(["superAdmin", "admin"]), GetAllBankAccounts)
router.put('/edit-bank-accounts', auth(["superAdmin", "admin"]), EditBankAccounts)
router.delete('/delete-bank-accounts', auth(["superAdmin", "admin"]), DeleteBankAccounts)
router.post('/add-bank-accounts', auth(["superAdmin", "admin"]), AddBankAccounts)

module.exports = router;