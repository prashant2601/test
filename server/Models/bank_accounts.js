const mongoose = require('mongoose');

const moment = require('moment-timezone');
const timeZone = 'Europe/London';

// Define the schema for the Invoice
const bankAccountSchema = new mongoose.Schema({
    accId : { type: Number, required: true },
    accountAddedOn: { type: Date, default: moment.tz(timeZone).toDate() },
    accountHolderName : { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber : { type: Number, required: true },
    sortCode : { type: Number, required: true },
    accountHolderId : {type: Number, required: true },
    accountRole: {type: String, required: true, enum: ["Partner Merchant", "Courier Customer", "Driver", "Affiliate"]},
    merchantId: {type: Number },
    merchantName: {type: String},   
});

module.exports = mongoose.model('bankAccounts', bankAccountSchema);
