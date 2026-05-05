const express = require('express');
const router = express.Router();

const teamMembers = require('../models/TeamMembers.json');

// GET /api/about
router.get('/', (req, res) => {
	let status = 200;
	let payload;

	try {
		payload = teamMembers.teamMembers;
	} catch (err) {
		status = 500;
		payload = {
			id: 'ABOUT_ERROR',
			message: err.message
		};
	}

	return res.status(status).json(payload);
});

module.exports = router;