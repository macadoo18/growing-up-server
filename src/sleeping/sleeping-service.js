const xss = require('xss');

const SleepingServcie = {
    insertSleep(db, newSleep) {
        return db
            .insert(newSleep)
            .into('sleeping')
            .returning('*')
            .then((rows) => {
                return rows[0];
            });
    },
    getById(db, id) {
        return db.select('*').from('sleeping').where({ id }).first();
    },
    getByChildId(db, child_id) {
        return db.select('*').from('sleeping').where({ child_id });
    },
    deleteSleep(db, id) {
        return db.from('sleeping').where({ id }).delete();
    },
    updateSleep(db, id, endSleep) {
        return db.from('sleeping').where({ id }).update(endSleep);
    },
    serializeSleep(sleep) {
        return {
            id: sleep.id,
            date: sleep.date,
            notes: xss(sleep.notes),
            duration: sleep.duration,
            sleep_type: sleep.sleep_type,
            sleep_category: sleep.sleep_category,
            child_id: sleep.child_id
        };
    }
};

module.exports = SleepingServcie;
