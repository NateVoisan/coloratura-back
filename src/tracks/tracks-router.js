const express = require('express')
const path = require('path')
const TracksService = require('./tracks-service')
const { requireAuth } = require('../middleware/jwt-auth')

const tracksRouter = express.Router()
const jsonBodyParser = express.json()

tracksRouter
    .route('/')
    .get((req, res, next) => {
        res.send('pls gib tracks')
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { playlist_id, link } = req.body
        const newTrack = { playlist_id, link }

        for (const [key, value] of Object.entries(newTrack))
            if(value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        newTrack.user_id = req.user.user_id

        TracksService.insertTrack(
            req.app.get('db'),
            newTrack
        )
        .then(track => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${track.id}`))
                .json(TracksService.serializeTrack(track))
        })
        .catch(next)
    })

module.exports = tracksRouter