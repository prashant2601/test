const mongoose = require('mongoose');

// Define the schema for the Invoice
const invoiceSchema = new mongoose.Schema({
    merchantId: { type: Number, ref: 'Merchant', default: 0},
    merchantName: { type: String, ref: 'Merchant' },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    downloadLink: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    invoiceParameters: { type: Object, required: true },
    status: { type: String,  enum: ['PAID', 'UNPAID'], default: 'UNPAID' },
    updatedAt: {type: Date, default: Date.now},
    invoiceId: {type: String, required: true},
    isSentToMerchant: {type: Boolean, default: false},
    sentToMerchantAt: { type: Date },
    viewHistory: {type: Array, default: []},
    isEditable: {type: Boolean, default: true},
    isManualCreate: {type: Boolean, default: false},
    paidDate: {type: Date},
    isPaidDisable : {type: Boolean, default: false},
    isMarketPlaceInvoiceManually : {type: Boolean},
    isOlderInvoice: {type: Boolean, default: false},
});

module.exports = mongoose.model('Invoice', invoiceSchema);
