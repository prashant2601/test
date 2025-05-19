const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    customerId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    merchantId: { type: Number },
    branchId: { type: Number },
    personalDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String },
      email: { type: String, match: /.+\@.+\..+/, unique: true },
      mobile: { type: String, match: /^[0-9]{1,15}$/ },
      address: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        area: { type: String, default: '' },
        city: { type: String, default: '' },
        post: { type: mongoose.Schema.Types.Mixed},
        country: { type: String, default: '' },
      },
      dob: { type: Date },
      profileImg: { type: String },
    },
    
    registrationDate: { type: Date, default: Date.now },
    registrationMethod: { type: String },
    zone: { type: String },
    isSwishrCourierCustomer: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', CustomerSchema);
