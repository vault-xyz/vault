import { createError } from 'apollo-errors';

export const AppError = createError('AppError', {
  message: 'Internal application error'
});