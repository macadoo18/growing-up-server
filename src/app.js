require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');
const childrenRouter = require('./children/children-router');
const eatingRouter = require('./eating/eating-router');
const sleepingRouter = require('./sleeping/sleeping-router');
const fileUpload = require('express-fileupload');

const app = express();
app.use(express.json({ limit: '50mb', extended: true }));
app.use(fileUpload());

const morganOptions = NODE_ENV === 'production' ? 'tiny' : 'common';
const origin =
    NODE_ENV === 'production'
        ? 'https://growing-up-zeta.vercel.app'
        : 'http://localhost:7000';

app.use(morgan(morganOptions));
app.use('/uploads', express.static('uploads'));
app.use(cors());

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept'
//     );
//     res.setHeader(
//         'Access-Control-Aloow-Methods',
//         'GET, POST, PATCH, DELETE, OPTIONS, PUT'
//     );
//     next();
// });
app.use(helmet());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/children', childrenRouter);
app.use('/api/eating', eatingRouter);
app.use('/api/sleeping', sleepingRouter);

app.get('/', (req, res) => {
    res.send('The good stuff');
});

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } else {
        response = { message: error.message, error };
    }
    console.log(error);
    res.status(500).json(response);
});

module.exports = app;
