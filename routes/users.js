const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cost = require('../models/Cost');

// POST /api/users
router.post('/', async (req, res) => {
	let status = 201;
	let payload = null;

	try {
		const { id, first_name, last_name, birthday } = req.body;

		const missingRequired =
			id === undefined || id === null ||
			!first_name || !last_name || !birthday;

		if (missingRequired) {
			status = 400;
			payload = {
				id: 'VALIDATION_ERROR',
				message: 'Missing required fields: id, first_name, last_name, birthday'
			};
		} else if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
			status = 400;
			payload = {
				id: 'VALIDATION_ERROR',
				message: 'Field "id" must be a positive integer'
			};
		} else {
			const parsedBirthday = new Date(birthday);
			if (isNaN(parsedBirthday.getTime())) {
				status = 400;
				payload = {
					id: 'VALIDATION_ERROR',
					message: 'Field "birthday" must be a valid date'
				};
			} else {
				const user = await User.create({
					id: Number(id),
					first_name,
					last_name,
					birthday: parsedBirthday
				});

				payload = user;
			}
		}
	} catch (err) {
		if (err && err.code === 11000) {
			status = 409;
			payload = {
				id: 'USER_ALREADY_EXISTS',
				message: 'A user with this id already exists'
			};
		} else {
			status = 400;
			payload = {
				id: 'ADD_USER_ERROR',
				message: err.message
			};
		}
	}

	return res.status(status).json(payload);
});

// GET /api/users
router.get('/', async (req, res) => {
	let status = 200;
	let payload = null;

	try {
		payload = await User.find();
	} catch (err) {
		status = 500;
		payload = {
			id: 'GET_USERS_ERROR',
			message: err.message
		};
	}

	return res.status(status).json(payload);
});

// GET /api/users/:userId
router.get('/:userId', async (req, res) => {
	let status = 200;
	let payload = null;

	try {
		const userId = Number(req.params.userId);

		if (!Number.isInteger(userId)) {
			status = 400;
			payload = {
				id: 'VALIDATION_ERROR',
				message: 'User id must be an integer number'
			};
		} else {
			const user = await User.findOne({ id: userId }).lean();
			if (!user) {
				status = 404;
				payload = {
					id: 'USER_NOT_FOUND',
					message: 'User not found'
				};
			} else {
				const totalResult = await Cost.aggregate([
					{ $match: { userid: userId } },
					{ $group: { _id: null, total: { $sum: '$sum' } } }
				]);

				payload = {
					id: user.id,
					first_name: user.first_name,
					last_name: user.last_name,
					total: totalResult.length ? (totalResult[0].total || 0) : 0
				};
			}
		}
	} catch (err) {
		status = 500;
		payload = {
			id: 'GET_USER_ERROR',
			message: err.message
		};
	}

	return res.status(status).json(payload);
});

module.exports = router;
