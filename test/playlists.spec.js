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
                creator: 2
            }
        ]
    };

    function makeUserArray() {
        return [
            {
                id: 2,
                user_name: 'testusertest',
                password: '$2a$12$4NY47Y1BNH8KuWlMNRzFUOhOn578wlcdgRm1bq9eEcdnVi/Mg1yd.'
            }
        ]
    };

    // {
    //     "id": 2,
    //     "user_name": "testusertest",
    //     "password": "testusertestpw"
    // }

    // 2
    // testusertest
    // $2a$12$4NY47Y1BNH8KuWlMNRzFUOhOn578wlcdgRm1bq9eEcdnVi/Mg1yd.
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJpYXQiOjE2MDY3NzI2NTIsImV4cCI6MTYwNjc4MzQ1Miwic3ViIjoidGVzdHVzZXJ0ZXN0In0.fukMypzH72zLorU34rtZUT37vaBJxBqVeX3SyeulCu8

    describe(`GET /playlists/:playlist_id`, () => {
        let db;

        before('make knex instance', () => {
            db = knex({
                client: 'pg',
                connection: process.env.DATABASE_URL
            });
            app.set('db', db)
        });

        after('disconnect from db', () => db.destroy());

        before('clean the table', () => {
            db.raw('TRUNCATE coloratura_playlists RESTART IDENTITY CASCADE;');
            db.raw('TRUNCATE coloratura_users RESTART IDENTITY CASCADE;');
        });

        afterEach('cleanup', () => {
            db.raw('TRUNCATE coloratura_playlists RESTART IDENTITY CASCADE;');
            db.raw('TRUNCATE coloratura_users RESTART IDENTITY CASCADE;');
        });

        context('Given there are playlists in the database', () => {
            const testPlaylist = makePlaylistArray();
            const testUser = makeUserArray();
            let jwt = '';

            beforeEach('insert user', () => {
                return db.into('coloratura_users').insert(testUser);
            });

            beforeEach('insert playlists', () => {
                return db.into('coloratura_playlists').insert(testPlaylist);
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

            it('responds with 200 and a single playlist', () => {
                return supertest(app)
                    .get('/playlists/1')
                    .set('Authorization', `Bearer ${jwt}`)
                    .expect(res => {
                        expect(res.body.name).to.eql(testPlaylist[0].name);
                        expect(res.body).to.have.property('id');
                    })
            })
        })
    })
})