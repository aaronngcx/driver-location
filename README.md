# Driver Location Service

This backend service ingests, stores, and serves real-time and historical location data for drivers in a ride-hailing platform. It is built with **Node.js**, **Express**, and **MongoDB Atlas**, using **Mongoose** for schema modeling.

## Features

- Ingest real-time location updates via HTTP
- Store latest driver location with upsert behavior
- Persist full location history for each driver
- Retrieve latest location or paginated location history
- Configurable via environment variables

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

## Getting Started

### 1. Clone the repository and install dependencies

git clone https://github.com/aaronngcx/driver-location.git
cd driver-location
npm install
npm run build

### 2. Configure Environment Variables
cp sample.env .env

### 3. Run the ingestion API
npm run dev

### 4. Process driver location updates
Open another terminal in project path
npm run process

## API Endpoints

### POST `/ingest`
Ingest a new driver location.

**Payload:**
```json
{
  "driver_id": "driver_999",
  "latitude": 12.345,
  "longitude": 67.890
}
```

### GET `/location/:driver_id`

Returns the latest known location for a given driver.

### GET `/history/:driver_id?limit=100&page=0`

Returns a paginated list of historical location entries for a given driver.
