const express = require('express');
const router = express.Router();

const Log = require('../models/Log');

// GET /api/logs
router.get('/', async (req, res) => {
	let status = 200;
	let payload = null;

	try
	{
		payload = await Log.find().sort({ timestamp: -1 });
	}
	catch (err) {
		status = 500;
		payload = {
			id: 'GET_LOGS_ERROR',
			message: err.message
		};
	}

	return res.status(status).json(payload);
});

module.exports = router;

