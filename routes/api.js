const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const costsRouter = require('./costs');
const reportRouter = require('./report');
const aboutRouter = require('./about');
const logsRouter = require('./logs');

// All API routes consolidated under /api
router.use('/users', usersRouter);
router.use('/costs', costsRouter);
router.use('/add', costsRouter);

router.use('/report', reportRouter);
router.use('/about', aboutRouter);
router.use('/logs', logsRouter);


module.exports = router;