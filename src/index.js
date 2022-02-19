// The starting point of our application
const express = require('express')
// We don't want to grab anything from the mongoose folder we are calling it to run the file and mongoose connects to the database
require('./db/mongoose')
// We don't need these since we changed our routes folder and not using them here
// const User = require('./models/user')
// const Task = require('./models/task')
const userRouter = require('./routers/user') 
const taskRouter = require('./routers/task')


const app = express()
// const port = process.env.PORT || 3000
// Bc we are using a env file, we are sorted for development environment
const port = process.env.PORT


// ! Exploring file uploading with multer
// const multer = require('multer')
// // The next we do is config multer, we may have to config multer multiple times in a single application
// // Sometimes we might want to accept just pdf, other times we might want to accept just images
// // We will create new instances of multer depending on the needs of our app

// const upload = multer({
//     // All config goes here
//     dest: 'Images',
//     // File validation, file size, and file type
//     limits: {
//         // In bytes 1mb ~~ 1million bytes 
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {

//         // if(!file.originalname.endsWith('.pdf')){
//         //     // If things doesn't go well
//         //     return cb(new Error('File must be PDF'))
//         // }

//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return cb(new Error('Please provide a doc or docx file'))
//         }

//         // If things did go well
//         cb(undefined, true)
//     }
// })
// // upload.single() is multer middleware
// // Takes in a name of the upload
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// },(error, req, res, next) => {
//     res.status(400).send({
//         error: error.message
//     })
// })

// Express middleware
// Middleware functions can do as much or as little is needs to 
// We pass in a function inside the express call
// This is the function that is going to run in between new request and route handler
// We can a lot of thing using this function
// We get access to request, response, and next 
// req, res both of them contains the same information that we would have for our route handler
// next is specific to registering middleware
//! It is best to use middleware in a separate file 
// We will use middleware to enable authentication
// app.use((req, res, next) => {
//     // console.log(req.method, req.path)
//     // We call the route handler to run, we simply call the next()
//     // next()
//     // Sometimes our middleware should stop the route handler from running for any reason
//     if(req.method === 'GET'){
//         return res.status(400).send('GET requests are disabled')
//     } 
//     next()
    
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site under maintenance. All requests are disabled')
// })

// Its is going to parse incoming json to an object
app.use(express.json())

// Registering router to use routes in other files
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log(`Server is up at port ${port}`)
})


// const bcrypt = require('bcryptjs')

// // We use bcryptjs npm which is a password-hashing function 
// const myFunction = async () => {
//     // Plain text password which user provides us
//     const password = 'spring4994'
//     // Hashed password which we will end up storing
//     // It takes two arguments. 
//     // First is the plain text password
//     // Second is the number of round we want to perform
//     // The number of round determines how many times the hashing algorithm is executed
//     // And a really good number is 8
//     const hashedPassword = await bcrypt.hash(password, 8)

//     console.log(password)
//     console.log(hashedPassword)

//     // To compare two password while logging in 
//     // First argument is the plain text password
//     // Second is hashed password
//     const isMatch = await bcrypt.compare(password, hashedPassword)
//     console.log(isMatch) 
// }

// myFunction()


// const jwt = require('jsonwebtoken')
// const practiceJWT = async () => {
//     // To create a jwt we use the sign method available on jwt
//     // return value of sign() is the token
//     // The token will be provided to the client to perform the available operations
//     // The sign method takes in two/three arguments 
//     // The first is an object, the data that is going to be embedded inside the token 
//     // The second is string which is a secret to sign the token
//     // For this we need a random series of character
//     const token =jwt.sign({ _id: 'abc123' }, 'thequickbrownfox', {
//         expiresIn: '30d'
//     })
//     // The token we end up getting is the token we give to the user
//     // This is our jwt
//     console.log(token)

//     // How to verify token
//     // verify() method takes in two arguments
//     // First one is the token
//     // Second one is the secret
//     // Verify is going to return the payload for the token if things go well and matches
//     // It will return an error if things didn't go well
//     const data = jwt.verify(token, 'thequickbrownfox')
//     console.log(data)

//     // We can expire the token after a while
//     // We provide a third argument in sign method
// }

// practiceJWT()

// const Task = require('./models/task')
// const User = require('./models/user')

// // Linking task with user 
// const main = async () => {
//     // const task = await Task.findById("617981ee123e3f83d1408295")
//     // await task.populate('owner')
//     // console.log(task.owner)
//     // In mongoose there is a way to set up the relationship between two models and it gives us few helper functions
//     // We add the ref property to the model and set the value to the other model, and we can fetch the entire the other model 

//     // Let's reverse it
//     const user = await User.findById('617980f3c9bb3d81e22283c4')
//     // user.task is not a valid property. We are going to create a virtual property
//     // We add the virtual property in the user model in Schema
//     // A virtual property is a actual data stored in the db, it is a relationship between two entities like between user and task 
//     await user.populate('tasks')
//     console.log(user.tasks)

// }   

// main()

