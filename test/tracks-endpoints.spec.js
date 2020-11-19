const { expect } = require('chai')
const { it } = require('date-fns/locale')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Comments Endpoints', function () {
    let db

    const {
        testPlaylists,
        testUsers,
    } = helpers.makePlaylistsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.get('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /tracks`, () => {
        beforeEach('insert playlists', () =>
            helpers.seedPlaylistsTables(
                db,
                testUsers,
                testPlaylists,
            )
        );

        it(`creates a track, responding with 201 and the new track`, function() {
            this.retries(3)
            const testPlaylist = testPlaylists[0]
            const testUser = testUsers[0]
            const newTrack = {
                user_id: testUser.id,
                link: newTrack.link,
                title: newTrack.title,
                artist: newTrack.artist,
                playlist_id: testPlaylist.id
            }
            return supertest(app)
                .post('/tracks')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newTrack)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.link).to.eql(newTrack.link)
                    expect(res.body.playlist_id).to.eql(newTrack.playlist_id)
                    expect(res.body.user.id).to.eql(testUser.id)
                    expect(res.headers.location).to.eql(`/tracks/${res.body.id}`)
                })
                .expect(res =>
                    db
                        .from('coloratura_tracks')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.link).to.eql(newTrack.link)
                            expect(row.playlist_id).to.eql(newTrack.playlist_id)
                            expect(row.user_id).to.eql(testUser.id)
                        })
                )
        })

        const requiredFields = ['link', 'playlist_id']

        requiredFields.forEach(field => {
            const testPlaylist = testPlaylists[0]
            const testUser = testUsers[0]
            const newTrack = {
                link: 'Test new track',
                playlist_id: testPlaylist.id,
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newTrack[field]

                return supertest(app)
                    .post('/tracks')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(newTrack)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
            })
        })
    })
})