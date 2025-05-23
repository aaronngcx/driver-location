import mongoose from 'mongoose';

const driverLocationSchema = new mongoose.Schema({
  driver_id:  { type: String, required: true },
  latitude:   { type: Number, required: true },
  longitude:  { type: Number, required: true },
  updatedAt:  { type: Date,   default: Date.now },
});

driverLocationSchema.index({ driver_id: 1 }, { unique: true });

export default mongoose.model('DriverLocation', driverLocationSchema);
