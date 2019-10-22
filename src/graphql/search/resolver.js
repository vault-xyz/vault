const { map, forEach } = require('p-iteration');
const { txi, __resolveType } = require('../../helpers');

const resolver = {
    Query: {
        async search(parent, { query }, ctx, info) {
            const documents = await ctx.db.find();
            await forEach(documents, async doc => {
                const index = `${doc._id}:${doc._collection}`;
                await txi.index(index, doc);
            });
            
            const searchResults = await txi.search(query);
            const results = await map(searchResults, async ({ id }) => {
                const [_id, collection] = id.split(':');
                const document = await ctx.db.findOne(collection, {
                    _id
                });

                return document;
            });

            return {
                result: results[0],
                results,
                searchResults,
                resultsFound: results.length
            };
        }
    },
    SearchResultType: {
        __resolveType
    }
};

module.exports = {
    resolver
};