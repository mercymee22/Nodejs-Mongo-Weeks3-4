const cors = require('cors');

// indexOf method returns -1 if the item your looking for was not found.
// We're checking if the origin can be found in the whitelist, if it's not -1, then it was found. 
// origin: true - allows this request to be accepted.
// calling the callback at the end of the function, passing in null to say no error has occurred and giving it the corsOptions object.

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin')); //whatever is in the value of the request header, called Origin.
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

// exports.cors = cors() - exported function, calls the imported/required cors function that returns a middleware function configured to return a cors header for "access control allow origin" on a response object with a wild card value, which allows cors for all origins.
// exports.corsWithOptions = cors(corsOptionsDelegate) - calls the cors function again, give the corsOptionsDelegate function we created as it's argument. cors function returns a middleware function that checks if the incoming request belongs to one of the whitelisted origins, if it does it will send back the cors response header of "access control allow origin", with the whitelisted origin as it's value, otherwise it won't include the response at all. 
// for endpoints where we only want to accept cross-origin requests from one of these whitelisted origins, we'll apply corsWithOptions. For endpoints where we want to accept all cross-origin requests we'll use cors. We apply these to routes in campsiteRouter.js

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);