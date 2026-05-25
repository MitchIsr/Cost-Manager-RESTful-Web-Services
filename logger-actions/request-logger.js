/*
 * RequestLogger
 * -------------
 * Per-request logging middleware. The spec requires:
 *   1) The Pino library MUST be used to create the log messages.
 *   2) Log messages MUST be persisted to MongoDB for every HTTP
 *      request received by the server.
 *
 * Implementation:
 *   - A single Pino logger instance is configured at module load.
 *   - Pino owns *creating* the log record (it produces the timestamp,
 *     formats the structured fields, and also emits the line to stdout
 *     for live visibility during development).
 *   - In parallel, the same structured record is persisted to the
 *     `logs` MongoDB collection through the Mongoose `Log` model so
 *     that `GET /api/logs` can return it.
 *   - Mongo persistence is fire-and-forget (no `await` on the request
 *     path) — this keeps the HTTP response fast and never lets a log
 *     write error fail the request.
 */
const pino = require('pino');
const Log = require('../models/log.model');

// Pino logger — pretty-prints nothing, just structured NDJSON to stdout.
// Setting `base: null` removes pid/hostname noise; we add timestamp manually.
const logger = pino({
        base: null,
        timestamp: pino.stdTimeFunctions.isoTime,
        level: process.env.LOG_LEVEL || 'info'
});

/**
 * Express middleware to handle HTTP request logging to Pino and MongoDB.
 * @param {Object} req - The express request object.
 * @param {Object} res - The express response object.
 * @param {Function} next - The express next middleware function.
 */
const requestLogger = (req, res, next) => {
        // Capture request start so we can also record duration if useful
        const startedAt = Date.now();

        res.on('finish', () => {
                const requestLogData = {
                        method: req.method,
                        path: req.originalUrl,
                        status: res.statusCode,
                        message: `${req.method} ${req.originalUrl} ${res.statusCode}`,
                        timestamp: new Date(),
                        durationMs: Date.now() - startedAt
                };

                // (1) Use Pino to *create* the log message (and emit to stdout)
                logger.info(requestLogData, requestLogData.message);

                // (2) Persist the same record to MongoDB for GET /api/logs.
                // We don't await — logging must never block the response.
                Log.create(requestLogData).catch((error) => {
                        // ignore the rejection avoiding halting the stream
                        logger.error({ error: error.message }, 'failed to persist log entry');
                });
        });

        // resume processing the route
        next();
};

module.exports = requestLogger;
