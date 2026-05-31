require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

// Service-local imports
const usersRouter = require('../routes/users');
const connectDB = require('../models/db');
const requestLogger = require('../logger-actions/request-logger');

// Each process owns its own Mongo connection.
// When this service is started as a standalone Node process
// (as the spec requires), nothing else will call connectDB() for it.
connectDB();

const app = express();

app.set('json spaces', 2);

// Body parsers and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Return JSON (not HTML) on bad request bodies
app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).json({ id: 'INVALID_JSON', message: 'Request body must be valid JSON' });
	}
	return next(err);
});

// Persist one log document per request (Pino + pino-mongodb stream)
app.use(requestLogger);

// The spec lists POST /api/add under "Adding User" as well —
// in the users microservice, /api/add must add a user.
app.use('/api/add', usersRouter);
app.use('/api/users', usersRouter);

module.exports = app;
