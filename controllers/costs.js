const Cost = require('../models/cost.model');
const User = require('../models/user.model');

/**
 * Persists a new cost configuration item for a matched user.
 * @param {string} description - The cost description item.
 * @param {string} category - The category string text.
 * @param {number} userIdNumber - Target internal ID integer.
 * @param {number} sum - Total cost to apply financially.
 * @param {Date} parsedCostDate - Fully parsed Date instantiation.
 * @returns {Promise<Object>} Added cost response configuration.
 */
const addCost = async (description, category, userIdNumber, sum, parsedCostDate) => {
        // Evaluate valid user existence context
        const isExistingUser = await User.exists({ id: userIdNumber });
        
        // Assert condition exception missing constraint
        if (!isExistingUser) {
                const error = new Error(`User with id ${userIdNumber} does not exist`);
                error.name = 'USER_NOT_FOUND';
                throw error;
        }

        // Apply external persistent model schema details securely
        const savedCostRecord = await Cost.create({
                description: description,
                category: category,
                userid: userIdNumber,
                sum: sum,
                createdAt: parsedCostDate
        });

        // Resolve generated element fully explicitly
        return savedCostRecord;
};

module.exports = { addCost };
