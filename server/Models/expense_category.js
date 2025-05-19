const mongoose = require('mongoose');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const expenseCategorySchema = new mongoose.Schema({
    categoryId: { type: Number, required: true },
    categoryName: { type: String, required: true },
    createdAt: { type: Date, default: moment.tz(timeZone).toDate() },
    updatedAt: { type: Date, default: moment.tz(timeZone).toDate() },
});

module.exports = mongoose.model('expenseCategory', expenseCategorySchema);