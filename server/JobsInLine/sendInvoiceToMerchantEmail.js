const sendEmail = require("../Utils/emailService");
const moment = require('moment-timezone');
const InvoiceModal = require('../Models/invoice');
const MerchantModal = require('../Models/merchant');
const timeZone = 'Europe/London';

const EmailLog = require('../Models/emailLogs');
const { updateEmailLog } = require("../Utils/utils");
const sendInvoiceTemplate = require("../EmailTemplates/sendInvoice");

module.exports = (agenda) => {
    agenda.define('send invoice to merchant', async (job) => {
        const { invoiceId, userRole } = job.attrs.data;
        let logEntry = null;
        try {
            const invoice = await InvoiceModal.findOne({ invoiceId });
            const merchant = await MerchantModal.findOne({ merchantId: invoice?.merchantId})
            let receiverEmail = null;
            let receiverId = invoice.merchantId;
            
            if(invoice.isManualCreate){
                receiverEmail = invoice.invoiceParameters.customerAddress.email;    
            } else {
                receiverEmail= merchant.merchantEmail;
            }

            logEntry = await EmailLog.create({
                emailId: receiverEmail,
                emailType: 'invoice',
                receiverId: receiverId,
                receiverName: '',
                orderId: invoiceId,
                status: 'processing',
                sendTo: invoice.isManualCreate ? 'customer' : 'merchant',
                sendBy: userRole || 'superAdmin',
                updatedAt: moment.tz(timeZone).toDate()
            });

            if (!invoiceId) {
                await updateEmailLog(logEntry._id, { error: "Missing invoiceId", status: "failed" });
                throw new Error('Missing invoiceId');
            }

            if (!invoice.isManualCreate && !merchant) {
                await updateEmailLog(logEntry._id, { error: `Merchant not found for invoice: ${invoiceId}`, status: "failed" });
                throw new Error(`Merchant not found for invoice: ${invoiceId}`);
            }

            // Prepare email parameters
            const emailParams = {
                merchantId: receiverId,
                emailId: receiverEmail,
                merchantName: `${invoice?.merchantName}`.trim(),
                invoiceDate: moment.tz(invoice.invoiceParameters.invoiceDate, timeZone).format('Do MMMM YYYY'),
                invoiceId,
                downloadUrl: `${process.env.API_DOMAIN}/api/invoice/view-invoice?invoiceId=${invoiceId}&fromEmail=true`,
                fromDate: moment.tz(invoice.fromDate, timeZone).format('Do MMMM YYYY'),
                toDate: moment.tz(invoice.toDate, timeZone).format('Do MMMM YYYY'),
                invoiceParameters: invoice.invoiceParameters
            };

            if (!emailParams.emailId) {
                await updateEmailLog(logEntry._id, { error: `Missing email for receiver: ${invoice?.merchantName}(${receiverId})`, status: "failed", receiverName: invoice?.merchantName });
                throw new Error(`Missing email for receiver: ${receiverId}`);
            }

            const emailContent = sendInvoiceTemplate(emailParams);
            const response = await sendEmail(emailParams.emailId, `Invoice for ${emailParams.fromDate} to ${emailParams.toDate}`, emailContent, invoice.isManualCreate ? 'Customer' : 'Merchant');

            // Update log entry on success
            await updateEmailLog(logEntry._id, { emailId: emailParams.emailId, status: response.status, error: response.error, receiverName: emailParams.merchantName });
            return;
        } catch (error) {
            console.error(`Error in send order feedback job for receiver ${receiverId}:`, error.message);
            await updateEmailLog(logEntry._id, {
                status: 'failed',
                error: error.message,
                receiverName: emailParams?.merchantName 
            });
            throw error;
        }
    });
};
