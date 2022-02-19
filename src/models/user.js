const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

// We want to enable timestamps to our db. Two new fields will be added to each data. One created at and the other is updated at
// To do that we provide a new and second argument which is also an object to the userSchema at the bottom
const userSchema = new mongoose.Schema({
    name: {
        // configure everything about the object from validation to custom validation to type
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        //* Mongoose options: trim cuts any trailing spaces and lowercase coverts any uppercase to lowercase
        trim: true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please provide a valid Email!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        // Didn't work
        // min: 6,
        trim: true,
        validate(pass){
            if(pass.length <= 6){
                throw new Error('Minimum length of password is 6')
            }
            if(pass == 'password' || pass.trim() === 'password' || pass.toLowerCase() === 'password'){
                throw new Error('Please set a strong password!')
            }
        }
    },
    age: {
        type: Number,
        // If we don't provide an age we will use 0, 
        default: 0, 
        //* Custom validation 
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    // By default this option is set to false,
    // Now anytime we create a new user they will be created with those new fields
    timestamps: true
})

// Virtual Property
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
})

// We are accessing methods from the user
userSchema.methods.generateAuthToken = async function() {
    const user = this
    // Generating jwt token
    const token = jwt.sign({ _id: user._id.toString()  }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// By setting up a method or property on schema.statics we can directly access in model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user) {
        throw new Error('Unable to login!')
    } 

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login!')
    }

    return user
}

//todo Hashing the plain text password before saving
//! Mongoose supports whats known as middleware
// Middleware is a way to customize your mongoose model
// It is going to allow us to register functions to run before or after given events occur
// We are using mongoose schema which mongoose does it for us behind the seance anyway
// This is going to allow us to use middleware
// We are going to use a method on schema
// userSchema.pre
// userSchema.post

userSchema.pre('save', async function(next) {
    // this refers to the document that's being saved
    // this.
    // A good practice is to do this
    const user = this
    // console.log('just before saving')
    
    // This condition will be true both when creating a user and updating user's password
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    //! We call the next argument when are done with the operation
    next()  
})

// Delete tasks before deleting the user
userSchema.pre('remove', async function(next){
    const user = this

    await Task.deleteMany({
        owner: user._id
    })
    

    next()
})

// Defining a basic model
const User = mongoose.model('User', userSchema)

module.exports = User   