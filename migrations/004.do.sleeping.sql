BEGIN;

CREATE TYPE sleeping_types AS ENUM (
    'crying',
    'restless',
    'calm'
);

CREATE TYPE sleep_opts AS ENUM (
    'nap',
    'bedtime'
);

CREATE TABLE sleeping (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL DEFAULT now(),
    notes TEXT,
    duration time NOT NULL,
    sleep_type sleeping_types,
    sleep_category sleep_opts,
    child_id INTEGER REFERENCES children(id)
);

COMMIT;