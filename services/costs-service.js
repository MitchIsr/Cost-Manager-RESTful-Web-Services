require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const costsRouter = require('../routes/costs');
const reportRouter = require('../routes/report');
const connectDB = require('../models/db');
const requestLogger = require('../LoggerActions/RequestLogger');

const app = express();

connectDB();

app.use(pinoHttp());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(requestLogger);

app.use('/api/costs', costsRouter);
app.use('/api/add', costsRouter);
app.use('/api/report', reportRouter);

module.exports = app;