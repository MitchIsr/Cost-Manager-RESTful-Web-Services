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

/**
 * Initiates the MongoDB connection for the current process.
 * Halts the process running if unable to connect successfully.
 */
const connectDB = async () => {
        const hasUri = process.env.MONGO_URI;
        if (!hasUri) {
                // missing uri throws immediate error flag
                console.error('[db] MONGO_URI is not set in .env — aborting');
                process.exit(1);
        }
        
        try {
                // execute standard db connections mapping
                const uriString = String(hasUri);
                await mongoose.connect(uriString);
                console.log('[db] MongoDB connected');
        } catch (err) {
                // throw explicit error description string to the user
                console.error('[db] MongoDB connection failed:', err.message);
                process.exit(1);
        }
};

module.exports = connectDB;
