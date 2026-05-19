/*
 * About route — GET /api/about
 * ----------------------------
 * Returns the team members (first_name + last_name only).
 * Per spec, the team-member data is NOT stored in the database — that
 * way the submission database can stay empty except for the single
 * imaginary user. The data is read from models/TeamMembers.json, which
 * is bundled with the source code.
 */

const express = require('express');
const router = express.Router();

const teamMembers = require('../models/TeamMembers.json');

// GET /api/about
router.get('/', (req, res) => {
	let status = 200;
	let payload;

	try {
		// The spec requires only first_name + last_name and nothing else.
		// We map defensively in case the JSON file ever gains extra fields.
		payload = teamMembers.TeamMembers.map((m) => ({
			first_name: m.first_name,
			last_name:  m.last_name
		}));
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
