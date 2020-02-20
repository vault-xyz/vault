const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        product(parent, { id }, ctx, info) {
            return db.findOne('products', { id });
        },
        products(parent, args, ctx, info) {
            return db.find('products', {});
        }
    },
    Mutation: {
        deleteProduct: (parent, { id }, ctx, info) => db.delete(id),
        createProduct: (parent, { data }, ctx, info) => createThing({ type: 'Product', data, ctx }),
        updateProduct: (parent, { id, data }, ctx, info) => {}
    }
};

module.exports = {
    resolver
};