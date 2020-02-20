const { createError } = require('apollo-errors');

const DatabaseError = createError('DatabaseError', {
    message: 'Database Error'
});

module.exports = DatabaseError;