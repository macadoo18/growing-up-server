const xss = require('xss');
const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[\S]+/;

const UsersService = {
    hasUserWithUsername(db, username) {
        return db('users')
            .where({ username })
            .first()
            .then(user => user);
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => user);
    },
    validatePassword(password) {
        if (password.length < 7) {
            return 'Password must be at least 8 characters';
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters';
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start with or end with spaces';
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must include at least 1 uppercase, 1 lowercase, and 1 number';
        }
    },
    hashPassword(password) {
        return bcrypt.hash(password, 8);
    },
    serializeUser(user) {
        return {
            id: user.id,
            username: xss(user.username),
            first_name: xss(user.first_name),
            last_name: xss(user.last_name),
        };
    },
};

module.exports = UsersService;
