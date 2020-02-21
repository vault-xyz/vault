import { db } from '../../db';

export const resolver = {
    Query: {
        book(parent, { id }, ctx, info) {
            return db.findById('books', id);
        },
        books(parent, args, ctx, info) {
            return db.find('book');
        }
    },
    Mutation: {
        deleteBook: (parent, { id }, ctx, info) => { },
        createBook: (parent, { data }, ctx, info) => { },
        updateBook: (parent, { id, data }, ctx, info) => { }
    },
    Book: {}
};
