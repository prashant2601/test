const sendEmail = require("../Utils/emailService");
const moment = require('moment-timezone');
const InvoiceModal = require('../Models/invoice');
const MerchantModal = require('../Models/merchant');
const timeZone = 'Europe/London';


module.exports = (agenda) => {
    agenda.define('view invoice history update', async (job) => {
        const { invoiceId } = job.attrs.data;

        try {
            const invoice = await InvoiceModal.findOne({ invoiceId });

            // Update the viewHistory array, keeping only the latest 5 timestamps
            let updatedViewHistory = [moment.tz(timeZone).toDate(), ...invoice.viewHistory];
            updatedViewHistory = updatedViewHistory.slice(0, 5); // Keep only the last 5 entries

            // Save the updated invoice
            invoice.viewHistory = updatedViewHistory;
            await invoice.save();
            return;
        } catch (error) {
            console.error(`Error in updating view history for invoice ${invoiceId}:`, error.message);
            throw error;
        }
    });
};
