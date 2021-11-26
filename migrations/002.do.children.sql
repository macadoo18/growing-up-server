CREATE TABLE children (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    age int NOT NULL,
    user_id INTEGER REFERENCES users(id)
);

