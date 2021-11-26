const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./testHelpers');

describe('auth endpoints', () => {
    let db;
    let testUsers = helpers.makeTestUsers();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy(db));
    beforeEach('clean the table', () => helpers.cleanAllTables(db));

    beforeEach('insert users', () => {
        return helpers.seedUsers(db, testUsers);
    });

    describe('POST /api/auth/login', () => {
        const requiredFields = ['username', 'password'];

        requiredFields.forEach(field => {
            const loginAttemptBody = {
                username: testUsers[0].username,
                password: testUsers[0].password,
            };

            it(`responds 400 required error when '${field}' is missing`, () => {
                delete loginAttemptBody[field];

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttemptBody)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    });
            });
        });
        it(`responds 400 'invalid username or password' when bad username`, () => {
            const invalidUsername = { username: 'nope', password: 'good' };
            return supertest(app).post('/api/auth/login').send(invalidUsername).expect(400, {
                error: 'Incorrect username or password',
            });
        });
        it(`responds 400 'invalid username or password' when bad password`, () => {
            const invalidPass = {
                username: testUsers[0].username,
                password: 'bad',
            };
            return supertest(app).post('/api/auth/login').send(invalidPass).expect(400, {
                error: 'Incorrect username or password',
            });
        });

        it('responds 200 and JWT auth token using secret when valid credentials', function () {
            this.retries(3);

            const userValidCreds = {
                username: testUsers[0].username,
                password: testUsers[0].password,
            };

            const expectedToken = jwt.sign({ user_id: testUsers[0].id }, process.env.JWT_SECRET, {
                subject: testUsers[0].username,
                algorithm: 'HS256',
            });

            return supertest(app).post('/api/auth/login').send(userValidCreds).expect(200, {
                authToken: expectedToken,
            });
        });
    });
});
