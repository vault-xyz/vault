const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        product(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('products', { _id });
        },
        products(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('products', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteProduct: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createProduct: (parent, { data }, ctx, info) => createThing({ type: 'Product', data, ctx }),
        updateProduct: (parent, { id, data }, ctx, info) => {}
    }
};

module.exports = {
    resolver
};