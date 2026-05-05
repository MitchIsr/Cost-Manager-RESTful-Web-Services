
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
            id: { type: Number, required: true, unique: true },
    first_name: { type: String, required: true },
     last_name: { type: String, required: true },
      birthday: { type: Date, required: true }
});

module.exports = mongoose.model('users', usersSchema);