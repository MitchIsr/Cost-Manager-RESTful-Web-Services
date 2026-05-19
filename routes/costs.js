/*
 * Costs route — POST /api/add (cost item)
 * ---------------------------------------
 * Spec requirements satisfied here:
 *   - Required params: description, category, userid, sum.
 *   - Response is the JSON document of the saved cost, using the same
 *     property names as the costs collection.
 *   - If date is not passed, the server uses the current date.
 *     If date IS passed, that date is used (so back-dating within the
 *     CURRENT month is allowed for late entries).
 *   - The server does NOT allow adding costs with dates that belong
 *     to the past (a previous month). This is required so the
 *     Computed Design Pattern cache for past months can never become
 *     stale.
 *   - The userid must exist in the users collection (Q&A item 11).
 *   - Category must be one of the supported categories.
 *   - Errors return JSON with `id` and `message`.
 */

const express = require('express');
const router = express.Router();

const Cost = require('../models/Cost');
const User = require('../models/User');
const categoriesConfig = require('../models/categories.json');
const allowedCategories = categoriesConfig.categories;

// Helper: returns true iff `date` falls in a month/year that has already
// fully passed relative to "now". The current month is NOT considered past.
function isInPastMonth(date) {
	const now = new Date();
	// Compare year first, then month
	if (date.getFullYear() < now.getFullYear()) return true;
	if (date.getFullYear() > now.getFullYear()) return false;
	return date.getMonth() < now.getMonth();
}

// POST /api/add
router.post('/', async (req, res) => {
	try {
		const { description, category, userid, sum, date, createdAt } = req.body;

		// --- Required-field validation ---------------------------------
		const missing =
			!description ||
			!category ||
			userid === undefined || userid === null ||
			sum === undefined || sum === null;
		if (missing) {
			return res.status(400).json({
				id: 'VALIDATION_ERROR',
				message: 'Missing required fields: description, category, userid, sum'
			});
		}

		// --- Type validation -------------------------------------------
		if (typeof sum !== 'number' || !Number.isFinite(sum) || sum <= 0) {
			return res.status(400).json({
				id: 'INVALID_SUM',
				message: 'sum must be a positive number'
			});
		}

		const userIdNumber = Number(userid);
		if (!Number.isInteger(userIdNumber) || userIdNumber <= 0) {
			return res.status(400).json({
				id: 'INVALID_USERID',
				message: 'userid must be a positive integer'
			});
		}

		// --- Category validation ---------------------------------------
		if (!allowedCategories.includes(category)) {
			return res.status(400).json({
				id: 'INVALID_CATEGORY',
				message: `category must be one of: ${allowedCategories.join(', ')}`
			});
		}

		// --- Date handling ---------------------------------------------
		// Accept either `date` or `createdAt` from the client (spec is silent
		// on the field name — we accept both for flexibility). If neither
		// is provided, fall back to "now".
		const rawDate = date || createdAt;
		let costDate = new Date();
		if (rawDate !== undefined) {
			const parsed = new Date(rawDate);
			if (isNaN(parsed.getTime())) {
				return res.status(400).json({
					id: 'INVALID_DATE',
					message: 'date must be a valid ISO date string'
				});
			}
			costDate = parsed;
		}

		// Reject any date that lives in a previous month/year — the spec
		// states the server doesn't allow adding costs for past dates,
		// which is what makes the Computed Pattern cache safe.
		if (isInPastMonth(costDate)) {
			return res.status(400).json({
				id: 'PAST_DATE_NOT_ALLOWED',
				message: 'Cannot add a cost item with a date in a previous month'
			});
		}

		// --- User-existence check (Q&A item 11) ------------------------
		const userExists = await User.exists({ id: userIdNumber });
		if (!userExists) {
			return res.status(404).json({
				id: 'USER_NOT_FOUND',
				message: `User with id ${userIdNumber} does not exist`
			});
		}

		// --- Persist ---------------------------------------------------
		const cost = await Cost.create({
			description,
			category,
			userid: userIdNumber,
			sum,
			createdAt: costDate
		});

		return res.status(201).json(cost);

	} catch (err) {
		// Catch-all: schema validation errors, network errors, etc.
		return res.status(400).json({
			id: 'ADD_COST_ERROR',
			message: err.message
		});
	}
});

module.exports = router;
