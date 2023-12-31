var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cors = require("cors");

const cookieSession = require("cookie-session");

const compression = require('compression');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var CartsRouter = require('./routes/payment');

var ProductRouter = require('./routes/product');

var adminRouter = require('./routes/admin');

var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression({
  level: 6,
  threshold: 1000,
  memLevel: 8,
  filter: (req, res) => {
      if (req.header['x-no-compression']) {
          return false
      }
      return compression.filter(req, res)
  },
}))

app.use(
  cookieSession({
    name: "lazada-session",
    keys: ["COOKIE_SECRET"],
    httpOnly: true,
    sameSite: 'strict'
  })
);

//Setting Up Router

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/carts', CartsRouter);
app.use('/product', ProductRouter);
app.use('/admin', adminRouter);


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
