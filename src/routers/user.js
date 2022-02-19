const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')

// Loading the sendWelcomeEmail to send Welcome and Delete mail
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
//! We can add auth middleware to an individual route
// To add middleware to an individual route we pass it in as an argument to the method before we pass in our route handler
// We did it for reading all user end point


//! To create separate route files
// Express allows us to create separate route files by following
const router = new express.Router()

// Express provides us to methods for all of the http method like post, get, delete, patch 
// router.post('/users', (req, res)=>{
//     // To get data as part of the request is a two step process
//     // First we configure express to automatically parse the incoming json
//     // console.log(req.body) 
//     // res.send('Testing!')

//     // Instance
//     // It requires an object we want to set up
//     const user = new User(req.body)


//     // To save to the database
//     user.save()
//         .then(() =>{
//             res.status(201).send(user)
//         })
//         .catch((error)=>{
//             // When it comes to sending back error we also want to status code 
//             // https://httpstatuses.com/ to see all the status code
//             // We wanna set the response status to 400 before we send it to the database
//             // res.status(400)
//             // res.send(error)
//             res.status(400).send(error)
//         })
// })

// Converting it to the async await function
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        //! After the user is saved We will send a Welcome email.
        sendWelcomeEmail(user.email, user.name)

        const token = await user.generateAuthToken()
        res.status(201).send({user, token})

    } catch (e) {
        res.status(400).send(e)
    }

})

// Route for logging out
router.post('/users/logout', auth, async (req, res)=> {
    try{
        // Since we are authenticated, We already have the access to the user
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send('Logged out successfully!')
    }catch(e){
        res.status(500).send('Server Error')
    }
})

// Route for logging out from all sessions
router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()
        res.status(200).send('Logged out successfully from all devices!')   
    } catch (e) {
        res.status(500).send('Server Error!')
    }
})

// Routes for logging in 
router.post('/users/login', async (req, res) => {
    try{
        // findByCredentials() is a user built method that takes in email and password and try to find any user with that 
        // Credentials and return a user or nothing
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // res.send(user)
        // res.send({user, token})
        //! Hiding unnecessary data from user
        res.send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})
// Authorization
// Using JWT JSON web token
// We will send back a auth token while logging in
// The user will be able to use this token to send other request
//! Statics methods are available on models like User and methods are available on the instances like user 

// End point for reading all the users 
// Two end points for reading from the database
// One for all the reading all the items in the db
// One for a specific item by it's unique identifier in the db

// router.get('/users', auth, async (req, res) => {
//     // This method accepts arguments which is for search criteria
    
//     try {
//         const users = await User.find({})
//         res.status(200).send(users)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.get('/users/me', auth, async (req, res) => {
    res.status(200).send(req.user)
})


// End point for reading one user search by id findById() method
// Another end point for reading one user is by searching user other than id like name, email with findOne()
// Express gives us route parameters these are parts of url to capture dynamic values
// router.get('/users/:id', async (req, res) => {
//     // This gives us the value of :id using express route parameters
//     // console.log(req.params)
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)

//         if (!user) {
//             return res.status(404).send('User not found!')
//         }
//         res.status(201).send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// End points for updating data
// patch is designed for updating data
router.patch('/users/me', auth, async (req, res) => {
    // Doing all these to make sure no invalid operator is updated
    const updates = Object.keys(req.body)
    // console.log(updates)
    const allowedUpdates = ['name', 'age', 'email', 'password']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid Updates!'
        })
    }

    try {
        // ! Updating for middleware
        updates.forEach((update) => req.user[update] = req.body[update])
        
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// End point for deleting user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        
        // ! Sending Cancellation Email
        sendCancellationEmail(req.user.email, req.user.name)

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


// For test purposes, working with files
const upload = multer({
    // If we comment this, we are sending the file to the router to then save it to the db.
    // dest: 'avatar',
    // File validation, file size, and file type
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please provide a jpg, jpeg, or a png image'))
        }
        cb(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    
    const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer()


    // req.user.avatar = req.file.buffer
    req.user.avatar = buffer
    await req.user.save()  
    res.send({
        message: 'Avatar uploaded Successfully!'
    })
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

router.get('/users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error('Not found')
        }
        
        // We have to tell the user what type of image we are sending in this case we are sending a jpg image
        // By setting response header
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send(e)
    }
})

router.delete('/users/me/avatar', auth, async (req, res) =>{
        req.user.avatar = undefined
        await req.user.save()

        res.send({
            message: 'Avatar deleted successfully'
        })
})


module.exports = router