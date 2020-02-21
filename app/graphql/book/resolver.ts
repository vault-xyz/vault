const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        book(parent, { id }, ctx, info) {
            return db.findOne('books', { id });
        },
        books(parent, args, ctx, info) {
            return db.find('book', {});
        }
    },
    Mutation: {
        deleteBook: (parent, { id }, ctx, info) => db.delete(id),
        createBook: (parent, { data }, ctx, info) => createThing({ type: 'Book', data, ctx }),
        updateBook: (parent, { id, data }, ctx, info) => {}
    },
    Book: {}
};

module.exports = {
    resolver
};