const mongoose = require('mongoose');

// Define the schema for the Invoice
const feedbackSchema = new mongoose.Schema({
    customerId: { type: Number, required: true, default: 0 },
    merchantId: {type: Number, required: true, default: 0},
    orderId: { type: Number, required: true, default: 0 },
    rating: { type: Number },
    suggestion: { type: String },
    feedbackDate: { type: Date, required: true },
    recommended: { type: String, enum: ['YES', 'NO'], default: 'NO' },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
