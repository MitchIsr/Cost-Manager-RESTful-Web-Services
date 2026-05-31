/**
 * Validates the raw input payload to construct users dynamically.
 * @param {string|number} id - Target numeric reference id limit.
 * @param {string} firstName - Full text name component.
 * @param {string} lastName - Full text trailing component.
 * @param {string} birthday - User defined birthday date text.
 * @returns {Object} Structured metadata payload context element.
 */
const validateUserInput = (id, firstName, lastName, birthday) => {
        // Assert condition requirements correctly mapped missing checks
        const isMissingRequired = id === undefined || id === null || !firstName || !lastName || !birthday;
        if (isMissingRequired) {
                return { isValid: false, errorMessage: 'Missing required fields: id, first_name, last_name, birthday', errorId: 'VALIDATION_ERROR' };
        }
        
        // Assert explicitly safely bounded format mapping numeric cast
        const numericId = Number(id);
        const isInvalidId = !Number.isInteger(numericId) || numericId <= 0;
        if (isInvalidId) {
                return { isValid: false, errorMessage: 'Field "id" must be a positive integer', errorId: 'VALIDATION_ERROR' };
        }

        // Validate time format parsed boundary limit context constraints
        const parsedBirthday = new Date(birthday);
        const isInvalidDate = isNaN(parsedBirthday.getTime());
        if (isInvalidDate) {
                return { isValid: false, errorMessage: 'Field "birthday" must be a valid date', errorId: 'VALIDATION_ERROR' };
        }
        
        // Apply success execution payload variables properly
        return { isValid: true, numericId, parsedBirthday };
};

/**
 * Validates the ID representation limit bounds globally.
 * @param {string|number} userIdParam - Extracted URL input.
 * @returns {Object} Cleaned object reference details mapped correctly.
 */
const validateUserIdParam = (userIdParam) => {
        // Retrieve casted valid conversion safely formatted bounds
        const numericId = Number(userIdParam);
        const isInvalid = !Number.isInteger(numericId);
        
        // Output contextual constraint limits mapped globally
        return { isValid: !isInvalid, numericId };
};

module.exports = { validateUserInput, validateUserIdParam };
