/*
 * Users router
 * ------------
 * This single router handles three endpoints required by the spec:
 *   POST /api/add        — add a new user
 *   GET  /api/users      — list all users
 *   GET  /api/users/:id  — details of one user, including total costs
 *
 * It is mounted twice by the users microservice (services/users-service.js):
 *   app.use('/api/add',   usersRouter)   // for "Adding User"
 *   app.use('/api/users', usersRouter)   // for "List of Users" + details
 *
 * Both mount points share the same router because the spec lists
 * /api/add for adding a user (under "Adding User"); the users
 * microservice owns that route in the 4-process deployment.
 */

const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Cost = require('../models/Cost');

// POST  (mounted under /api/add and /api/users)
// Adds a new user. Required body: id, first_name, last_name, birthday.
router.post('/', async (req, res) => {
	let status = 201;
	let payload = null;

	try {
		const { id, first_name, last_name, birthday } = req.body;

		// Missing-field validation. id===0 is treated as missing too
		// since the schema requires a positive integer.
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
			// id must be a positive integer
			status = 400;
			payload = {
				id: 'VALIDATION_ERROR',
				message: 'Field "id" must be a positive integer'
			};
		} else {
			// Validate that birthday is a parseable date
			const parsedBirthday = new Date(birthday);
			if (isNaN(parsedBirthday.getTime())) {
				status = 400;
				payload = {
					id: 'VALIDATION_ERROR',
					message: 'Field "birthday" must be a valid date'
				};
			} else {
				// All input validated — create the user
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
		// MongoDB duplicate key — same `id` already exists
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

// GET  (mounted under /api/users)
// Returns all users using the property names from the users collection.
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

// GET /:userId  (mounted under /api/users)
// Returns { id, first_name, last_name, total } for the given user.
router.get('/:userId', async (req, res) => {
	let status = 200;
	let payload = null;

	try {
		// userId arrives as a string from the URL — coerce to number
		const userId = Number(req.params.userId);

		if (!Number.isInteger(userId)) {
			status = 400;
			payload = {
				id: 'VALIDATION_ERROR',
				message: 'User id must be an integer number'
			};
		} else {
			// Fetch the user document
			const user = await User.findOne({ id: userId }).lean();
			if (!user) {
				status = 404;
				payload = {
					id: 'USER_NOT_FOUND',
					message: 'User not found'
				};
			} else {
				// Aggregate the sum of all costs belonging to this user.
				// Using $sum over $sum keeps the math in the DB rather
				// than streaming every cost document back to Node.
				const totalResult = await Cost.aggregate([
					{ $match: { userid: userId } },
					{ $group: { _id: null, total: { $sum: '$sum' } } }
				]);

				payload = {
					id:         user.id,
					first_name: user.first_name,
					last_name:  user.last_name,
					total:      totalResult.length ? (totalResult[0].total || 0) : 0
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
