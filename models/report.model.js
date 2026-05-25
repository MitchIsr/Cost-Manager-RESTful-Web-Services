/*
 * Report model
 * ------------
 * Cache collection used by the Computed Design Pattern in
 * routes/report.js. One document per unique {userid, year, month}
 * tuple — created only after the requested month has fully passed,
 * because at that point the underlying costs can no longer change
 * (the costs route refuses new items dated to the past).
 */

const mongoose = require('mongoose');

// Define Schema for pre-computed cache reports
const reportSchema = new mongoose.Schema({
	userid:    { type: Number, required: true },
	year:      { type: Number, required: true },
	month:     { type: Number, required: true },
	report:    { type: mongoose.Schema.Types.Mixed, required: true }, // the full JSON response
	createdAt: { type: Date,   default: Date.now }
}, { versionKey: false });

// Compound index — every lookup is by these three fields together
reportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('reports', reportSchema);
