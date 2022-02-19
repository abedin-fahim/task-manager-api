const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')

const router = new express.Router()


// Post end point for the task
// Creating resources

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        // The owner id is going to be the data we are going to use to link task with user
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// End points for reading all tasks
//! now adding optional data option to the route for the user to get only completed or incomplete data from the db
// GET/tasks?completed=true 
// GET/tasks?completed=false 
//! Pagination
// Here skip allows us to iterate over result
// If we set to 10 we skip the first page and go to page 2
// GET/tasks?limit=10&skip=0
// ! Sorting
// GET/tasks?sortBy=createdAt_asc
// GET/tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
    
    const match = {}
    const sort = {}

    

    if(req.query.completed){
        match.completed= req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id })
        // await req.user.populate('tasks')
        await req.user.populate({
            path: 'tasks',
            // ! new option for data filtering
            match,
            //! New property for limiting and skipping data used for pagination and sorting
            options: {
                // If limit is not provided or it's not a number it's going to be ignored by mongoose
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
                // sort: {
                //     // Asc order
                //     // createdAt: 1,
                //     // Desc order
                //     // createdAt: -1
                //     completed: 1
                // }
            }
        })
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(400).send(e)
    }
})

// End points for reading a specific task from the db
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })

        if (!task) {
            return res.status(404).send('Task not found!')
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// End points for Updating Task
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const _body = req.body

    // to avoid invalid updates
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid Update request'
        })
    }

    try {
        //! Updating for middleware
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })

        if (!task) {
            return res.status(400).send('Task Not Found!')
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        // const task = await Task.findByIdAndUpdate(_id, _body, {
        //     new: true,
        //     runValidators: true
        // })

        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const task = await Task.findByIdAndDelete(_id)
        const task = await Task.findOneAndDelete({
            _id,
            owner: req.user._id,
        })

        if (!task) {
            return res.status(404).send({
                error: 'Task not found!'
            })
        }
        res.send('Task deleted successfully!')
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router