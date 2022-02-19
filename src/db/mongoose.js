const mongoose = require('mongoose')

// Connecting to the database
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    //! useNewUrlParser, and useCreateIndex are no longer supported options. Mongoose 6 always behaves as if they are true.
})