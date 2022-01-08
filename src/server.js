require('dotenv').config();
const knex = require('knex');
const app = require('./app');
const { PORT, TEST_DATABASE_URL, DATABASE_URL } = require('./config');

const db = knex({
    client: 'pg',
    connection:
        process.env.NODE_ENV === 'test' ? TEST_DATABASE_URL : DATABASE_URL
});

app.set('db', db);

app.listen(PORT, () => {
    console.log(`Server listening at port http://localhost:${PORT}`);
});
