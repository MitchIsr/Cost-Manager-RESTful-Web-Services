const express = require('express');
const router = express.Router();

const Cost = require('../models/Cost');
const Report = require('../models/Report');

const CATEGORIES = ['food', 'health', 'housing', 'sports', 'education'];

function buildEmptyCategoryMap() {
	const map = {};
	CATEGORIES.forEach((c) => {
		map[c] = [];
	});
	return map;
}

// GET /api/report?id=123123&year=2026&month=1
router.get('/', async (req, res) => {
	let status = 200;
	let payload = null;

	try {
		const { id, year, month } = req.query;

		if (id === undefined || year === undefined || month === undefined) {
			status = 400;
			payload = {
				id: 'VALIDATION_ERROR',
				message: 'Missing required query parameters: id, year, month'
			};
		} else {
			const userId = parseInt(id, 10);
			const reportYear = parseInt(year, 10);
			const reportMonth = parseInt(month, 10);

			const invalidNumbers = Number.isNaN(userId) || Number.isNaN(reportYear) || Number.isNaN(reportMonth);
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
				 * Computed Design Pattern:
				 * 1) Try cache in reports collection.
				 * 2) If missing, compute from costs.
				 * 3) Cache only if requested month has fully passed.
				 */
				const cached = await Report.findOne({ userid: userId, year: reportYear, month: reportMonth });
				if (cached && cached.report) {
					payload = cached.report;
				} else {
					const startDate = new Date(reportYear, reportMonth - 1, 1);
					const endDateExclusive = new Date(reportYear, reportMonth, 1);

					const userCosts = await Cost.find({
						userid: userId,
						createdAt: { $gte: startDate, $lt: endDateExclusive }
					}).sort({ createdAt: 1 });

					const grouped = buildEmptyCategoryMap();
					userCosts.forEach((c) => {
						if (grouped[c.category]) {
							grouped[c.category].push({
								sum: c.sum,
								description: c.description,
								day: new Date(c.createdAt).getDate()
							});
						}
					});

					const costsArray = CATEGORIES.map((cat) => ({
						[cat]: grouped[cat]
					}));

					payload = {
						userid: userId,
						year: reportYear,
						month: reportMonth,
						costs: costsArray
					};

					const now = new Date();
					const firstDayOfNextMonth = new Date(reportYear, reportMonth, 1);
					const monthFullyPassed = firstDayOfNextMonth <= now;

					if (monthFullyPassed) {
						await Report.create({
							userid: userId,
							year: reportYear,
							month: reportMonth,
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

