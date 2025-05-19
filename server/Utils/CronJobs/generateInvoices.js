const moment = require('moment-timezone');
const cron = require('node-cron');
const OrderModal = require('../../Models/order');
const InvoiceModal = require('../../Models/invoice');
const RefundModal = require('../../Models/refunds');
const MerchantModal = require('../../Models/merchant');
const { calculateInvoiceParameters, generateInvoiceId, createPDF } = require('../invoiceUtils');

const timeZone = 'Europe/London';

const generateInvoices = async () => {
    try {

        // const today = moment.tz(timeZone);
        // const lastMonday = today.clone().isoWeekday(1).subtract(7, 'days').startOf('day');
        // const lastSunday = today.clone().isoWeekday(7).subtract(7, 'days').endOf('day');
        // const fromDate = lastMonday.toDate();
        // const toDate = lastSunday.toDate();
        const fromDate = moment.tz(timeZone).startOf('isoWeek').subtract(7, 'days').toDate();
        const toDate = moment.tz(timeZone).endOf('isoWeek').subtract(7, 'days').toDate();

        const orders = await OrderModal.aggregate([
            { $match: { orderDate: { $gte: fromDate, $lte: toDate }, status: { $nin: ['ABANDONED', 'CANCELLED', 'REJECTED'] } } },
            {
                $group: {
                    _id: '$merchantId',
                    orders: { $push: '$$ROOT' },
                },
            },
        ]);

        if (orders.length === 0) {
            console.log('No orders found for last week.');
            return;
        }

        for (const merchantOrders of orders) {
            const { _id: merchantId, orders } = merchantOrders;

            const existingInvoice = await InvoiceModal.findOne({
                merchantId: parseInt(merchantId, 10),
                fromDate,
                toDate,
                isManualCreate: false
            });

            if (existingInvoice) {
                console.log(`Invoice already exists for Merchant ID: ${merchantId}`);
                continue;
            }

            const merchant = await MerchantModal.findOne({ merchantId: parseInt(merchantId, 10) });

            const refunds = await RefundModal.find({ merchantId, isSettled: false });
            let refundArray = refunds.length > 0 ? refunds.map((refund) => refund.toObject()) : null;

            const finalData = calculateInvoiceParameters(merchant, orders, refundArray);
            finalData.merchantId = merchantId;
            finalData.fromDate = fromDate;
            finalData.toDate = toDate;

            const invoiceId = await generateInvoiceId(merchantId);

            const fileName = `invoice_${merchantId}.pdf`;
            const { pdfUrl, invoiceParameters } = await createPDF(fileName, merchant, fromDate, toDate, finalData, invoiceId);

            const invoice = new InvoiceModal({
                merchantId,
                fromDate,
                toDate,
                downloadLink: pdfUrl,
                createdAt: moment.tz(timeZone).toDate(),
                invoiceParameters,
                status: 'UNPAID',
                invoiceId,
                merchantName: merchant.merchantName,
                isManualCreate: false,
            });

            await invoice.save();

            for (const orderData of orders) {
                const order = await OrderModal.findOne({ orderId: orderData.orderId });
                if (order) {
                    order.invoiceId = invoiceId;
                    order.invoiceDate = moment.tz(timeZone).toDate();
                    await order.save();
                }
            }

            if (refundArray) {
                for (const refund of refunds) {
                    refund.isSettled = true;
                    await refund.save();
                }
            }

            console.log(`Invoice for Merchant ID ${merchantId} generated successfully.`);
        }
    } catch (err) {
        console.error('Error generating invoices:', err);
    }
};

// Schedule cron job
cron.schedule('0 6 * * 3', generateInvoices); // Runs every Wednesday at midnight

module.exports = generateInvoices;
