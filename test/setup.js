require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');

process.env.TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/growing_up_test';

global.expect = expect;
global.supertest = supertest;
