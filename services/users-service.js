require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const usersRouter = require('../routes/users');
const requestLogger = require('../LoggerActions/RequestLogger');

const app = express();
app.use(pinoHttp());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(requestLogger);

app.use('/api/users', usersRouter);

module.exports = app;