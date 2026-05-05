const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema({
       userid: { type: Number, required: true },
         year: { type: Number, required: true },
        month: { type: Number, required: true },
       report: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('reports', reportSchema);

