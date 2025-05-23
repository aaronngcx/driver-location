import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import DriverLocation from './models/DriverLocation';
import DriverLocationHistory from './models/DriverLocationHistory';

const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGO_URI!;

app.use(express.json());

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: Number(process.env.MAX_POOL_SIZE),
    wtimeoutMS: Number(process.env.W_TIMEOUT_MS),
    socketTimeoutMS: Number(process.env.SOCKET_TIMEOUT_MS),
  } as any)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.post('/ingest', async (req: Request, res: Response) => {
  const { driver_id, latitude, longitude } = req.body;

  if (
    !driver_id ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const existing = await DriverLocation
    .findOne({ driver_id })
    .select('latitude longitude')
    .lean();

  if (
    existing &&
    existing.latitude === latitude &&
    existing.longitude === longitude
  ) {
    console.log(`↔️ No-op for driver ${driver_id}: location unchanged`);
    return res.status(200).json({ message: 'Location unchanged' });
  }

  try {
    await DriverLocation.updateOne(
      { driver_id },
      {
        $max: { updatedAt: new Date() },
        $set: { latitude, longitude },
        $setOnInsert: { driver_id },
      },
      { upsert: true }
    );

    await DriverLocationHistory.create({
      driver_id,
      latitude,
      longitude,
      timestamp: new Date(),
    });

    console.log(`Stored & logged location for driver ${driver_id}`);
    return res.status(200).json({ message: 'Location stored' });
  } catch (err) {
    console.error('DB error in /ingest:', err);
    return res.status(500).json({ error: 'Failed to store location' });
  }
});

app.get('/location/:driver_id', async (req: Request, res: Response) => {
  const { driver_id } = req.params;

  try {
    const location = await DriverLocation.findOne({ driver_id });

    if (!location) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    return res.status(200).json({
      driver_id: location.driver_id,
      latitude: location.latitude,
      longitude: location.longitude,
      updatedAt: location.updatedAt,
    });
  } catch (err) {
    console.error('DB fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch location' });
  }
});

app.get('/history/:driver_id', async (req: Request, res: Response) => {
  const { driver_id } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
  const page  = Math.max(parseInt(req.query.page  as string) || 0,   0);

  try {
    const records = await DriverLocationHistory
      .find({ driver_id })
      .sort({ timestamp: -1 })
      .skip(page * limit)
      .limit(limit)
      .select('latitude longitude timestamp -_id')
      .lean();

    return res.json({
      driver_id,
      page,
      limit,
      records
    });
  } catch (err) {
    console.error('History fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`Ingestion service running at http://localhost:${PORT}`);
});