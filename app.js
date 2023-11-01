var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// express-session - Express.js middleware that provides session management capabilities. A session is a way to store and manage user - specific data across multiple HTTP requests.
// ('session-file-store')(session) - Session store implementation that allows you to store session data in the server's file system.Useful when you want to persist session data between server restarts or share session data across multiple instances of your application.
// ('session-file-store')(session) - require function is invoking session-file-store as an argument and the require function is returning another function as it's return value, then we're immediately calling that return function with this second parameter list of session.

const session = require('express-session');
const FilesStore = require('session-file-store')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

//require mongoose
const mongoose = require('mongoose');

//url to mongodb server
const url = 'mongodb://localhost:27017/nucmapsite';

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

// store: new FilesStore - creates a new FileStore as an object we can use to save our session info to the servers hard disk instead of just the running application memory

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FilesStore()
}));

// custom middleware function for authentication
// This function, like all express middleware functions, must have the request and response objects as parameters.
// The session middleware automatically adds a property called session to the request message.
// req.headers.authorization - grab just the authorization header out of the request headers
// new Error - The `Error` constructor is a built-in JavaScript function that can be used to create new `Error` objects. Has additional properties that can be used.
// err.status = 401 - standard error code when credentials have not been provided.
// return next(err) - pass the error message to express to handle sending the error message and authentication request back to the client.
// res.cookie('user', 'admin', {signed: true}) - res.cookie is part of express's response objects api, use it to set up a new cookie. 1st argument - user is the name of the cookie(in the signed cookie object). 2nd argument - admin - a value to store in the name property. 3rd argument(optional), an object that contains configuration values here letting express know to use the secret key from cookie parser to create a signed cookie.
// req.session.user = 'authenticated' - authenticated is the value we set for this object in the userRouter, when a user logged in.
// app.use(auth) - using Express's `app.use()` function to add the `auth` function as a middleware in the request handling pipeline of your application

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
    console.log(req.session);

    if (!req.session.user) {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
    } else {
        if (req.session.user === 'admin') {
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
    }
}

app.use(auth);
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

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;