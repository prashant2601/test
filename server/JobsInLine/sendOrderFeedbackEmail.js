const sendEmail = require("../Utils/emailService");
const moment = require('moment-timezone');
const CustomerModal = require('../Models/customer');
const OrderModal = require('../Models/order');
const feedbackTemplate = require("../EmailTemplates/feedback");
const timeZone = 'Europe/London'; 

const EmailLog = require('../Models/emailLogs');
const { updateEmailLog } = require("../Utils/utils");
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;

function generateEncryptedLink(customerId, orderId, merchantId) {
    const payload = { customerId, orderId, merchantId};
    const token = jwt.sign(payload, secretKey, { expiresIn: '14d' }); 
    return `${process.env.API_DOMAIN}/api/email/feedbackPage?token=${encodeURIComponent(token)}&fromEmail=true`;
}

module.exports = (agenda) => {
  agenda.define('send order feedback', async (job) => {
    const { customerId, orderId, userRole } = job.attrs.data;
    let logEntry = null;
    try {

      // Create a log entry as early as possible, even if some data is missing.
      logEntry = await EmailLog.create({
        emailId: null,
        emailType: 'orderFeedback',
        receiverId: customerId,
        receiverName: '',
        orderId,
        status: 'processing',
        sendTo: 'customer',
        sendBy: userRole || 'superAdmin',
        updatedAt: moment.tz(timeZone).toDate()
      });

      if (!customerId || !orderId) {
        await updateEmailLog(logEntry._id, {  error : "Missing customerId or orderId" });
        throw new Error('Missing customerId or orderId');
      }
      const parsedCustomerId = parseInt(customerId, 10);
      const parsedOrderId = parseInt(orderId, 10);

      // Fetch customer and order details
      const customer = await CustomerModal.findOne({ customerId: parsedCustomerId });
      if (!customer) {
        await updateEmailLog(logEntry._id, {  error : `Customer not found for ID: ${customerId}`,status: "failed" });
        throw new Error(`Customer not found for ID: ${customerId}`);
      }
      const order = await OrderModal.findOne({ orderId: parsedOrderId });
      if (!order) {
        await updateEmailLog(logEntry._id, {  error : `Order not found for ID: ${orderId}`,status: "failed" });
        throw new Error(`Order not found for ID: ${orderId}`);
      }

      // Prepare email parameters
      const emailParams = {
        customerId,
        emailId: customer.personalDetails?.email,
        customerName: `${customer.personalDetails?.firstName || ''} ${customer.personalDetails?.lastName || ''}`.trim(),
        orderItems: order.orderItems,
        orderDate: moment.tz(order.orderDate, timeZone).format('Do MMMM YYYY'),
        orderId,
        merchantId: order?.merchantId || 0,
        branchName: order?.branchName,
        feedbackUrl: generateEncryptedLink(customerId, orderId, order?.merchantId || 0),
      };

      if (!emailParams.emailId) {
        await updateEmailLog(logEntry._id, {  error : `Missing email for customer ${customerId}`, status: "failed", receiverName: emailParams.customerName });
        throw new Error(`Missing email for customer ${customerId}`);
      }

      const emailContent = feedbackTemplate(emailParams);
      const response = await sendEmail(emailParams.emailId, `👍 or 👎 for ${emailParams.branchName}`, emailContent, 'Customer');

      // Update log entry on success
      await updateEmailLog(logEntry._id, {emailId: emailParams.emailId, status: response.status, error: response.error, receiverName: emailParams.customerName });

      if (response.status === 'sent'){
        await OrderModal.updateOne({ orderId: orderId}, { $set: { feedbackEmailSent: true } });
      }
      
      return;
    } catch (error) {
      console.error(`Error in send order feedback job for customer ${customerId}:`, error.message);
      await updateEmailLog(logEntry._id, {status: 'failed',
        error: error.message});
      throw error;
    }
  });
};
