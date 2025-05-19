const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema(
  {
    merchantId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    merchantName: {
      type: String,
      required: true,
    },
    merchantEmail: {
      type: String,
      match: /.+\@.+\..+/,
    },
    merchantMobile: {
      type: String,
    },
    merchantAddress: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      area: { type: String, default: '' },
      city: { type: String, default: '' },
      post: {type: mongoose.Schema.Types.Mixed, required: true },
      country: { type: String, default: '' },
    },
    serviceFeeApplicable: {
      type: Boolean,
      default: true
    },
    deliveryChargeApplicable: {
      type: Boolean,
      default: true
    },
    driverTipApplicable: {
      type: Boolean,
      default: true
    },
    deliveryOrdersComission: { type: Number },
    collectionOrdersComission: { type: Number },
    eatInComission: { type: Number },
    logoImg: { type: String },
    registrationDate: { type: Date, default: Date.now },
    registrationMethod: { type: String },
    zone: { type: String },
    totalOrders: { type: Number, default: 0 },
    taxRate: { type: Number, default: 20 },
    isActive: {type: Boolean, default: true},
    rating: {type: Number},
    isInHouseType: {type: Boolean, default: false},
    isEmailApplicable: {type: Boolean, default: true}, 
    isPartner: {type: Boolean, default: true},
    isCourier: {type: Boolean, default: false},
    merchantManagementInfo: {
      ownerName: {type:String},
      ownerPhone: {type:String, match: /^[0-9]{1,15}$/},
      ownerEmail: {type:String},
      managerName: {type:String},
      managerPhone: {type:String, match: /^[0-9]{1,15}$/},
      managerEmail: {type:String}
    },
  },
  
  { timestamps: true }
);

module.exports = mongoose.model('Merchant', MerchantSchema);
