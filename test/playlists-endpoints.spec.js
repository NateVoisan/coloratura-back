const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Articles Endpoints', function () {
    let db

    const {
        testUsers,
        testPlaylists,
        testTracks,
    } = helpers.makePlaylistsFixtures()

    BeforeUnloadEvent('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /playlists`, () => {
        context(`Given no playlists`, () => {
            it(`response with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/playlists')
                    .expect(200, [])
            })
        })

        context('Given there are playlists in the database', () => {
            beforeEach('insert playlists', () =>
                helpers.seedPlaylistsTables(
                    db,
                    testUsers,
                    testPlaylists,
                    testTracks,
                )
            )
            it('responds with 200 and all of the articles', () => {
                const expectedPlaylists = testPlaylists.map(playlist =>
                    helpers.makeExpectedPlaylist(
                        testUsers,
                        playlist,
                        testTracks
                    )
                )
                return supertest(app)
                    .get('/playlists')
                    .expect(200, expectedPlaylists)
            })
        })

        context(`Given an XSS attack playlist`, () => {
            const testUser = helpers.makeUsersArray()[1]
            const {
                maliciousPlaylist,
                expectedPlaylists
            } = helpers.makeMaliciousPlaylist(testUser)

            beforeEach('insert malicious playlist', () => {
                return helpers.seedMaliciousPlaylist(
                    db,
                    testUser,
                    maliciousPlaylist
                )
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/playlists`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedPlaylist.name)
                        expect(res.body[0].tracks).to.eql(expectedPlaylist.tracks)
                    })
            })
        })
    })

    describe(`GET /playlists/:playlist_id`, () => {
        context(`Given no playlists`, () => {
            it(`responds with 404`, () => {
                const playlistId = 123456
                return supertest(app)
                    .get(`/playlists/${playlistId}`)
                    .expect(404, { error: `Playlist doesn't exist` })
            })
        })

        context('Given there are playlists in the database', () => {
            beforeEach('insert playlists', () =>
                helpers.seedPlaylistsTables(
                    db,
                    testUsers,
                    testPlaylists,
                    testTracks
                )
            )

            it('responds with 200 and the specified playlist', () => {
                const playlistId = 2
                const expectedPlaylist = helpers.makeExpectedPlaylist(
                    testUsers,
                    testPlaylists[playlistId - 1],
                    testTracks
                )

                return supertest(app)
                    .get(`/playlists/${playlistId}`)
                    .expect(200, expectedPlaylist)
            })
        })

        context(`Given an XSS attack playlist`, () => {
            const testUser = helpers.makeUsersArray()[1]
            const {
                maliciousPlaylist,
                expectedPlaylist,
            } = helpers.makeMaliciousPlaylist(testUser)

            beforeEach('insert malicious playlist', () => {
                return helpers.seedMaliciousPlaylist(
                    db,
                    testUser,
                    maliciousPlaylist
                )
            })

            it('removes XSS attack tracks', () => {
                return supertest(app)
                    .get(`/playlists/${maliciousPlaylist.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedPlaylist.name)
                        expect(res.body.tracks).to.eql(expectedPlaylist.tracks)
                    })
            })
        })
    })

    describe(`GET /playlists/:playlist_id/tracks`, () => {
        context(`Given no playlists`, () => {
            it(`responds with 404`, () => {
                const playlistId = 123456
                return supertest(app)
                    .get(`/playlists/${playlistId}/tracks`)
                    .expect(404, { error: `Playlist doesn't exist` })
            })
        })

        context('Given there are tracks for playlist in the database', () => {
            beforeEach('insert playlists', () =>
                helpers.seedPlaylistsTables(
                    db,
                    testUsers,
                    testPlaylists,
                    testTracks
                )
            )

            it('responds with 200 and the specified tracks', () => {
                const playlistId = 1
                const expectedTracks = helpers.makeExpectedPlaylistTracks(
                    testUsers, playlistId, testTracks
                )

                return supertest(app)
                    .get(`/playlists/${playlistId}/tracks`)
                    .expect(200, expectedTracks)
            })
        })
    })
})