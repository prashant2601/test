const sendEmail = require("../Utils/emailService");
const moment = require('moment-timezone');
const MerchantModal = require('../Models/merchant');
const timeZone = 'Europe/London';
const sendResetPasswordTemplate = require("../EmailTemplates/sendResetPassword");
const EmailLog = require('../Models/emailLogs');
const { updateEmailLog } = require("../Utils/utils");


module.exports = (agenda) => {
    agenda.define('reset password', async (job) => {
        const { emailId, resetLink, fullName, msg, userRole, userId, role, btnText } = job.attrs.data;
        let logEntry = null;
        let receiverId = userId;
        let receiverName = fullName;
        try {

            logEntry = await EmailLog.create({
                emailId,
                emailType: 'resetPassword',
                receiverId,
                receiverName,
                status: 'processing',
                sendTo: role,
                sendBy: userRole || 'superAdmin',
                updatedAt: moment.tz(timeZone).toDate()
            });

            const emailContent = sendResetPasswordTemplate({ fullName, resetLink, msg, btnText });
            const response = await sendEmail(emailId, msg, emailContent, fullName);

            // Update log entry on success
            await updateEmailLog(logEntry._id, { status: response.status, error: response.error });
            return;

        } catch (error) {
            console.error(`Error in sending Reset link to ${emailId}:`, error.message);
            await updateEmailLog(logEntry._id, {status: 'failed',
                error: error.message});
            throw error;
        }
    });
};
