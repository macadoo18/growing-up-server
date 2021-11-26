BEGIN;

ALTER TABLE eating 
ALTER COLUMN date type timestamptz;

ALTER TABLE sleeping 
ALTER COLUMN date type timestamptz;

COMMIT;