const { default: expectCt } = require('helmet/dist/middlewares/expect-ct');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const PlaylistsService = require('../src/playlists/playlists-service');

describe('Playlist with Tracks Endpoint', function () {
    let db;

    function makePlaylistArray() {
        return [
            {
                id: 1,
                name: 'Jams',
                number_of_tracks: 4,
                creator: 2
            }
        ]
    };

    function makeUserArray() {
        return [
            {
                id: 1,
                user_name: 'testtheuserpls',
                password: '$2a$12$b97IexVtrakgBIcuEYOOyeKs504BbLAgJHeYfbUmdW4gMQOxOADQG'
            }
        ]
    };

    function makeTrackArray() {
        return [
            {
                id: 1,
                link: 'www.youtube.com',
                title: 'music title',
                artist: 'music artist',
                playlist_id: 1
            }
        ]
    }

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DATABASE_URL,
        });
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => {
        db.raw('TRUNCATE coloratura_playlists RESTART IDENTITY CASCADE;');
        db.raw('TRUNCATE coloratura_users RESTART IDENTITY CASCADE;');
        db.raw('TRUNCATE coloratura_tracks RESTART IDENTITY CASCADE;');
    });

    afterEach('cleanup', () => {
        db.raw('TRUNCATE coloratura_playlists RESTART IDENTITY CASCADE;');
        db.raw('TRUNCATE coloratura_users RESTART IDENTITY CASCADE;');
        db.raw('TRUNCATE coloratura_tracks RESTART IDENTITY CASCADE;');
    });

    context(`Given 'coloratura_playlists' has data`, () => {
        const testPlaylist = makePlaylistArray();
        const testUser = makeUserArray();
        const testTrack = makeTrackArray();
        let jwt = '';

        beforeEach('insert user', () => {
            return db.into('coloratura_users').insert(testUser);
        });

        beforeEach('insert playlist', () => {
            return db.into('coloratura_playlists').insert(testPlaylist);
        });

        beforeEach('insert tracks', () => {
            return db.into('coloratura_tracks').insert(testTrack);
        });

        beforeEach('signin and get jwt', () => {
            return supertest(app)
                .post('/auth/signin')
                .send({ user_name: 'testusertest', password: 'testusertestpw' })
                .set('Accept', 'application/json')
                .then(res => {
                    jwt = res.body.authToken
                })
        });

        it(`gets all tracks for a playlist form coloratura_playlists`, () => {
            return supertest(app)
                .get('/playlists/1')
                .set('Authorization', `Bearer ${jwt}`)
                .expect(res => {
                    expect(res.body.title).to.eql(testTrack[0].title);
                    expect(res.body).to.have.property('link');
                })
        })

        // it(`gets all tracks for a playlist from coloratura_playlists`, () => {
        //     return PlaylistsService.getTracksForPlaylist(db, 'Jams')
        //         .then(actual => {
        //             expectCt(actual).to.eql(
        //                 {
        //                     id: 1,
        //                     name: 'Jams',
        //                     number_of_tracks: 4,
        //                     creator: 1
        //                 }
        //             )
        //         })
        // })
    })
})