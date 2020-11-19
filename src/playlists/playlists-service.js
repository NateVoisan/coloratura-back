const xss = require('xss')
const playlistsRouter = require('./playlists-router')

const PlaylistsService = {
    getAllPlaylists(db) {
        return db
            .from('coloratura_playlists AS play')
            .select(
                'play.id',
                'play.name',
                'play.tracks',
                db.raw(`count(DISTINCT trax) AS number_of_tracks`),
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
            // .select(
            //     'trax.id',
            //     'trax.link',
            //     'trax.title',
            //     'trax.artist',
            // ),
            // db.raw(
            //     `json_strip_nulls(
            //         row_to_json(
            //             (SELECT tmp FROM (
            //                 SELECT
            //                     usr.id,
            //                     usr.user_name,
            //             ) tmp)
            //         )
            //     ) AS "user"`
            // )
            // .where('trax.playlist_id', playlist_id)
            // .leftJoin(
            //     'coloratura_users AS usr',
            //     'usr.id'
            // )
            // .groupBy('trax.id', 'usr.id')
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
}

module.exports = PlaylistsService