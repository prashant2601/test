// Models/IdGenerator.js
const mongoose = require('mongoose');

const idGeneratorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "customerId", "merchantId", "itemId"
  seq: { type: Number, default: 0 },                   // Counter for the ID
});

module.exports = mongoose.model('IdGenerator', idGeneratorSchema);
