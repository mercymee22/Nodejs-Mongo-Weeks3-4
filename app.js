var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const passport = require('passport');
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

//require mongoose
const mongoose = require('mongoose');

//url to mongodb server, set up config.js
const url = config.mongoUrl;

//connect to mongoose
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//handles the promise returned from the connect method
connect.then(() => console.log('Connected correctly to server'),
    err => console.log(err)
);
var app = express();
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// these are only necessary if using session based authentication
app.use(passport.initialize());

// custom middleware function for authentication
// This function, like all express middleware functions, must have the request and response objects as parameters.
// The session middleware automatically adds a property called session to the request message.

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log(err); //Added for debugging

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;