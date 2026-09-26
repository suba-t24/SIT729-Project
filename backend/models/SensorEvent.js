const mongoose = require('mongoose');

const sensorEventSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, required: true },
  reading: { type: Object, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true }
});

module.exports = mongoose.model('SensorEvent', sensorEventSchema);
