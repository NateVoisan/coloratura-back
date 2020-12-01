const express = require('express');
const PlaylistsService = require('./playlists-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');
const { getAllPlaylists } = require('./playlists-service');

const playlistsRouter = express.Router();
const jsonParser = express.json();

playlistsRouter.route('/:playlist_id')
    .all(requireAuth)
    .all(checkPlaylistExists)
    .get((req, res, next) => {
        PlaylistsService.getPlaylist(req.app.get('db'), req.params.playlist_id)
            .then(data => {
                res.json(PlaylistsService.serializePlaylist(data))
            })
            .catch(next);
    });

playlistsRouter.route('/deleteplaylist/:playlist_id')
    .all(requireAuth)
    .all(checkPlaylistExists)
    .delete((req, res, next) => {
        PlaylistsService.deletePlaylist(req.app.get('db'), req.params.playlist_id)
            .then(data => {
                res.status(204).end()
            })
            .catch(next);
    });

playlistsRouter.route('/deletetrack/:trackId')
    .all(requireAuth)
    .delete((req, res, next) => {
        PlaylistsService.deleteTrack(req.app.get('db'), req.params.trackId)
            .then(data => {
                res.status(204).end()
            })
            .catch(next);
    });

playlistsRouter.route('/')
    .all(requireAuth)
    .get((req, res) => {
        PlaylistsService.getAllPlaylists(req.app.get('db'), req.user.id)
            .then(playlists => {console.log('this one is /')
                res.json(playlists.map(PlaylistsService.serializePlaylist))
            })
    });

playlistsRouter.route('/create/new')
    .all(requireAuth)
    .post(express.json(), (req, res, next) => {
        const { name } = req.body
        const newPlaylist = { name }

        for (const [key, value] of Object.entries(newPlaylist))
            if (value == null)
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
    });

playlistsRouter.route('/:playlist_id/tracks')
    .all(requireAuth)
    .all(checkPlaylistExists)
    .get((req, res, next) => {
        PlaylistsService.getTracksForPlaylist(
            req.app.get('db'),
            req.params.playlist_id
        )
        
            .then(tracks => {console.log('this one is /:playlist_id/tracks')
                res.json(tracks.map(PlaylistsService.serializePlaylistTrack))
            })
            .catch(next)
    });

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
    };
};

module.exports = playlistsRouter;