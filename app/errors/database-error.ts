const { createError } = require('apollo-errors');

export const DatabaseError = createError('DatabaseError', {
    message: 'Database Error'
});
