const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// const userSchema = new Schema
// default: false - by default when a new user document is created, the admin flag will be set to false.
// passportLocalMongoose - This plugin handles adding username and password fields to the document, along with hashing and salting the password.

const userSchema = new Schema({
     admin: {
        type: Boolean,
        default: false
    }
});

// use method plugin on the userSchema with an argument to plugin the plugin. This plugin provides us with additonal authentication methods such as the authenticate method.
userSchema.plugin(passportLocalMongoose);

// mongoose.model('User', userSchema) - Giving this model the name of user as the first argument, meaning the collection will automatically be named automatically be named users with a lowercase u, then we're giving it the schema to use for this model.
module.exports = mongoose.model('User', userSchema);