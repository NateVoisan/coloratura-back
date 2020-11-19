function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'test-user-1',
            password: 'password'
        },
        {
            id: 2,
            user_name: 'test-user-2',
            password: 'password'
        },
        {
            id: 3,
            user_name: 'test-user-3',
            password: 'password'
        }
    ]
}

function makePlaylistsArray(users) {
    return [
        {
            id: 1,
            name: 'Groovy Jams',
            number_of_tracks: 4,
            creator: users[0].id
        },
        {
            id: 2,
            name: 'Speed Beats',
            number_of_tracks: 2,
            creator: users[1].id
        }
    ]
}

function makeTracksArray(users, playlists) {
    return [
        {
            id: 1,
            link: 'www.youtube.com',
            title: 'Hey Jude',
            artist: 'Beatles',
            playlist_id: 1
        },
        {
            id: 2,
            link: 'www.soundcloud.com',
            title: 'Iron Man',
            artist: 'Black Sabbath',
            playlist_id: 2
        }
    ]
}

function makeExpectedPlaylist(users, playlist, tracks = []) {
    const creator = users
        .find(user => user.id === playlist.creator)

    const number_of_tracks = tracks
        .filter(track => track.playlist_id === playlist.id)
        .length

    return {
        id: playlist.id,
        name: playlist.name,
        number_of_tracks: playlist.number_of_tracks,
        creator: playlist.creator,
        date_created: playlist.date_created.toISOString(),
        creator: {
            id: creator.id,
            user_name: creator.user_name,
            date_created: creator.date_created.toISOString()
        }
    }
}

function makeExpectedPlaylistTracks(users, playlistId, tracks) {
    const expectedTracks = tracks
        .filter(track => track.playlist_id === playlistId)

    return expectedTracks.map(track => {
        const trackUser = users.find(user => user.id === track.user_id)
        return {
            id: track.id,
            link: track.link,
            title: track.title,
            artist: track.artist,
            playlist_id: track.playlist_id,
            user: {
                id: trackUser.id,
                user_name: trackUser.user_name,
                date_created: trackUser.date_created.toISOString()
            }
        }
    })
}

function makeMaliciousPlaylist(user) {
    const maliciousPlaylist = {
        id: 911,
        name: 'something',
        number_of_tracks: 'four',
        creator: user.id,
        date_created: new Date()
    }
    const expectedPlaylist = {
        ...makeExpectedPlaylist([user], maliciousPlaylist),
        name: 'not good not good'
    }
    return {
        maliciousPlaylist,
        expectedPlaylist,
    }
}

function makePlaylistsFixtures() {
    const testUsers = makeUsersArray()
    const testPlaylists = makePlaylistsArray(testUsers)
    const testTracks = makeTracksArray(testUsers, testPlaylists)
    return { testUsers, testPlaylists, testTracks }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                coloratura_playlists,
                coloratura_users,
                coloratura_tracks`
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE coloratura_playlists_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE coloratura_users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE coloratura_tracks_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('coloratura_playlists_id_seq', 0)`),
                    trx.raw(`SELECT setval('coloratura_users_id_seq', 0)`),
                    trx.raw(`SELECT setval('coloratura_tracks_id_seq', 0)`),
                ])
            )
    )
}

function seedPlaylistsTables(db, users, playlists, tracks = []) {
    return db.transaction(async trx => {
        await trx.into('coloratura_users').insert(users)
        await trx.into('coloratura_playlists').insert(playlists)
        await Promise.all([
            trx.raw(`SELECT setval('coloratura_users_id_seq', ?)`,
                [users[users.length - 1].id]),
            trx.raw(`SELECT setval('coloratura_playlists_id_seq', ?)`,
                [playlists[playlists.length - 1].id]),
        ])
        if (tracks.length) {
            await trx.into('coloratura_tracks').insert(tracks)
            await trx.raw(`SELECT setval('coloratura_tracks_id_seq', ?)`,
                [tracks[tracks.length - 1].id])
        }
    })
}

function seedMaliciousPlaylist(db, user, playlist) {
    return db
        .into('coloratura_users')
        .insert([user])
        .then(() =>
            db
                .into('coloratura_playlists')
                .insert([playlist])
        )
}

module.exports = {
    makeUsersArray,
    makePlaylistsArray,
    makeExpectedPlaylist,
    makeExpectedPlaylistTracks,
    makeMaliciousPlaylist,
    makeTracksArray,
    makePlaylistsFixtures,
    cleanTables,
    seedPlaylistsTables,
    seedMaliciousPlaylist
}