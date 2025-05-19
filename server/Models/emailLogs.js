const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  emailId: { type: String},
  emailType: { type: String, enum: ['orderFeedback', 'invoice', 'resetPassword'], required: true },
  receiverId: { type: Number },
  receiverName: { type: String},
  orderId: { type: mongoose.Schema.Types.Mixed  },
  status: { type: String, enum: ['processing', 'sent', 'failed'], default: 'processing' },
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  sendBy: { type: String, enum: ['merchant', 'affiliate', 'admin', 'staff', 'support', 'superAdmin', 'automatic'], default: 'superAdmin' },
  sendTo: { type: String, enum: ['customer', 'merchant', 'affiliate', 'admin', 'staff', 'support'] },
});

module.exports = mongoose.model('EmailLog', EmailLogSchema);
