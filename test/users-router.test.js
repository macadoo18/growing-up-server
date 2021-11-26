const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./testHelpers');
const bcrypt = require('bcryptjs');

describe('users-router endpoints', () => {
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
    beforeEach('clean the table', () => {
        return helpers.cleanAllTables(db);
    });

    it(`Given no users in the database, GET /api/users/ responds with 401 unauthorized`, () => {
        return supertest(app)
            .get(`/api/users/`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(401);
    });

    it('POST /api/users responds with 201 and creates the new user', () => {
        const newUser = {
            first_name: 'new',
            last_name: 'user',
            username: 'new_user',
            password: 'TThh^^555g',
        };
        return supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect(res => {
                expect(res.body).to.have.property('id');
                expect(res.body.first_name).to.eql(newUser.first_name);
                expect(res.body.last_name).to.eql(newUser.last_name);
                expect(res.body.username).to.eql(newUser.username);
                expect(res.body).to.not.have.property('password');
                expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
            })
            .expect(res =>
                db
                    .from('users')
                    .select('*')
                    .where({ id: res.body.id })
                    .first()
                    .then(row => {
                        expect(row.first_name).to.eql(newUser.first_name);
                        expect(row.last_name).to.eql(newUser.last_name);
                        expect(row.username).to.eql(newUser.username);

                        return bcrypt.compare(newUser.password, row.password);
                    })
                    .then(compareResult => {
                        expect(compareResult).to.be.true;
                    })
            );
    });

    const requiredFields = ['first_name', 'last_name', 'username', 'password'];
    requiredFields.forEach(field => {
        const reqNewUser = {
            first_name: 'new',
            last_name: 'user',
            username: 'new_user',
            password: 'TT33$$yyss',
        };
        it(`responds with 400 and an error when the '${field}' is missing`, () => {
            delete reqNewUser[field];
            return supertest(app)
                .post('/api/users')
                .send(reqNewUser)
                .expect(400, {
                    error: `Missing '${field}' in request body`,
                });
        });
    });

    it(`responds 400 'Password must be longer than 7 characters' when empty password`, () => {
        const userShortPass = {
            first_name: 'new',
            last_name: 'user',
            username: 'new_user',
            password: 't4$s',
        };
        return supertest(app).post('/api/users').send(userShortPass).expect(400, {
            error: `Password must be at least 8 characters`,
        });
    });
    it(`responds 400 'Password must be shorter than 72 characters' when empty password`, () => {
        const userLongPass = {
            first_name: 'new',
            last_name: 'user',
            username: 'new_user',
            password: '*'.repeat(73),
        };
        return supertest(app).post('/api/users').send(userLongPass).expect(400, {
            error: `Password must be less than 72 characters`,
        });
    });
    it(`responds 400 when password starts with a space`, () => {
        const userPassSpace = {
            first_name: 'new',
            last_name: 'user',
            username: 'new_user',
            password: ' ttTT5555555',
        };
        return supertest(app).post('/api/users').send(userPassSpace).expect(400, {
            error: `Password must not start with or end with spaces`,
        });
    });
    it(`responds 400 when password ends with a space`, () => {
        const userPassSpace = {
            first_name: 'new',
            last_name: 'user',
            username: 'new_user',
            password: 'ttTT5555555 ',
        };
        return supertest(app).post('/api/users').send(userPassSpace).expect(400, {
            error: `Password must not start with or end with spaces`,
        });
    });
    it(`responds 400 when password isn't complex`, () => {
        const userPassNotComplex = {
            first_name: 'new',
            last_name: 'user',
            username: 'new_user',
            password: 'tt5555555',
        };
        return supertest(app).post('/api/users').send(userPassNotComplex).expect(400, {
            error: `Password must include at least 1 uppercase, 1 lowercase, and 1 number`,
        });
    });

    context('Given users in the database', () => {
        beforeEach('insert users', () => {
            return helpers.seedUsers(db, testUsers);
        });

        it(`responds 400 when username is already taken`, () => {
            const duplicateUser = {
                first_name: 'new',
                last_name: 'user',
                username: testUsers[0].username,
                password: 'ttTT55555',
            };
            return supertest(app).post('/api/users').send(duplicateUser).expect(400, {
                error: `Username already taken`,
            });
        });

        it(`GET /api/users/ responds with 200 and the data for that user`, () => {
            const expectedUser = testUsers.filter(user => user.id == testUsers[0].id);
            return supertest(app)
                .get(`/api/users/`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.first_name).to.eql(expectedUser[0].first_name);
                    expect(res.body.last_name).to.eql(expectedUser[0].last_name);
                    expect(res.body.username).to.eql(expectedUser[0].username);
                });
        });
    
        context('Given an xss attack', () => {
            const { maliciousUser, expectedUser } = helpers.makeMaliciousUser();
            
            it(`GET /api/users/ removes xss content`, () => {
                const expectedUser = testUsers.filter(user => user.id == testUsers[0].id);
                return supertest(app)
                    .get(`/api/users/`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.first_name).to.eql(expectedUser[0].first_name);
                        expect(res.body.last_name).to.eql(expectedUser[0].last_name);
                        expect(res.body.username).to.eql(expectedUser[0].username);
                    });
            });

            it(`POST /api/users removes xss content`, () => {
                return supertest(app)
                    .post(`/api/users`)
                    .send(maliciousUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.first_name).to.eql(expectedUser.first_name);
                        expect(res.body.last_name).to.eql(expectedUser.last_name);
                        expect(res.body.username).to.eql(expectedUser.username);
                    });
            });
        });
    });
});

//write tests for .get req
