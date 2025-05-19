const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); 

const userSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    role: { type: String, enum: ["superAdmin", 'merchant', 'affiliate', 'admin', 'staff', 'support', 'driver'], required: true },
    password: { type: String, required: true },
    status: { type: String, required: true, enum : ['active', 'suspended', 'inactive']},
    activatedOn: { type: Date },
    profileImg: {type: String},
    phone: { type: String, match: /^[0-9]{1,15}$/ },
    lastLogin: { type: Date},
    lastActive: { type: Date }, 
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    merchantIds: {type: Array},
    affiliateId:{type: Number},

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false }
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 72 * 60 * 60 * 1000; // Token expires in 72 hours
  return resetToken; // Return plain token (not hashed)
};


module.exports = mongoose.model("User", userSchema);
