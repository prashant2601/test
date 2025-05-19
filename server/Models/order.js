const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, // Order ID must be unique
    orderDate: { type: Date, required: true },
    customerId: { type: Number, required: true },
    customerFirstName: { type: String },
    customerLastName: { type: String },
    orderType: { type: String },
    paymentType: { type: String },
    paymentStatus: { type: String },
    confirmationStatus: { type: String },
    promoCode: { type: String },
    promoDiscountSwishr: { type: Number, default: 0 },
    promoDiscountMerchant: { type: Number, default: 0 },
    orderDiscount: { type: Number },
    driverTip: { type: Number },
    deliveryCharge: { type: Number },
    serviceFee: { type: Number },
    surcharge: { type: Number },
    subTotal: { type: Number },
    taxes: { type: Number },
    total: { type: Number },
    branchName: { type: String },
    merchantId: { type: Number, default: 0 },
    status: { type: String, default: '' }, 
    refundSwishr: { type: Number, default: 0 },
    refundMerchant: { type: Number, default: 0 },
    orderItems: {type: Array, default: []},
    feedback: {type: Number},
    invoiceId: {type: String},
    invoiceDate: {type: Date},
    uploadedAt: { type: Date },
    feedbackEmailSent: { type: Boolean, default: false },
    isOrderUpdated: { type: Boolean, default: false },
    netCommission : { type: Number},
    netServiceFee : { type: Number},
    netDeliveryCharge : { type: Number},
    newOrderValue : { type: Number},
    merchantDetails: { type: Object },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
