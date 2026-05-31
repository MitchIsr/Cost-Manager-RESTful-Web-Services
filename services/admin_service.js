require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const aboutRouter = require('../routes/about_route');
const connectDB = require('../models/db');
const requestLogger = require('../logger-actions/request_logger');

// Even though /api/about reads no database, the requestLogger
// writes to the logs collection on every request — so we need a connection.
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

// GET /api/about — developers team
app.use('/api/about', aboutRouter);

module.exports = app;
