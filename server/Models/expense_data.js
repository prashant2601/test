const mongoose = require('mongoose');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const expenseReceiptDataSchema = new mongoose.Schema({
    receiptId: { type: Number, required: true },
    receiptDate: { type: Date, required: true },
    receiptItems: [{
        category: { type: String},
        itemName: { type: String},
        selectedVAT: { type: Number},
        amount: { type: Number},
        vatAmount: { type: Number },
        total: { type: Number}
    }],
    receiptLink: { type: Array, required: true },
    storeName: { type: String, required: true },
    expenseType: { type: String, required: true },
    spentBy: {type: String, required: true, enum: ["COMPANY", "EMPLOYEE"]},
    claimableVAT : { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidStatus: { type: String, required: true, enum: ["PAID", "UNPAID"], default: "UNPAID" },
    paymentDetails: {type: [
        {
            paymentType: { type: String, enum: ["CASH", "CARD", "BOTH"] },
            cardType: { type: String },
            paymentFrom: {CARD: {type: Number}, CASH: {type: Number}},
            paymentDate: { type: Date, default: function() { return this.receiptDate } },
        }
    ]},

    createdAt: { type: Date, default: moment.tz(timeZone).toDate() },
    updatedAt: { type: Date, default: moment.tz(timeZone).toDate() },
});

module.exports = mongoose.model('expenseData', expenseReceiptDataSchema);
