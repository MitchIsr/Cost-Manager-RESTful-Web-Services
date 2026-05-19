require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const indexRouter = require('./routes/index');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());

// If JSON parsing fails, Express throws a SyntaxError before routes are reached.
// For /api requests, return a JSON error payload (not an HTML error page).
app.use('/api', (err, req, res, next) => {
  const isJsonParseError = err instanceof SyntaxError && err.status === 400 && 'body' in err;
  if (isJsonParseError) {
    return res.status(400).json({ id: 'INVALID_JSON', message: 'Request body must be valid JSON' });
  }
  return next(err);
});

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
