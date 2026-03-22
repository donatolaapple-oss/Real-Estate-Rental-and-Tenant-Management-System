// server/models/Property.js - Add these fields
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  safetyRating: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'B' },
  convenienceScore: { type: Number, min: 1, max: 10, default: 7 },
  maintenanceRating: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  }
});

module.exports = mongoose.model('Property', PropertySchema);
