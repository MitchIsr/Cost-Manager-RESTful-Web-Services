/*
 * Logs route — GET /api/logs
 * --------------------------
 * Returns every document in the `logs` collection, newest first.
 * The property names of each item match the schema fields defined in
 * models/Log.js (timestamp, method, path, status, message, durationMs).
 *
 * Logs themselves are written by LoggerActions/RequestLogger.js, which
 * uses Pino as the logger and persists each entry via the Mongoose
 * `Log` model. See that file for the full pipeline.
 */

const express = require('express');
const router = express.Router();

const Log = require('../models/Log');

// GET /api/logs
router.get('/', async (req, res) => {
	let status = 200;
	let payload = null;

	try {
		// Newest first — friendlier when scrolling through requests
		payload = await Log.find().sort({ timestamp: -1 });
	} catch (err) {
		status = 500;
		payload = {
			id: 'GET_LOGS_ERROR',
			message: err.message
		};
	}

	return res.status(status).json(payload);
});

module.exports = router;
