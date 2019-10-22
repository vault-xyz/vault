const { createThing, getAllPeople } = require('../../helpers');

const resolver = {
    Query: {
        show(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('shows', { _id });
        },
        shows(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('shows', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteShow: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createShow: (parent, { data }, ctx, info) => createThing({ type: 'Show', data, ctx }),
        updateShow: (parent, { id, data }, ctx, info) => {}
    },
    Show: {
        actors: getAllPeople('actors'),
        directors: getAllPeople('directors'),
        episodes: (parent, args, ctx, info) => (parent.episodes || []).map(id => ctx.db.findOne('episodes', { id })),
        seasons: (parent, args, ctx, info) => (parent.seasons || []).map(id => ctx.db.findOne('seasons', { id }))
    },
    CreativeWorkSeason: {
        episodes: (parent, args, ctx, info) => (parent.episodes || []).map(id => ctx.db.findOne('episodes', { id })),
    },
    Episode: {
        partOfSeason: (parent, args, ctx, info) => ctx.db.findOne('seasons', { id: parent.partOfSeason })
    }
};

module.exports = {
    resolver
};