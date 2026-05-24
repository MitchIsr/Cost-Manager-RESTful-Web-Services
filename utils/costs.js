const categoriesConfig = require('../models/categories.json');
const allowedCategoriesList = categoriesConfig.categories;

/**
 * Checks if a given date is in a past month or year.
 * @param {Date} date - The date to check.
 * @returns {boolean} True if past month, false otherwise.
 */
const isDateInPastMonth = (date) => {
        // Retrieve current date details
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const targetYear = date.getFullYear();
        
        // Assert year boundary condition
        const isPastYear = targetYear < currentYear;
        if (isPastYear) {
                return true;
        }

        // Assert future year condition
        const isFutureYear = targetYear > currentYear;
        if (isFutureYear) {
                return false;
        }

        // Assert month boundary when year is matched
        const isPastMonth = date.getMonth() < currentDate.getMonth();
        return isPastMonth;
};

/**
 * Validates the raw input parts of a new cost operation.
 * @param {string} description - Description text.
 * @param {string} category - Category identifier.
 * @param {string|number} userid - Target user id.
 * @param {number} sum - Total cost amount.
 * @returns {Object} Validation result structure.
 */
const validateCostInput = (description, category, userid, sum) => {
        // Verify missing fields explicitly
        const isMissingRequired = !description || !category || userid === undefined || userid === null || sum === undefined || sum === null;
        if (isMissingRequired) {
                return { isValid: false, errorMessage: 'Missing required fields: description, category, userid, sum', errorId: 'VALIDATION_ERROR' };
        }

        // Validate constraint of numeric sum
        const isSumInvalid = typeof sum !== 'number' || !Number.isFinite(sum) || sum <= 0;
        if (isSumInvalid) {
                return { isValid: false, errorMessage: 'sum must be a positive number', errorId: 'INVALID_SUM' };
        }

        // Transform incoming userid to number representation securely
        const userIdNumber = Number(userid);
        const isUserIdInvalid = !Number.isInteger(userIdNumber) || userIdNumber <= 0;
        if (isUserIdInvalid) {
                return { isValid: false, errorMessage: 'userid must be a positive integer', errorId: 'INVALID_USERID' };
        }

        // Validate explicitly allowed categories from config bounds
        const isCategoryInvalid = !allowedCategoriesList.includes(category);
        if (isCategoryInvalid) {
                return { isValid: false, errorMessage: `category must be one of: ${allowedCategoriesList.join(', ')}`, errorId: 'INVALID_CATEGORY' };
        }

        // Resolve successful validation
        return { isValid: true, userIdNumber };
};

/**
 * Validates and converts raw date for costs operation.
 * @param {string|number|Date|undefined} rawDate - Raw cost date timestamp.
 * @returns {Object} Date validation output context.
 */
const validateCostDate = (rawDate) => {
        // Base initialization default
        let parsedCostDate = new Date();
        const isDateProvided = rawDate !== undefined;
        
        // Handle presence check explicitly
        if (isDateProvided) {
                const manualParsedDate = new Date(rawDate);
                const isDateInvalid = isNaN(manualParsedDate.getTime());
                if (isDateInvalid) {
                        return { isValid: false, errorMessage: 'date must be a valid ISO date string', errorId: 'INVALID_DATE' };
                }
                parsedCostDate = manualParsedDate;
        }

        // Disallow past month boundary edge cases conceptually
        const isPastMonthDate = isDateInPastMonth(parsedCostDate);
        if (isPastMonthDate) {
                return { isValid: false, errorMessage: 'Cannot add a cost item with a date in a previous month', errorId: 'PAST_DATE_NOT_ALLOWED' };
        }

        // Return strictly formatted explicit outputs
        return { isValid: true, parsedCostDate };
};

module.exports = { isDateInPastMonth, validateCostInput, validateCostDate };
