BEGIN;

CREATE TYPE food_category AS ENUM (
    'bottle',
    'breast_fed',
    'formula'
);

CREATE TABLE eating (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL DEFAULT now(),
    notes TEXT,
    duration time NOT NULL,
    food_type food_category,
    side_fed TEXT,
    child_id INTEGER REFERENCES children(id)
);

COMMIT;