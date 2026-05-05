const express = require('express');
const router = express.Router();
const Cost = require('../models/Cost');
const categoriesConfig = require('../models/categories.json');
const allowedCategories = categoriesConfig.categories;
// POST /api/costs (and also /api/add because api.js maps /add to this router)
router.post('/', async (req, res) => {
	let status = 201;
	let payload = null;

	try {
		const {description, category, userid, sum} = req.body;

		const isMissingRequiredInput = !description || !category || !userid || sum === undefined;
		if (isMissingRequiredInput) {
			status = 400;
			payload = {
				     id: 'VALIDATION_ERROR',
				message: 'Missing required fields: description, category, userid, sum'
			};
		}
		else
		{
			const isValidCategory = allowedCategories.includes(category);
			if (!isValidCategory)
			{
				status = 400;
				payload = {
						 id: 'INVALID_CATEGORY',
					message: `category must be one of: ${allowedCategories.join(', ')}`
				};
			}
			else
			{
				const cost = await Cost.create({
					  description,
					  category,
					  userid,
					  sum,
					  createdAt: new Date()
				})

				payload = cost;
			}
		}
	}
	catch (err) {
		status = 400;
		payload = {
			id: 'ADD_COST_ERROR',
			message: err.message
		};
	}

	return res.status(status).json(payload);
});

module.exports = router;