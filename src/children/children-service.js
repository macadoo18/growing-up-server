const xss = require('xss');

const ChildrenService = {
    insertChildren(db, newChildren) {
        return db
            .insert(newChildren)
            .into('children')
            .returning('*')
            .then(([children]) => children);
    },
    getById(db, id) {
        return db.from('children').select('*').where({ id }).first();
    },
    getByUserId(db, user_id) {
        return db.select('*').from('children').where({ user_id });
    },
    deleteChildren(db, id) {
        return db.from('children').where({ id }).delete();
    },
    updateChildren(db, id, children) {
        return db.from('children').where({ id }).update(children);
    },
    serializeChildren(children) {
        return {
            id: children.id,
            first_name: xss(children.first_name),
            age: children.age,
            user_id: children.user_id,
            image: xss(children.image),
            weight: children.weight
        };
    }
};

module.exports = ChildrenService;
