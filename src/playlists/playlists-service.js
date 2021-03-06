const xss = require('xss');
const playlistsRouter = require('./playlists-router');

const PlaylistsService = {
    getAllPlaylists(db, creatorId) {
        return db
            .from('coloratura_playlists AS play')
            .select(
                'play.id',
                'play.name',
                'play.number_of_tracks',
                db.raw(
                    `json_strip_nulls(
                    json_build_object(
                        'id', usr.id,
                        'user_name', usr.user_name
                    )
                ) AS "creator"`
                ),
            )
            .leftJoin(
                'coloratura_tracks AS trax',
                'play.id',
                'trax.playlist_id',
            )
            .leftJoin(
                'coloratura_users AS usr',
                'play.creator',
                'usr.id',
            )
            .groupBy('play.id', 'usr.id')
            .where('play.creator', creatorId)
    },
    getPlaylist(db, id) {
        return db
            .select('*')
            .from('coloratura_playlists AS play')
            .where('play.id', id)
            .first()
    },
    getById(db, id) {
        return db
            .from('coloratura_playlists')
            .where('id', id)
            .first()
    },
    getTracksForPlaylist(db, playlist_id) {
        return db
            .from('coloratura_tracks AS trax')
            .where('trax.playlist_id', playlist_id)
    },
    insertPlaylist(db, newPlaylist) {
        return db
            .insert(newPlaylist)
            .into('coloratura_playlists')
            .returning('*')
            .then(([playlist]) => playlist)
            .then(playlist =>
                PlaylistsService.getById(db, playlist.id)    
            )
    },
    deletePlaylist(db, playlist_id) {
        return db
            .from('coloratura_playlists')
            .where('id', playlist_id)
            .del()
    },
    deleteTrack(db, trackId) {
        return db
            .from('coloratura_tracks')
            .where('id', trackId)
            .del()
    },
    serializePlaylist(playlist) {
        const { creator } = playlist
        return {
            id: playlist.id,
            name: xss(playlist.name),
            number_of_tracks: Number(playlist.number_of_tracks) || 0,
            creator: {
                id: creator.id,
                user_name: creator.user_name,
            },
        }
    },
    serializePlaylistTrack(track) {
        const { user } = track
        return {
            id: track.id,
            playlist_id: track.playlist_id,
            link: xss(track.link),
            title: xss(track.title),
            artist: xss(track.artist)
        }
    },
};

module.exports = PlaylistsService;