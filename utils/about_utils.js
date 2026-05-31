/**
 * Extracts and maps the required member details.
 * @param {Array<Object>} membersList - The list of members.
 * @returns {Array<Object>} The mapped member details.
 */
const extractMemberDetails = (membersList) => {
        // Map members to only include first and last name
        return membersList.map((member) => ({
                first_name: member.first_name,
                last_name: member.last_name
        }));
};

module.exports = { extractMemberDetails };
