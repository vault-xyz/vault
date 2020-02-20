const { createError } = require('apollo-errors');

const AppError = createError('AppError', {
  message: 'Internal application error'
});

module.exports = AppError;