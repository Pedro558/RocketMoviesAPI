const express = require('express')
const routes = express.Router()

const usersRouter = require('./users.routes')

routes.use('/', usersRouter)

module.exports = routes