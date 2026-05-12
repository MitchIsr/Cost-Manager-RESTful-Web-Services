const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error(err);
    }
};

module.exports = connectDB;