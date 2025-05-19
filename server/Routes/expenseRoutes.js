const express = require('express');
const {
    UploadExpenseData,
    GetExpenseData,
    EditExpenseData,
    DeleteExpenseData,
    AddExpenseCategory,
    GetExpenseCategory,
    EditExpenseCategory,
    DeleteExpenseCategory,
    AddExpenseType,
    GetExpenseType,
    EditExpenseType,
    DeleteExpenseType,
    AddExpenseStore,
    GetExpenseStore,
    EditExpenseStore,
    DeleteExpenseStore,
    GetExpenseSummary,
    GetStoreWiseExpenseSummary,
    GetExpenseTypeWiseExpenseSummary,
    GetCategoryWiseExpenseSummary,
    GetSpendByWiseExpenseSummary
} = require('../Controllers/expenseController');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Expense Data routes
router.post('/uploadExpenseData', auth(["superAdmin", "admin"]), upload.array('files'),  UploadExpenseData);
router.get('/getExpenseData', auth(["superAdmin", "admin"]), GetExpenseData);
router.put('/editExpenseData', auth(["superAdmin", "admin"]), upload.array('files'), EditExpenseData);
router.delete('/deleteExpenseData', auth(["superAdmin", "admin"]), DeleteExpenseData);

// Expense Category routes
router.post('/addExpenseCategory', auth(["superAdmin", "admin"]), AddExpenseCategory);
router.get('/getExpenseCategory', auth(["superAdmin", "admin"]), GetExpenseCategory);
router.put('/editExpenseCategory', auth(["superAdmin", "admin"]), EditExpenseCategory);
router.delete('/deleteExpenseCategory', auth(["superAdmin", "admin"]), DeleteExpenseCategory);

// Expense Type routes
router.post('/addExpenseType', auth(["superAdmin", "admin"]), AddExpenseType);
router.get('/getExpenseType', auth(["superAdmin", "admin"]), GetExpenseType);
router.put('/editExpenseType', auth(["superAdmin", "admin"]), EditExpenseType);
router.delete('/deleteExpenseType', auth(["superAdmin", "admin"]), DeleteExpenseType);

// Expense Store routes
router.post('/addExpenseStore', auth(["superAdmin", "admin"]), AddExpenseStore);
router.get('/getExpenseStore', auth(["superAdmin", "admin"]), GetExpenseStore);
router.put('/editExpenseStore', auth(["superAdmin", "admin"]), EditExpenseStore);
router.delete('/deleteExpenseStore', auth(["superAdmin", "admin"]), DeleteExpenseStore);

// Expense Report routes
router.get('/getExpenseSummary',  GetExpenseSummary);
router.get('/getStoreWiseExpenseSummary',  GetStoreWiseExpenseSummary);
router.get('/getExpenseTypeWiseExpenseSummary',  GetExpenseTypeWiseExpenseSummary);
router.get('/getCategoryWiseExpenseSummary',  GetCategoryWiseExpenseSummary);
router.get('/getSpendByWiseExpenseSummary',  GetSpendByWiseExpenseSummary);

module.exports = router;