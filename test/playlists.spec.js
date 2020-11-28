const knex = require('knex');
const app = require('../src/app');
const config = require('../src/config');
const supertest = require('supertest');
const PlaylsistsService = require('../src/playlists/playlists-service');

describe(`GET /playlists/:playlist_id`, () => {

    function makePlaylistArray() {
        return [
            {
                id: 1,
                name: 'Jams',
                number_of_tracks: 4,
                creator: 1
            }
        ]
    }

    describe(`GET /playlsits/:playlist_id`, () => {
        let db;

        before('make knex instance', () => {
            db = knex({
                client: 'pg',
                connection: process.env.DATABASE_URL
            });
            app.set('db', db)
        });

        after('disconnect form db', () => db.destroy());

        before('clean the table', () =>
            db.raw('TRUNCATE coloratura_playlists RESTART IDENTITY CASCADE;')
        );

        afterEach('cleanup', () =>
            db.raw('TRUNCATE coloratura_playlists RESTART IDENTITY CASCADE;')
        );

        context('Given there are playlists in the database', () => {
            const testPlaylist = makePlaylistArray();

            beforeEach('insert playlists', () => {
                return db.into('coloratura_playlists').insert(testPlaylist)
            });

            it('responds with 200 and all of the playlists', () => {
                return supertest(app)
                    .get('/playlists/')
                    .set('Authorization', `Bearerr ${process.env.authToken}`)
                    .expect(res => {
                        expect(res.body[0].playlist).to.eql(testPlaylist[0].playlist);
                        expect(res.body[0]).to.have.property('id');
                    })
            })
        })
    })
})