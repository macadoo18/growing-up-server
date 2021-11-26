const { expect } = require('chai');
const app = require('../src/app');
const supertest = require('supertest');

describe('App', () => {
    it('GET / responds with "The good stuff"', () => {
        return supertest(app).get('/').expect(200, 'The good stuff');
    });
});
