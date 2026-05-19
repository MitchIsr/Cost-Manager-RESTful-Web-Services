/*
 * db.js — MongoDB connection
 * --------------------------
 * Establishes a single Mongoose connection per process using the
 * MONGO_URI value from the .env file. Each of the four microservices
 * imports and calls connectDB() at startup, because each one runs as
 * a separate Node process and therefore needs its own connection.
 *
 * If the connection fails the process exits with code 1 — running a
 * service that can never talk to its database is worse than a noisy
 * crash because every subsequent request would silently 500.
 */

const mongoose = require('mongoose');
const path = require('path');

// Load .env from the project root regardless of cwd
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		console.error('[db] MONGO_URI is not set in .env — aborting');
		process.exit(1);
	}
	try {
		await mongoose.connect(uri);
		console.log('[db] MongoDB connected');
	} catch (err) {
		console.error('[db] MongoDB connection failed:', err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
