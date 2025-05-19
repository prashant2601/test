const moment = require('moment-timezone');
const cron = require('node-cron');
const InvoiceModal = require('../../Models/invoice');

const timeZone = 'Europe/London';

const disableEditForOldInvoices = async () => {
    try {
        const fourteenDaysAgo = moment.tz(timeZone).subtract(14, 'days').startOf('day').toDate();

        const invoicesToUpdate = await InvoiceModal.find(
            {
                isSentToMerchant: true,
                isEditable: true,
                sentToMerchantAt: { $lte: fourteenDaysAgo },
            },
            { invoiceId: 1 }
        );

        if (invoicesToUpdate.length === 0) {
            console.log('No invoice(s) need to be updated.');
            return;
        }

        const invoiceIds = invoicesToUpdate.map(invoice => invoice.invoiceId);

        await InvoiceModal.updateMany(
            { invoiceId: { $in: invoiceIds } },
            { $set: { isEditable: false } }
        );

        console.log(`Invoices ${invoiceIds.join(', ')} are now non-editable.`);
    } catch (error) {
        console.error('Error updating invoices:', error);
    }
};

// Schedule cron job
cron.schedule('0 0 * * *', disableEditForOldInvoices); // Runs daily at midnight

module.exports = disableEditForOldInvoices;
