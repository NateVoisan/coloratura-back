const xss = require('xss')

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
                db.raw(
                    `json_strip_nulls(
                        row_to_json(
                            (SELECT tmp FROM (
                                SELECT
                                    usr.id,
                                    usr.user_name
                            ) tmp)
                        )
                    )AS "user"`
                )
            )
            .leftJoin(
                'coloratura_users AS usr',
                'trax.user_id',
                'usr.id',
            )
            .where('trax.id', id)
            .first()
    },
    insertTracks(db, newTrack) {
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
        const { user } = track
        return {
            id: track.id,
            link: xss(track.link),
            title: xss(track.title),
            artist: xss(track.artist),
            playlist_id: track.playlist_id,
            user: {
                id: user.id,
                user_name: user.user_name
            },
        }
    }
}

module.exports = TracksService