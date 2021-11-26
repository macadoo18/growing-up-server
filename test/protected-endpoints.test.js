const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./testHelpers');

describe('Protected endpoints', () => {
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
        return db.into('users').insert(testUsers);
    });

    const protectedGetEndpoints = [
        {
            name: 'GET /api/users',
            path: '/api/users',
        },
        {
            name: 'GET /api/children',
            path: '/api/children',
        },
        {
            name: 'GET /api/children/:childrenId',
            path: '/api/children/1',
        },
        {
            name: 'GET /api/eating/:mealId',
            path: '/api/eating/1',
        },
        {
            name: 'GET /api/eating/all/:childId',
            path: '/api/eating/all/1',
        },
        {
            name: 'GET /api/sleeping/:sleepId',
            path: '/api/sleeping/1',
        },
        {
            name: 'GET /api/sleeping/all/:childId',
            path: '/api/sleeping/all/1',
        },
    ];

    protectedGetEndpoints.forEach(endpoint => {
        it(`${endpoint.name} responds with 401 'Missing bearer token' when no bearer token`, () => {
            return supertest(app).get(endpoint.path).expect(401, {
                error: 'Missing bearer token',
            });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid JWT secret`, () => {
            const validUser = testUsers[0];
            const invalidSecret = 'bad-secret';
            return supertest(app)
                .get(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid sub in payload`, () => {
            const invalidUser = { username: 'nope', id: 1 };
            return supertest(app)
                .get(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(invalidUser))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
    });

    const protectedPostEndpoints = [
        {
            name: 'POST /api/children',
            path: '/api/children',
        },
        {
            name: 'POST /api/eating/all/:childId',
            path: '/api/eating/all/1',
        },
        {
            name: 'POST /api/sleeping/all/:childId',
            path: '/api/sleeping/all/1',
        },
    ];

    protectedPostEndpoints.forEach(endpoint => {
        it(`${endpoint.name} responds with 401 'Missing bearer token' when no bearer token`, () => {
            return supertest(app).post(endpoint.path).expect(401, {
                error: 'Missing bearer token',
            });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid JWT secret`, () => {
            const validUser = testUsers[0];
            const invalidSecret = 'bad-secret';
            return supertest(app)
                .post(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid sub in payload`, () => {
            const invalidUser = { username: 'nope', id: 1 };
            return supertest(app)
                .post(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(invalidUser))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
    });

    const protectedDeleteEndpoints = [
        {
            name: 'DELETE /api/children/:childrenId',
            path: '/api/children/1',
        },
        {
            name: 'DELETE /api/eating/:mealId',
            path: '/api/eating/1',
        },
        {
            name: 'DELETE /api/sleeping/:sleepId',
            path: '/api/sleeping/1',
        },
    ];

    protectedDeleteEndpoints.forEach(endpoint => {
        it(`${endpoint.name} responds with 401 'Missing bearer token' when no bearer token`, () => {
            return supertest(app).delete(endpoint.path).expect(401, {
                error: 'Missing bearer token',
            });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid JWT secret`, () => {
            const validUser = testUsers[0];
            const invalidSecret = 'bad-secret';
            return supertest(app)
                .delete(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid sub in payload`, () => {
            const invalidUser = { username: 'nope', id: 1 };
            return supertest(app)
                .delete(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(invalidUser))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
    });

    const protectedPatchEndpoints = [
        {
            name: 'PATCH /api/children/:childrenId',
            path: '/api/children/1',
        },
        {
            name: 'PATCH /api/eating/:mealId',
            path: '/api/eating/1',
        },
        {
            name: 'PATCH /api/sleeping/:sleepId',
            path: '/api/sleeping/1',
        },
    ];

    protectedPatchEndpoints.forEach(endpoint => {
        it(`${endpoint.name} responds with 401 'Missing bearer token' when no bearer token`, () => {
            return supertest(app).patch(endpoint.path).expect(401, {
                error: 'Missing bearer token',
            });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid JWT secret`, () => {
            const validUser = testUsers[0];
            const invalidSecret = 'bad-secret';
            return supertest(app)
                .patch(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
        it(`${endpoint.name} responds 401 'Unauthorized request' when invalid sub in payload`, () => {
            const invalidUser = { username: 'nope', id: 1 };
            return supertest(app)
                .patch(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(invalidUser))
                .expect(401, {
                    error: 'Unauthorized request',
                });
        });
    });
});
