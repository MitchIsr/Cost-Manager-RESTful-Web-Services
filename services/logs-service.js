require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const logsRouter = require('../routes/logs');
const connectDB = require('../models/db');
const requestLogger = require('../logger-actions/request-logger');

// Logs service reads the logs collection — needs its own DB connection
connectDB();

const app = express();

app.set('json spaces', 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).json({ id: 'INVALID_JSON', message: 'Request body must be valid JSON' });
	}
	return next(err);
});

app.use(requestLogger);

// GET /api/logs — list all logs
app.use('/api/logs', logsRouter);

module.exports = app;
