const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["superAdmin", 'merchant', 'affiliate', 'admin', 'staff', 'support', 'driver'], required: true },
    menus : { type: Array, default: [] }
  }
);


module.exports = mongoose.model("MenuConfig", menuSchema);
