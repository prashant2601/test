const moment = require('moment-timezone');
const cron = require('node-cron');
const OrderModal = require('../../Models/order');
const CustomerModal = require('../../Models/customer');

const timeZone = 'Europe/London';

const agenda = require('../../agenda');

const sendFeedbackEmails = async () => {
    try {
       // const twentyFourHoursAgo = moment().tz(timeZone).subtract(24, 'hours').toDate();

        // const orders = await OrderModal.find({
        //     uploadedAt: { $lte: twentyFourHoursAgo },
        //     feedbackEmailSent: false, // Ensure we only send once
        // });

        // if (orders.length === 0) {
        //     console.log('No customers need feedback emails.');
        //     return;
        // }

        // const customerIds = orders.map(order => order.customerId);
        // const existingCustomers = await CustomerModal.find({ customerId: { $in: customerIds } }, {customerId: 1 });

        // const existingCustomerIds = new Set(existingCustomers.map(customer => customer.customerId.toString()));

        // const validOrders = orders.filter(order => existingCustomerIds.has(order.customerId.toString()));

        // if (validOrders.length === 0) {
        //     console.log('No valid customers found for feedback emails.');
        //     return;
        // }

        // const orderMail = validOrders.map(order => ({
        //     customerId: order.customerId,
        //     orderId: order.orderId,
        //     userRole: "automatic"
        // }));

        // orderMail.forEach((update) => {
        //     agenda.now('send order feedback', update);
        // });

    } catch (err) {
       // console.error('Error sending feedback emails:', err);
    }
};

// Schedule the cron job to run every night at midnight
// cron.schedule('0 0 * * *', sendFeedbackEmails);

module.exports = sendFeedbackEmails;
