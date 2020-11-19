const knex = require('knex')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { it } = require('date-fns/locale')

describe('Auth Endpoints', function () {
    let db

    const { testUsers } = helpers.makePlaylistsFixtures()
    const testUser = testUsers[0]

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /auth/signin`, () => {
        beforeEach('insert users', () =>
            helpers.seedUsers(
                db,
                testUser
            )
        )

        const requiredFields = ['user_name', 'password']

        requiredFields.forEach(field => {
            const signinAttemptBody = {
                user_name: testUser.user_name,
                password: testUser.password
            }

            it(`responds with 400 required error when '${field}' is missing`, () => {
                delete signinAttemptBody[field]

                return supertest(app)
                    .post('/auth/signin')
                    .send(signinAttemptBody)
                    .expect(400, {
                        error: `Missing '${field}' in request body`
                    })
            })
        })

        it(`responds 400 'invalid user_name or password' when bad user_name`, () => {
            const userInvalidUser = { user_name: 'user-not', password: 'existy' }
            return supertest(app)
                .post('/auth/signin')
                .send(userInvalidUser)
                .expect(400, { error: `Incorrect user_name or password` })
        })

        it(`responds 400 'invalid user_name or password' when bad password`, () => {
            const userInvalidPass = { user_name: testUser.user_name, password: 'incorrect' }
            return supertest(app)
                .post('/auth/signin')
                .send(userInvalidPass)
                .expect(400, { error: `Incorrect user_name or password` })
        })

        it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
            const userValidCreds = {
                user_name: testUser.user_name,
                password: testUser.password
            }
            const expectedToken = jwt.sign(
                { user_id: testUser.id },
                process.env.JWT_SECRET,
                {
                    subject: testUser.user_name,
                    expiresIn: process.env.JWT_EXPIRY,
                    algorithm: 'HS256'
                }
            )
            return supertest(app)
                .post('/auth/signin')
                .send(userValidCreds)
                .expect(200, {
                    authToken: expectedToken
                })
        })
    })

    describe(`POST /auth/refresh`, () => {
        beforeEach('insert users', () =>
            helpers.seedUsers(
                db,
                testUsers
            )
        )

        it(`responds 200 and JWT auth token using secret`, () => {
            const expectedToken = jwt.sign(
                { user_id: testUser.id },
                process.env.JWT_SECRET,
                {
                    subject: testUser.user_name,
                    expiresIn: process.env.JWT_EXPIRY,
                    algorithm: 'HS256'
                }
            )
            return supertest(app)
                .post('/auth/refresh')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200, {
                    authToken: expectedToken
                })
        })
    })
})