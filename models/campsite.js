const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//loads the new currency type into mongoose so it's available for mongoose schemas to use
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

// const commentSchema - used for documents storing comments about a campsite.
// const campsiteSchema = new Schema - instantiates a new object called campsiteSchema. First argument - object that contains the schema definitions. Second optional argument - used for setting various configuration options.
// timestamps: true - adds 2 properties to the schema, created at and updated at. Mongoose will manage these properties for us.
// comments: [commentSchema] - adding a schema as a subdocument inside the campsite schema
// type: mongoose.Schema.Types.ObjectId - instead of storing a string with an author name, we're storing a reference to a user document through the user documents object id
// ref: 'User' - hold the name of the model for that document which is User.

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

// this creates a model named campsites.  Mongoose will automatically look for the lower case, plural version of whatever we put in this first argument to use as the name of the collection.
// 2nd argument - the schema we want to use for this collection. This model will be used to instantiate documents for mongoDB.
// mongoose.model method returns a constructor function. A constructor function is a special type of function used to create and initialize objects. Constructor functions are a way to define a blueprint for creating multiple objects with similar properties and methods. When you create an object using a constructor function, you are said to be creating an instance of that function, and this instance inherits the properties and methods defined within the constructor.
// To create an object using a constructor function, you use the new keyword followed by the constructor function's name
// 

const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;