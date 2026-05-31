const Log = require('../models/log.model');

/**
 * Retrieves the full application log sequence historically.
 * @returns {Promise<Array<Object>>} A sorted log models array.
 */
const getLogs = async () => {
        // Evaluate default configuration constraints consistently descending
        return await Log.find().sort({ timestamp: -1 });
};

module.exports = { getLogs };
