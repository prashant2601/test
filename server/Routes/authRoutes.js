const express = require('express');
const { login, getAllUsers, createSuperAdmin, createUser, validateResetToken, resetPassword, forgotPassword, refreshToken, editUser, checkAuth, deleteUser, GetAllConfigMenus,EditConfigMenus, GetDashboardMenu, logout } = require('../Controllers/authController');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');

router.get('/check-auth', auth(), checkAuth);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

router.post('/validateResetPasswordToken', validateResetToken);
router.post('/resetPassword', resetPassword);
router.post('/forgotPassword', forgotPassword);

router.get('/getAllAdminUsers', auth(["superAdmin"]), getAllUsers('admin'));
router.get('/getAllMerchantUsers', auth(["superAdmin", "admin", "staff", "support"]), getAllUsers('merchant'));
router.get('/getAllStaffUsers', auth(["superAdmin", "admin"]), getAllUsers('staff'));
router.get('/getAllSupportUsers', auth(["superAdmin", "admin", "staff"]), getAllUsers('support'));
router.get('/getAllDriverUsers', auth(["superAdmin", "admin", "staff", "support"]), getAllUsers('driver'));
router.get('/getAllAffiliateUsers', auth(["superAdmin", "admin", "staff", "support"]), getAllUsers('affiliate'));

router.post('/create-super-admin', createSuperAdmin);
router.post('/create-new-user', auth(["superAdmin", "admin"]), createUser);
router.put('/edit-user', auth(), editUser);
router.delete('/delete-user', auth(["superAdmin", "admin"]), deleteUser);

router.get('/getAllConfigMenus', auth(["superAdmin", "admin"]),  GetAllConfigMenus);
router.put('/editConfigMenus', auth(["superAdmin", "admin"]), EditConfigMenus);
router.get('/getDashboardMenu', auth(["superAdmin", "admin", 'merchant']), GetDashboardMenu);

module.exports = router;