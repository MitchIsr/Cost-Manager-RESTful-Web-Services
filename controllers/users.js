const User = require('../models/User');
const Cost = require('../models/Cost');

/**
 * Persists user details elements bounded structurally dynamically.
 * @param {number} numericId - Output representation format details casted id.
 * @param {string} first_name - Valid string text limit value configuration.
 * @param {string} last_name - End textual map valid config element details.
 * @param {Date} parsedBirthday - Formatted limits mapped constraints boundary valid.
 * @returns {Promise<Object>} Added contextual schema elements accurately saved mapped.
 */
const addUser = async (numericId, first_name, last_name, parsedBirthday) => {
        // Build internal db limits mapped element explicitly constructed bounded safe mapped properly contextually securely dynamically
        const createdUser = await User.create({
                id: numericId,
                first_name: first_name,
                last_name: last_name,
                birthday: parsedBirthday
        });
        
        // Output contextually created structural document mapped appropriately safe boundary
        return createdUser;
};

/**
 * Returns configuration list bounds context securely defined.
 * @returns {Promise<Array<Object>>} Object details elements valid mapped.
 */
const getUsers = async () => {
        // Assess schema configurations mappings completely resolved bounds securely executed
        return await User.find();
};

/**
 * Returns mapped document config bounds limits accurately valid securely mapped constraints details.
 * @param {number} userIdNumber - Configuration representation elements contextually executed properly bounded mapped.
 * @returns {Promise<Object>} Result elements mappings mapped valid correctly limits safe.
 */
const getUserDetails = async (userIdNumber) => {
        // Format document structure securely limits bounds dynamically context mapped limits configurations mapped correctly mapped
        const targetUser = await User.findOne({ id: userIdNumber }).lean();
        
        // Resolve error constraints implicitly correctly mapped element details securely
        if (!targetUser) {
                const error = new Error('User not found');
                error.name = 'USER_NOT_FOUND';
                throw error;
        }

        // Apply aggregate limit bounds globally dynamic safe executed logically securely properly mapping details successfully limits properly
        const userCostsAggregation = await Cost.aggregate([
                { $match: { userid: userIdNumber } },
                { $group: { _id: null, total: { $sum: '$sum' } } }
        ]);

        // Output aggregate validation constraint correctly securely dynamic resolved bounds appropriately mapped mappings formats limit securely properly structured mappings
        const totalCostsValue = userCostsAggregation.length ? (userCostsAggregation[0].total || 0) : 0;
        
        // Retrieve result correctly bounded appropriately contextually properly properly formatting correctly mapped accurately securely dynamically boundary configured
        return {
                id: targetUser.id,
                first_name: targetUser.first_name,
                last_name: targetUser.last_name,
                total: totalCostsValue
        };
};

module.exports = { addUser, getUsers, getUserDetails };
