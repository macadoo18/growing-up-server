const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./testHelpers');
const assert = require('assert');

describe('eating-router endpoints', () => {
    let db;
    let testUsers = helpers.makeTestUsers();
    let testChildren = helpers.makeTestChildren();
    let testMeals = helpers.makeTestMeals();

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
    beforeEach('insert children', () => {
        return db.into('children').insert(testChildren);
    });

    context('Given there are meals in the database', () => {
        beforeEach('insert meals', () => {
            return db.into('eating').insert(testMeals);
        });

        it(`GET /api/eating/all/childId responds with 200 and all of the meals for that child`, () => {
            const child_id = 1;
            const expectedmeals = testMeals.filter(meal => meal.child_id == child_id);
            return supertest(app)
                .get(`/api/eating/all/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    assert.strictEqual(res.body.length === 2, true);
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('date');
                    expect(res.body[0].notes).to.eql(expectedmeals[0].notes);
                    expect(res.body[0].duration).to.eql(expectedmeals[0].duration);
                    expect(res.body[0].food_type).to.eql(expectedmeals[0].food_type);
                    expect(res.body[0].side_fed).to.eql(expectedmeals[0].side_fed);
                    expect(res.body[0].child_id).to.eql(expectedmeals[0].child_id);
                    expect(res.body[1]).to.have.property('id');
                    expect(res.body[1]).to.have.property('date');
                    expect(res.body[1].notes).to.eql(expectedmeals[1].notes);
                    expect(res.body[1].duration).to.eql(expectedmeals[1].duration);
                    expect(res.body[1].food_type).to.eql(expectedmeals[1].food_type);
                    expect(res.body[1].side_fed).to.eql(expectedmeals[1].side_fed);
                    expect(res.body[1].child_id).to.eql(expectedmeals[1].child_id);
                });
        });
        it('GET /api/eating/:mealId responds with 200 and requested meal', () => {
            const meal_id = 1;
            const expectedMeal = testMeals[meal_id - 1];
            return supertest(app)
                .get(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(expectedMeal.notes);
                    expect(res.body.duration).to.eql(expectedMeal.duration);
                    expect(res.body.food_type).to.eql(expectedMeal.food_type);
                    expect(res.body.side_fed).to.eql(expectedMeal.side_fed);
                    expect(res.body.child_id).to.eql(expectedMeal.child_id);
                });
        });
        it('PATCH /api/eating/:mealId responds with 204, updates meal', () => {
            const meal_id = 1;
            const editedMeal = {
                notes: 'fussy',
                duration: '00:15:22',
                food_type: 'breast_fed',
                side_fed: 'left',
                child_id: 1,
            };
            return supertest(app)
                .patch(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(editedMeal)
                .expect(201)
                .then(res =>
                    supertest(app)
                        .get(`/api/eating/${meal_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(res => {
                            expect(res.body).to.have.property('id');
                            expect(res.body).to.have.property('date');
                            expect(res.body.notes).to.eql(editedMeal.notes);
                            expect(res.body.duration).to.eql(editedMeal.duration);
                            expect(res.body.food_type).to.eql(editedMeal.food_type);
                            expect(res.body.side_fed).to.eql(editedMeal.side_fed);
                            expect(res.body.child_id).to.eql(editedMeal.child_id);
                        })
                );
        });
        it('PATCH /api/eating/:mealId responds with 204 when updating a subset of fields', () => {
            const meal_id = 1;
            const editedMeal = {
                food_type: 'breast_fed',
            };
            const mealToChange = testMeals[meal_id - 1];
            return supertest(app)
                .patch(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(editedMeal)
                .expect(201)
                .then(res =>
                    supertest(app)
                        .get(`/api/eating/${meal_id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(res => {
                            expect(res.body).to.have.property('id');
                            expect(res.body).to.have.property('date');
                            expect(res.body.notes).to.eql(mealToChange.notes);
                            expect(res.body.duration).to.eql(mealToChange.duration);
                            expect(res.body.food_type).to.eql(editedMeal.food_type);
                            expect(res.body.side_fed).to.eql(mealToChange.side_fed);
                            expect(res.body.child_id).to.eql(mealToChange.child_id);
                        })
                );
        });
        it('PATCH /api/eating/:mealId responds 400 when no required fields are given', () => {
            const meal_id = 1;
            return supertest(app)
                .patch(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send({ childrenId: 1 })
                .expect(400, {
                    error: {
                        message: 'Request body must contain value to update',
                    },
                });
        });
        it('DELETE /api/eating/:mealId responds with 204 and removes the meal', () => {
            const meal_id = 2;
            return supertest(app)
                .delete(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204);
        });
    });

    context('Given no meals in the database', () => {
        describe('/api/eating', () => {
            it('DELETE /api/eating/:mealId responds with 404', () => {
                const meal_id = 1;
                return supertest(app)
                    .delete(`/api/eating/${meal_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Meal does not exist' },
                    });
            });
            it(`GET /api/eating/all responds with 200 and an empty list`, () => {
                const child_id = 1;
                return supertest(app)
                    .get(`/api/eating/all/${child_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
            it('GET /api/eating/:mealId responds with 404', () => {
                const meal_id = 1;
                return supertest(app)
                    .get(`/api/eating/${meal_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Meal does not exist' },
                    });
            });
            it('PATCH /api/eating/:mealId responds with 404', () => {
                const meal_id = 1;
                return supertest(app)
                    .patch(`/api/eating/${meal_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: 'Meal does not exist' },
                    });
            });
        });

        it('POST /api/eating/all responds with 201 and the new meal', () => {
            const child_id = 1;
            const newMeal = {
                notes: 'fussy',
                duration: '00:15:22',
                food_type: 'breast_fed',
                side_fed: 'left',
            };
            return supertest(app)
                .post(`/api/eating/all/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newMeal)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(newMeal.notes);
                    expect(res.body.duration).to.eql(newMeal.duration);
                    expect(res.body.food_type).to.eql(newMeal.food_type);
                    expect(res.body.side_fed).to.eql(newMeal.side_fed);
                    expect(res.body.child_id).to.eql(child_id);
                    expect(res.headers.location).to.eql(
                        `/api/eating/all/${child_id}/${res.body.id}`
                    );
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/eating/${postRes.body.id}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(postRes.body)
                );
        });

        const requiredFields = ['duration', 'food_type'];
        requiredFields.forEach(field => {
            const reqNewMeal = {
                duration: '00:56:33',
                food_type: 'bottle',
            };
            it(`responds with 400 and an error when the '${field}' is missing`, () => {
                delete reqNewMeal[field];
                const child_id = 1;
                return supertest(app)
                    .post(`/api/eating/all/${child_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(reqNewMeal)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` },
                    });
            });
        });
    });

    context('Given an xss attack', () => {
        const { maliciousMeal, expectedMeal } = helpers.makeMaliciousMeals();

        beforeEach('insert malicious meal', () => {
            return db.into('eating').insert(maliciousMeal);
        });

        it(`GET /api/eating/all/:childId removes xss content`, () => {
            return supertest(app)
                .get('/api/eating/all/1')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('date');
                    expect(res.body[0].notes).to.eql(expectedMeal.notes);
                    expect(res.body[0].duration).to.eql(expectedMeal.duration);
                    expect(res.body[0].food_type).to.eql(expectedMeal.food_type);
                    expect(res.body[0].side_fed).to.eql(expectedMeal.side_fed);
                    expect(res.body[0].child_id).to.eql(expectedMeal.child_id);
                });
        });
        it(`GET /api/eating/:mealId removes xss content`, () => {
            const meal_id = 1;
            return supertest(app)
                .get(`/api/eating/${meal_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(expectedMeal.notes);
                    expect(res.body.duration).to.eql(expectedMeal.duration);
                    expect(res.body.food_type).to.eql(expectedMeal.food_type);
                    expect(res.body.side_fed).to.eql(expectedMeal.side_fed);
                    expect(res.body.child_id).to.eql(expectedMeal.child_id);
                });
        });
        it(`POST /api/eating/all removes xss content`, () => {
            const child_id = 1;
            return supertest(app)
                .post(`/api/eating/all/${child_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(maliciousMeal)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('date');
                    expect(res.body.notes).to.eql(expectedMeal.notes);
                    expect(res.body.duration).to.eql(expectedMeal.duration);
                    expect(res.body.food_type).to.eql(expectedMeal.food_type);
                    expect(res.body.side_fed).to.eql(expectedMeal.side_fed);
                    expect(res.body.child_id).to.eql(expectedMeal.child_id);
                });
        });
    });
});
