const express = require('express');
const { sendFeedbackMail, receiveFeedback, getEmailLogs, renderFeedbackPage, decryptToken} = require('../Controllers/emailController');
const router = express.Router();
const auth = require('../Middlewares/authMiddleware');

router.get('/getEmailLogs', auth(["superAdmin", "admin"]), getEmailLogs);
router.post('/sendFeedbackMail', auth(["superAdmin", "admin"]), sendFeedbackMail);
router.get('/feedbackPage', renderFeedbackPage)
router.post('/receiveFeedback', receiveFeedback);
router.post('/decryptToken', decryptToken)


module.exports = router;