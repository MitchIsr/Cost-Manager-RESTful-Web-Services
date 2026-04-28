const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userid: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    report: { type: Object, required: true }, // store the computed JSON
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);