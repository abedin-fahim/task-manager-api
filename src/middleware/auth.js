const jwt = require('jsonwebtoken')
const User = require('../models/user')
// Here we will set up and define the authentication middleware and load it inside the routers to put some of the routers 
// behind authentication

// The whole auth process starts with client taking that authentication token that they get from signing up/ logging in and
// Providing it with the request they are trying to perform
// We can provide additional info (key-value pair) to the server in the header option in postman as the part of the request
// And similarly server can return headers to the requester 
// We can access the header from


const auth = ( async (req, res, next) => {
    try {
        // We pass the name of the header we are trying to get access to 
        const token = req.header('Authorization').replace('Bearer ', '')
        // console.log(token)

        // Verifying the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        

        const user = await User.findOne( { _id: decoded._id, 'tokens.token': token }) 
        
        if(!user){
            throw new Error()
        }
    
        // Storing the token for route handler for later access
        req.token = token
        // Storing the user for route handler for later access 
        req.user = user
        next()
    
    } catch(e){
        res.status(401).send({error: 'Please authenticate!'})
    }
}) 

module.exports = auth