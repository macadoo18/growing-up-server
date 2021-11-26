BEGIN;

ALTER TABLE eating 
DROP CONSTRAINT child_id,
ADD CONSTRAINT eating_child_id_fkey FOREIGN KEY (child_id) REFERENCES children(id);

ALTER TABLE sleeping 
DROP CONSTRAINT child_id,
ADD CONSTRAINT sleeping_child_id_fkey FOREIGN KEY (child_id) REFERENCES children(id);

COMMIT;