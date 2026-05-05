const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
       method: { type: String },
         path: { type: String },
       status: { type: Number },
      message: { type: String }
});
module.exports = mongoose.model('Log', logSchema);

