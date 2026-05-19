require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const aboutRouter = require('../routes/about');
const connectDB = require('../models/db');

const app = express();

connectDB();

app.use(pinoHttp());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/about', aboutRouter);

module.exports = app;

