/*
 * Log model
 * ---------
 * Mongoose schema for the `logs` collection.
 * One document per HTTP request, written by LoggerActions/RequestLogger.js.
 * The collection name is "logs" (Mongoose pluralizes the model name).
 */

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
	timestamp:  { type: Date,   default: Date.now },  // when the log was written
	method:     { type: String },                     // HTTP method (GET/POST/...)
	path:       { type: String },                     // request URL path
	status:     { type: Number },                     // HTTP response status code
	message:    { type: String },                     // human-readable summary
	durationMs: { type: Number }                      // request handler duration
}, { versionKey: false });

module.exports = mongoose.model('Log', logSchema);
