/*
 * Cost model
 * ----------
 * Mongoose schema for the `costs` collection.
 *
 * Spec-mandated field types (do not change without consulting the spec):
 *   description : String
 *   category    : String   (must be one of the allowed categories)
 *   userid      : Number
 *   sum         : Double
 *
 * `createdAt` is added so the monthly report can group costs by month
 * even when the client did not supply a date.
 */

const mongoose = require('mongoose');
const categoriesConfig = require('./categories.json');
const allowedCategories = categoriesConfig.categories;

// Define Schema for saved cost configurations items
const costSchema = new mongoose.Schema({
        description: { type: String, required: true, trim: true },
           category: { type: String, required: true, enum: allowedCategories },
             userid: { type: Number, required: true },
                sum: { type: mongoose.Schema.Types.Double, required: true },
          createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('costs', costSchema);
