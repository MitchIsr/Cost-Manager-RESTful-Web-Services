/*
 * Report route — GET /api/report
 * ------------------------------
 * Query params (all required): id, year, month
 *
 * Response shape (matches the sample in the spec):
 *   {
 *     userid, year, month,
 *     costs: [
 *       { food:      [{ sum, description, day }, ...] },
 *       { health:    [...] },
 *       { housing:   [...] },
 *       { sports:    [...] },
 *       { education: [...] }
 *     ]
 *   }
 *
 * Empty categories ARE included (per spec clarification dated April 30 2026).
 *
 * Computed Design Pattern
 * -----------------------
 * Building the report scans every cost item in the month. For a month
 * that has already fully passed, the data can never change (the costs
 * route refuses new cost items for past months), so we cache the
 * computed report in the `reports` collection. On subsequent requests
 * for the same {userid, year, month} we skip the aggregation and return
 * the cached document directly.
 *
 * For the current month or any future month we never cache, because new
 * costs may still be added and would invalidate the cache.
 */

const express = require('express');
const router = express.Router();

const Cost = require('../models/Cost');
const Report = require('../models/Report');

// The 5 supported categories (in the order they appear in responses)
const CATEGORIES = ['food', 'health', 'housing', 'sports', 'education'];

// Build a fresh "category -> []" map. Empty arrays for every category
// guarantee that all categories appear in the response, even when the
// user has no costs in some (or all) of them.
function buildEmptyCategoryMap() {
	const map = {};
	CATEGORIES.forEach((c) => { map[c] = []; });
	return map;
}

// GET /api/report?id=123123&year=2026&month=1
router.get('/', async (req, res) => {
	let status = 200;
	let payload = null;

	try {
		const { id, year, month } = req.query;

		// Required-query-param validation
		if (id === undefined || year === undefined || month === undefined) {
			status = 400;
			payload = {
				id: 'VALIDATION_ERROR',
				message: 'Missing required query parameters: id, year, month'
			};
		} else {
			// Numeric coercion + validation
			const userId      = parseInt(id,    10);
			const reportYear  = parseInt(year,  10);
			const reportMonth = parseInt(month, 10);

			const invalidNumbers =
				Number.isNaN(userId) ||
				Number.isNaN(reportYear) ||
				Number.isNaN(reportMonth);

			if (invalidNumbers) {
				status = 400;
				payload = {
					id: 'INVALID_PARAMETERS',
					message: 'id, year and month must be numbers'
				};
			} else if (reportMonth < 1 || reportMonth > 12) {
				status = 400;
				payload = {
					id: 'INVALID_MONTH',
					message: 'month must be between 1 and 12'
				};
			} else {
				/*
				 * Computed Design Pattern — step 1:
				 * Look for a previously cached report for the same
				 * {userid, year, month} triple.
				 */
				const cached = await Report.findOne({
					userid: userId,
					year:   reportYear,
					month:  reportMonth
				});

				if (cached && cached.report) {
					// Cache hit: short-circuit
					payload = cached.report;
				} else {
					/*
					 * Computed Design Pattern — step 2:
					 * Cache miss. Compute the report by aggregating
					 * costs for this user inside the requested month.
					 */
					const startDate        = new Date(reportYear, reportMonth - 1, 1);
					const endDateExclusive = new Date(reportYear, reportMonth,     1);

					const userCosts = await Cost.find({
						userid: userId,
						createdAt: { $gte: startDate, $lt: endDateExclusive }
					}).sort({ createdAt: 1 });

					// Group costs by category, mapping each one to the
					// { sum, description, day } shape the spec requires.
					const grouped = buildEmptyCategoryMap();
					userCosts.forEach((c) => {
						if (grouped[c.category]) {
							grouped[c.category].push({
								sum:         c.sum,
								description: c.description,
								day:         new Date(c.createdAt).getDate()
							});
						}
					});

					// Materialize the `costs` array in the exact order
					// shown in the spec sample (one object per category,
					// each with a single key whose value is the list).
					const costsArray = CATEGORIES.map((cat) => ({
						[cat]: grouped[cat]
					}));

					payload = {
						userid: userId,
						year:   reportYear,
						month:  reportMonth,
						costs:  costsArray
					};

					/*
					 * Computed Design Pattern — step 3:
					 * Cache the report ONLY if the requested month has
					 * fully passed. The first day of the month AFTER
					 * the report month must be <= now.
					 */
					const now                = new Date();
					const firstDayOfNextMonth = new Date(reportYear, reportMonth, 1);
					const monthFullyPassed    = firstDayOfNextMonth <= now;

					if (monthFullyPassed) {
						await Report.create({
							userid: userId,
							year:   reportYear,
							month:  reportMonth,
							report: payload
						});
					}
				}
			}
		}
	} catch (err) {
		status = 500;
		payload = {
			id: 'REPORT_ERROR',
			message: err.message
		};
	}

	return res.status(status).json(payload);
});

module.exports = router;
