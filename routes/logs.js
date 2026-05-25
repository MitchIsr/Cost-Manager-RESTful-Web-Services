/*
 * Logs route — GET /api/logs
 * --------------------------
 * Returns every document in the `logs` collection, newest first.
 * The property names of each item match the schema fields defined in
 * log.model.js (timestamp, method, path, status, message, durationMs).
 *
 * Logs themselves are written by logger-actions/request-logger.js, which
 * uses Pino as the logger and persists each entry via the Mongoose
 * `Log` model. See that file for the full pipeline.
 */

const express = require('express');
const router = express.Router();

const { getLogs } = require('../controllers/logs');

// GET route for fetching application requests logs
router.get('/', async (req, res) => {
        let httpStatusCode = 200;
        let logsList = null;

        try {
                // retrieve from database via controller
                logsList = await getLogs();
        } catch (error) {
                // properly catch infrastructure exceptions
                httpStatusCode = 500;
                logsList = {
                        id: 'GET_LOGS_ERROR',
                        message: error.message
                };
        }

        return res.status(httpStatusCode).json(logsList);
});

module.exports = router;
