const mongoose = require('mongoose');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const expenseTypeSchema = new mongoose.Schema({
    expenseTypeId: { type: Number, required: true },
    expenseTypeName: { type: String, required: true },
    createdAt: { type: Date, default: moment.tz(timeZone).toDate() },
    updatedAt: { type: Date, default: moment.tz(timeZone).toDate() },
});

module.exports = mongoose.model('expenseType', expenseTypeSchema);