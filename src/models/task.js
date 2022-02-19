const mongoose = require('mongoose')

// Model
// There are two ways we can create the relation between the task and the user
// We can store the ids of the task
// Or individual task could store the ids of the user who created it
// And the second approach is the best way

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // Ids of the user who created it
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task