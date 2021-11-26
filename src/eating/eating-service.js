const xss = require('xss');

const EatingService = {
    insertMeal(db, newMeal) {
        return db
            .insert(newMeal)
            .into('eating')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    getById(db, id) {
        return db.from('eating').select('*').where({ id }).first();
    },
    getByChildId(db, child_id) {
        return db.select('*').from('eating').where({ child_id });
    },
    deleteMeal(db, id) {
        return db.from('eating').where({ id }).delete();
    },
    updateMeal(db, id, endMeal) {
        return db.from('eating').where({ id }).update(endMeal);
    },
    serializeMeal(meal) {
        return {
            id: meal.id,
            date: meal.date,
            notes: xss(meal.notes),
            duration: meal.duration,
            food_type: meal.food_type,
            side_fed: xss(meal.side_fed),
            child_id: meal.child_id,
        };
    },
};

module.exports = EatingService;
