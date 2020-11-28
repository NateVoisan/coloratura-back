const { default: expectCt } = require('helmet/dist/middlewares/expect-ct');
const knex = require('knex')
const app = require('../src/app')
const AuthService = require('../src/auth/auth-service')

describe('Auth Endpoints', function () {
    let db;
    let testUser = [
        {
            id: 1,
            user_name: 'testuser01',
            password: 'testuser01'
        }
    ];

    before('male knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DATABASE_URL
        });
        app.set('db', db);
    });

    before('clean the tables before', () => db.raw('TRUNCATE TABLE coloratura_users, coloratura_playlists, coloratura_tracks RESTART IDENTITY CASCADE;'));
    afterEach('cleanup', () => db.raw('TRUNCATE TABLE coloratura_users, coloratura_playlists, coloratura_tracks RESTART IDENTITY CASCADE;'));
    after('disconnect from db', () => db.destroy());

    context(`Given 'users' has data`, () => {
        before(() => {
            return db
                .into('coloratura_users')
                .insert(testUser)
        });
        it(`get user`, () => {
            return AuthService.getUserWithUserName(db, 'testuser01')
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        user_name: 'testuser01',
                        password: 'testuser01'
                    })
                })
        })
    })
})