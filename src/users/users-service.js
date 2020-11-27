const bcrypt = require('bcryptjs')
const xss = require('xss')

// Scripts used for interacting with the database regarding users

const UsersService = {
    hasUserWithUserName(db, user_name) {
        return db('coloratura_users')
            .where({ user_name })
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('coloratura_users')
            .returning('*')
            .then(([user]) => user)
    },
    getUserById(db, id) {
        return db
            .from('coloratura_users')
            .where('id', id)
            .first()
    },
    validatePassword(password) {
        if (password.length < 4) {
            return 'Password must be longer than 4 characters'
        }
        if (password.length > 16) {
            return 'Password must be less than 16 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            id: user.id,
            user_name: xss(user.user_name),
        }
    },
}

module.exports = UsersService