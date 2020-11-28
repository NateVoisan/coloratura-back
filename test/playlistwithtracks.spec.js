const { default: expectCt } = require('helmet/dist/middlewares/expect-ct');
const knex = require('knex');
const app = require('../src/app');
const PlaylistsService = require('../src/playlists/playlists-service');

describe('Playlist with Tracks Endpoint', function () {
    let db;
    let testPwT = [
        {
            id: 1,
            name: 'Jams',
            number_of_tracks: 4,
            creator: 1,
        }
    ];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DATABASE_URL,
        });
        app.set('db', db)
    });

    before('clean up tables before', () => db.raw('TRUNCATE TABLE coloratura_playlists RESTART IDENTITY CASCADE;'));
    afterEach('cleanup', () => db.raw('TRUNCATE TABLE coloratura_playlists RESTART IDENTITY CASCADE;'));
    after('disconnect from db', () => db.destroy());

    context(`Given 'coloratura_playlists' has data`, () => {
        before(() => {
            return db
                .into('coloratura_playlists')
                .insert(testPwT)
        });
        it(`gets all tracks for a playlist from coloratura_playlists`, () => {
            return PlaylistsService.getTracksForPlaylist(db, 'Jams')
                .then(actual => {
                    expectCt(actual).to.eql(
                        {
                            id: 1,
                            name: 'Jams',
                            number_of_tracks: 4,
                            creator: 1
                        }
                    )
                })
        })
    })
})