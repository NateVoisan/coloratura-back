const express = require('express')
const path = require('path')
const { requireAuth } = require('../middleware/jwt-auth')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

// Route used for getting the user id

usersRouter
    // .all(requireAuth)
    .get('/:id', (req, res, next) => {
        const userid = req.params.id
        UsersService.getUserById(req.app.get('db'), userid)
        .then(user => {
            return res.json(user)
        })
        .catch(next)
    })

// Route used for posting the user's username and password

usersRouter
    .post('/', jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body

        for (const field of ['user_name', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
        const passwordError = UsersService.validatePassword(password)

        if (passwordError)
                return res.status(400).json({ error: passwordError })
        
        UsersService.hasUserWithUserName(
            req.app.get('db'),
            user_name
        )
            .then(hasUserWithUserName => {
                if(hasUserWithUserName)
                    return res.status(400).json({ error: `Username already taken` })

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            user_name,
                            password: hashedPassword,
                        }
                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                        .then(user => {
                            res
                                .status(201)
                                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                .json(UsersService.serializeUser(user))
                        })
                    })
            })
            .catch(next)
    })

module.exports = usersRouter