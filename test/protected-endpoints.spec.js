const { it } = require('date-fns/locale')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected endpoints', function () {
    let db

    const {
        testUsers,
        testPlaylists,
        testTracks
    } = helpers.makePlaylistsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    beforeEach('insert playlists', () =>
        helpers.seedPlaylistsTables(
            db,
            testUsers,
            testPlaylists,
            testTracks
        )
    )

    const protectedEndpoints = [
        {
            name: 'GET /playlists/:playlist_id',
            path: '/playlists/1',
            method: supertest(app).get
        },
        {
            name: 'GET /playlists/:playlist_id/tracks',
            path: '/playlists/1/tracks',
            method: supertest(app).get
        },
        {
            name: 'POST /tracks',
            path: '/tracks',
            method: supertest(app).post
        },
        {
            name: 'POST /auth/refresh',
            path: '/auth/refresh',
            method: supertest(app).post
        }
    ]

    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            it(`responds 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, { error: `Missing bearer token` })
            })

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0]
                const invalidSecret = 'bad-secret'
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = { user_name: 'user-not-existy', id: 1 }
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, { error: `Unauthorized request` })
            })
        })
    })
})