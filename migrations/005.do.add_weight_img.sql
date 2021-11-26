BEGIN;

ALTER TABLE children
    ADD COLUMN
        image TEXT;

ALTER TABLE children
    ADD COLUMN
        weight DECIMAL(5,2);

COMMIT;