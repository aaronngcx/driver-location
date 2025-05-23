import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

type LocationUpdate = {
  driver_id: string;
  latitude: number;
  longitude: number;
  time_offset_sec: number;
};

const BASE = process.env.INGESTION_BASE_URL!;
const INGEST_ENDPOINT = `${BASE}/ingest`;

const sendLocationUpdate = async (location: LocationUpdate) => {
  try {
    await axios.post(INGEST_ENDPOINT, {
      driver_id: location.driver_id,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    console.log(`Sent update: ${JSON.stringify(location)}`);
  } catch (err) {
    console.error('Error sending location:', err);
  }
};

const processLocationUpdates = async () => {
  console.log('Starting location update processing...');

  const DRIVER_LOG_PATH = process.env.DRIVER_LOG_PATH || './driver_location_log.json';
  const filePath = path.resolve(process.cwd(), DRIVER_LOG_PATH);

  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    console.log(`Loaded ${process.env.DRIVER_LOG_PATH} (${fileData.length} bytes)`);

    const updates: LocationUpdate[] = JSON.parse(fileData);
    console.log(`Total updates to process: ${updates.length}`);

    const startTime = Date.now();

    for (const update of updates) {
      const waitTime = update.time_offset_sec * 1000 - (Date.now() - startTime);
      if (waitTime > 0) await new Promise((r) => setTimeout(r, waitTime));
      await sendLocationUpdate(update);
    }

    console.log('All updates processed.');
  } catch (err) {
    console.error('Failed to process location updates:', err);
  }
};

processLocationUpdates();
