const express = require('express');
const router = express.Router();
const Cost = require('../models/Cost');
const User = require('../models/User');
const categoriesConfig = require('../models/categories.json');
const allowedCategories = categoriesConfig.categories;

router.post('/', async (req, res) => {
	try {
		const { description, category, userid, sum } = req.body;

		const userExists = await User.findOne({ id: userid });

		if (!userExists) {
			return res.status(404).json({
				id: 'USER_NOT_FOUND',
				message: `User with id ${userid} does not exist`
			});
		}

		if (typeof sum !== 'number' || sum <= 0) {
			return res.status(400).json({
				id: 'INVALID_SUM',
				message: 'Sum must be a positive number'
			});
		}

		const cost = await Cost.create({
			description,
			category,
			userid,
			sum,
			createdAt: new Date()
		});

		return res.status(201).json(cost);

	} catch (err) {
		return res.status(400).json({
			id: 'ADD_COST_ERROR',
			message: err.message
		});
	}
});

module.exports = router;

