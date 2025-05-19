const mongoose = require('mongoose');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const expenseStoreSchema = new mongoose.Schema({
    storeId: { type: Number, required: true },
    storeName: { type: String, required: true },
    storeProfileImg: { type: String },
    storeAddress: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        area: { type: String, default: '' },
        city: { type: String, default: '' },
        post: { type: mongoose.Schema.Types.Mixed },
        country: { type: String, default: '' },
    },
    createdAt: { type: Date, default: moment.tz(timeZone).toDate() },
    updatedAt: { type: Date, default: moment.tz(timeZone).toDate() },
});

module.exports = mongoose.model('expenseStore', expenseStoreSchema);