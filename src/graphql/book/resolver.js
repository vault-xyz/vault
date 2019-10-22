const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        book(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('books', { _id });
        },
        books(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('books', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteBook: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createBook: (parent, { data }, ctx, info) => createThing({ type: 'Book', data, ctx }),
        updateBook: (parent, { id, data }, ctx, info) => {}
    },
    Book: {}
};

module.exports = {
    resolver
};