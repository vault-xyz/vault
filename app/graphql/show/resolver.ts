const { createThing, getAllPeople } = require('../../helpers');

const resolver = {
    Query: {
        show(parent, { id }, ctx, info) {
            return db.findOne('show', { id });
        },
        shows(parent, args, ctx, info) {
            return db.find('show', {});
        }
    },
    Mutation: {
        deleteShow: (parent, { id }, ctx, info) => db.delete(id),
        createShow: (parent, { data }, ctx, info) => createThing({ type: 'Show', data, ctx }),
        updateShow: (parent, { id, data }, ctx, info) => {}
    },
    Show: {
        actors: getAllPeople('actors'),
        directors: getAllPeople('directors'),
        episodes: (parent, args, ctx, info) => (parent.episodes || []).map(id => db.findOne('episodes', { id })),
        seasons: (parent, args, ctx, info) => (parent.seasons || []).map(id => db.findOne('seasons', { id }))
    },
    CreativeWorkSeason: {
        episodes: (parent, args, ctx, info) => (parent.episodes || []).map(id => db.findOne('episodes', { id })),
    },
    Episode: {
        partOfSeason: (parent, args, ctx, info) => db.findOne('seasons', { id: parent.partOfSeason })
    }
};

module.exports = {
    resolver
};