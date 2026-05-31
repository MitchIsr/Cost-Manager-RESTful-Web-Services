const teamMembersData = require('../models/team-members.json');
const { extractMemberDetails } = require('../utils/about_utils');

/**
 * Retrieves the application about details.
 * @returns {Promise<Array<Object>>} The team members list.
 */
const getAbout = async () => {
    // Return extracted members safely
    return extractMemberDetails(teamMembersData.TeamMembers);
};

module.exports = { getAbout };
