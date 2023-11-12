var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const passport = require('passport');
const config = require('./config');

var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');

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

// Redirecting any traffic coming to the insecure port so that it comes to the secure port.
// app.all - routing method that catches every type of request that comes into the server (ie: get, post, delete, etc).
// * - wildcard, catches every request to any path on our server.
// req.secure - in the middleware functions body, checking a property of the request object called secure. Secure is automatically set by express to true when the request is sent by https.

app.all('*', (req, res, next) => {
    if (req.secure) {
        return next();
    } else {
        console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
        res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
    }
});

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
// adding the routers and specifying the paths they handle.

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);

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