const mongoose = require('mongoose');
const categoriesConfig = require('../config/categories.json');
const allowedCategories = categoriesConfig.categories;

const costSchema = new mongoose.Schema(
    {
        description: { type: String, required: true },
           category :{ type: String, required: true, enum: allowedCategories },
             userid: { type: Number, required: true },
                sum: { type: mongoose.Schema.Types.Double, required: true },
          createdAt: { type: Date, default: Date.now }
}
);

module.exports = mongoose.model('costs', costSchema);