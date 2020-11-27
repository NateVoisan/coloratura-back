const xss = require('xss')

// SQL scripts used for track related tasks with the database

const TracksService = {
    getById(db, id) {
        return db
            .from('coloratura_tracks AS trax')
            .select(
                'trax.id',
                'trax.link',
                'trax.playlist_id',
                'trax.title',
                'trax.artist',
            )
            .where('trax.id', id)
            .first()
    },
    insertTrack(db, newTrack) {
        return db
            .insert(newTrack)
            .into('coloratura_tracks')
            .returning('*')
            .then(([track]) => track)
            .then(track =>
                TracksService.getById(db, track.id)
            )
    },
    serializeTrack(track) {
        return {
            id: track.id,
            link: xss(track.link),
            title: xss(track.title),
            artist: xss(track.artist),
            playlist_id: track.playlist_id,
        }
    }
}

module.exports = TracksService