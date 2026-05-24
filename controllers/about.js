const teamMembersData = require('../models/TeamMembers.json');
const { extractMemberDetails } = require('../utils/about');

/**
 * Retrieves the application about details.
 * @returns {Promise<Array<Object>>} The team members list.
 */
const getAbout = async () => {
    // Return extracted members safely
    return extractMemberDetails(teamMembersData.TeamMembers);
};

module.exports = { getAbout };
