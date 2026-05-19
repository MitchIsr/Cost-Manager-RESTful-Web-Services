require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const costsRouter = require('../routes/costs');
const reportRouter = require('../routes/report');
const connectDB = require('../models/db');
const requestLogger = require('../LoggerActions/RequestLogger');

// One Mongo connection per process
connectDB();

const app = express();

// Body parsers and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// JSON parse-error handler (return JSON instead of HTML)
app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).json({ id: 'INVALID_JSON', message: 'Request body must be valid JSON' });
	}
	return next(err);
});

// Request logging (Pino + Mongo)
app.use(requestLogger);

// POST /api/add — add cost (per spec)
// GET  /api/report — Computed Design Pattern report
app.use('/api/add', costsRouter);
app.use('/api/report', reportRouter);

module.exports = app;
