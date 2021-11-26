BEGIN;

ALTER TABLE eating 
ALTER COLUMN date type timestamp;

ALTER TABLE sleeping 
ALTER COLUMN date type timestamp;

COMMIT;