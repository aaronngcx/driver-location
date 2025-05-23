import mongoose from 'mongoose';

const DriverLocationHistorySchema = new mongoose.Schema({
  driver_id:    { type: String, required: true },
  latitude:     { type: Number, required: true },
  longitude:    { type: Number, required: true },
  timestamp:    { type: Date,   required: true, default: Date.now },
});

DriverLocationHistorySchema.index({ driver_id: 1, timestamp: -1 });

export default mongoose.model(
  'DriverLocationHistory',
  DriverLocationHistorySchema
);
