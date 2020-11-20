const express = require('express')
const PlaylistsService = require('./playlists-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')
const { getAllPlaylists } = require('./playlists-service')

const playlistsRouter = express.Router()

playlistsRouter.route('/:playlist_id')
    .all(requireAuth)
    .all(checkPlaylistExists)
    .get((req, res) => {
        console.log(req.params.playlist_id)
        res.json(PlaylistsService.serializePlaylist(res.playlist))
    })

playlistsRouter.route('/')
    .all(requireAuth)
    .get((req, res) => {
        PlaylistsService.getAllPlaylists(req.app.get('db'))
            .then(playlists => {
                res.json(playlists.map(PlaylistsService.serializePlaylist))
            })
    })

playlistsRouter.route('/create/new')
    .all(requireAuth)
    .post(express.json(), (req, res, next) => {
        const { name } = req.body
        const newPlaylist = { name }

        for (const [key, value] of Object.entries(newPlaylist))
            if(value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        newPlaylist.creator = req.user.id

        PlaylistsService.insertPlaylist(
            req.app.get('db'),
            newPlaylist
        )
        .then(play => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${play.id}`))
                .json(PlaylistsService.serializePlaylist(play))
        })
        .catch(next)
    })

playlistsRouter.route('/:playlist_id')
    .all(requireAuth)
    .all(checkPlaylistExists)
    .get((req, res, next) => {
        PlaylistsService.getTracksForPlaylist(
            req.app.get('db'),
            req.params.playlist_id
        )
            .then(tracks => {
                res.json(tracks.map(PlaylistsService.serializePlaylistTrack))
            })
            .catch(next)
    })

playlistsRouter.route('/')
    .get((req, res, next) => {
        PlaylistsService.getAllPlaylists(req.app.get('db'))
            .then(playlists => {
                res.json(playlists.map(PlaylistsService.serializePlaylist))
            })
            .catch(next)
    })

async function checkPlaylistExists(req, res, next) {
    try {
        const playlist = await PlaylistsService.getById(
            req.app.get('db'),
            req.params.playlist_id
        )
        if (!playlist)
            return res.status(404).json({
                error: `Playlist doesn't exist`
            })
        res.playlist = playlist
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = playlistsRouter