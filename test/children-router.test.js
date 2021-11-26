const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./testHelpers');

describe('children-router endpoints', () => {
    let db;
    let testUsers = helpers.makeTestUsers();
    let testChildren = helpers.makeTestChildren();

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

    context('Given there are children in the database', () => {
        beforeEach('insert children', () => {
            return db.into('children').insert(testChildren);
        });

        it(`GET /api/children responds with 200 and all of the children for that user`, () => {
            const expectedChildren = testChildren.filter(child => child.user_id == testUsers[0].id);
            return supertest(app)
                .get('/api/children')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0].first_name).to.eql(expectedChildren[0].first_name);
                    expect(res.body[0].age).to.eql(expectedChildren[0].age);
                    expect(res.body[0].image).to.eql(expectedChildren[0].image);
                    expect(res.body[0].weight).to.eql(expectedChildren[0].weight);
                    expect(res.body[0].user_id).to.eql(expectedChildren[0].user_id);
                    expect(res.body[1]).to.have.property('id');
                    expect(res.body[1].first_name).to.eql(expectedChildren[1].first_name);
                    expect(res.body[1].age).to.eql(expectedChildren[1].age);
                    expect(res.body[1].image).to.eql(expectedChildren[1].image);
                    expect(res.body[1].weight).to.eql(expectedChildren[1].weight);
                    expect(res.body[1].user_id).to.eql(expectedChildren[1].user_id);
                });
        });
        it('GET /api/children/:childrenId responds with 200 and requested child', () => {
            const child_id = 1;
            const expectedChild = testChildren[child_id - 1];
            return supertest(app)
                .get(`/api/children/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.first_name).to.eql(expectedChild.first_name);
                    expect(res.body.age).to.eql(expectedChild.age);
                    expect(res.body.image).to.eql(expectedChild.image);
                    expect(res.body.weight).to.eql(expectedChild.weight);
                    expect(res.body.user_id).to.eql(expectedChild.user_id);
                });
        });
        it('PATCH /api/children/:childrenId responds with 204, updates child', () => {
            const child_id = 1;
            const editedChild = {
                first_name: 'newchild',
                age: 5,
                user_id: testUsers[0].id,
                id: child_id,
                image: 'https://images.unsplash.com/photo-1557939574-a2cb399f443f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
                weight: '12.23'
            };
            const expectedChild = {
                ...testChildren[child_id - 1],
                id: child_id,
                first_name: 'newchild',
                age: 5,
                user_id: testUsers[0].id,
                image: 'https://images.unsplash.com/photo-1557939574-a2cb399f443f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
                weight: '12.23'
            };
            return supertest(app)
                .patch(`/api/children/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(editedChild)
                .expect(200)
                .then(res =>
                    supertest(app)
                        .get(`/api/children/${child_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedChild)
                );
        });
        it('PATCH /api/children/:childrenId responds with 204 when updating a subset of fields', () => {
            const child_id = 1;
            const editedChild = {
                first_name: 'newchild',
            };
            const expectedChild = {
                ...testChildren[child_id - 1],
                id: child_id,
                first_name: 'newchild',
            };
            return supertest(app)
                .patch(`/api/children/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(editedChild)
                .expect(200)
                .then(res =>
                    supertest(app)
                        .get(`/api/children/${child_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedChild)
                );
        });
        it('PATCH /api/children/:childrenId responds 400 when no required fields are given', () => {
            const child_id = 1;
            return supertest(app)
                .patch(`/api/children/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send({ childrenId: 1 })
                .expect(400, {
                    error: {
                        message: 'Request body must contain value to update',
                    },
                });
        });
        it('DELETE /api/children/:childrenId responds with 204 and removes the child', () => {
            const child_id = 2;
            return supertest(app)
                .delete(`/api/children/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204);
        });
    });

    context('Given no children in the database', () => {
        describe('/api/children', () => {
            it('DELETE /api/children/:childrenId responds with 404', () => {
                const child_id = 123;
                return supertest(app)
                    .delete(`/api/children/${child_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Child does not exist' },
                    });
            });
            it(`GET /api/children responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/children')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
            it('GET /api/children/:childrenId responds with 404', () => {
                const child_id = 123;
                return supertest(app)
                    .get(`/api/children/${child_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Child does not exist' },
                    });
            });
            it('PATCH /api/children/:childrenId responds with 404', () => {
                const child_id = 123;
                return supertest(app)
                    .patch(`/api/children/${child_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Child does not exist' },
                    });
            });
        });

        it('POST /api/children responds with 201 and the new child', () => {
            const newChild = {
                first_name: 'newchild',
                age: 5,
                user_id: testUsers[0].id,
                weight: '12.23'
            };
            return supertest(app)
                .post('/api/children')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newChild)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.first_name).to.eql(newChild.first_name);
                    expect(res.body.age).to.eql(newChild.age);
                    expect(res.body.weight).to.eql(newChild.weight);
                    expect(res.body.user_id).to.eql(newChild.user_id);
                    expect(res.headers.location).to.eql(`/api/children/${res.body.id}`);
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/children/${postRes.body.id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(postRes.body)
                );
        });

        const requiredFields = ['first_name', 'age'];
        requiredFields.forEach(field => {
            const reqNewChild = {
                first_name: 'newchild',
                age: 5,
                user_id: testUsers[0].id,
            };
            it(`responds with 400 and an error when the '${field}' is missing`, () => {
                delete reqNewChild[field];
                return supertest(app)
                    .post('/api/children')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(reqNewChild)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` },
                    });
            });
        });
    });

    context('Given an xss attack', () => {
        const { maliciousChild, expectedChild } = helpers.makeMaliciousChild();

        beforeEach('insert malicious child', () => {
            return db.into('children').insert(maliciousChild);
        });

        it(`GET /api/children removes xss content`, () => {
            return supertest(app)
                .get('/api/children')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body[0].first_name).to.eql(expectedChild.first_name);
                    expect(res.body[0].age).to.eql(expectedChild.age);
                });
        });
        it(`GET /api/children/:childrenId removes xss content`, () => {
            const child_id = 1;
            return supertest(app)
                .get(`/api/children/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body.first_name).to.eql(expectedChild.first_name);
                    expect(res.body.age).to.eql(expectedChild.age);
                });
        });
        it(`POST /api/children removes xss content`, () => {
            return supertest(app)
                .post(`/api/children`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(maliciousChild)
                .expect(201)
                .expect(res => {
                    expect(res.body.first_name).to.eql(expectedChild.first_name);
                    expect(res.body.age).to.eql(expectedChild.age);
                });
        });
    });
});
