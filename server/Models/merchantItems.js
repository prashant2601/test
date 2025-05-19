const mongoose = require('mongoose');

const MerchantItemsSchema = new mongoose.Schema(
    {
        merchantId: {type: Number, required: true},
        itemName: {type: String, required: true},
        totalAmount: {type: Number, required: true},
        totalQuantity: {type: Number},
        balanceAmount: {type: Number},
        deductableAmount: {type: Number},
        transactions: [{
            date: {type: Date},
            amount: {type: Number},
            isPaid: {type: Boolean},
            invoiceId: {type: String}
        }],
        isWaivedOff: {type: Boolean, default: false},
        issueDate: {type: Date},
        itemId: {type: Number, required: true, unique: true}
    },

    { timestamps: true }
)

module.exports = mongoose.model('MerchantItems', MerchantItemsSchema);