const mongoose = require('mongoose');

const moment = require('moment-timezone');
const timeZone = 'Europe/London';

// Define the schema for the Invoice
const refundSchema = new mongoose.Schema({
    orderId : { type: Number, required: true },
    orderDate: { type: Date, required: true },
    refundAmount : { type: Number, required: true, default: 0 },
    refundReason : { type: String, default: '' },
    merchantId : { type: Number, required: true },
    customerId : {type: Number, required: true },
    invoiceId: { type: String },
    invoiceDate: { type: mongoose.Schema.Types.Mixed },
    refundCaptureDate: { type: Date, required: true, default: moment.tz(timeZone).toDate() },
    isSettled : { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('Refunds', refundSchema);
