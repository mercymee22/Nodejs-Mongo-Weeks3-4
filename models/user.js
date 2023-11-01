const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const userSchema = new Schema - pass this constructor 2 objects as arguments
// default: false - by default when a new user document is created, the admin flag will be set to false.

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

// mongoose.model('User', userSchema) - Giving this model the name of user as the first argument, meaning the collection will automatically be named automatically be named users with a lowercase u, then we're giving it the schema to use for this model.
module.exports = mongoose.model('User', userSchema);