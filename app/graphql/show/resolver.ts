import { db } from '../../db';

const resolver = {
    Query: {
        show(parent, { id }, ctx, info) {
            return db.findById('show', id);
        },
        shows(parent, args, ctx, info) {
            return db.find('show');
        }
    },
    Mutation: {
        deleteShow: (parent, { id }, ctx, info) => { },
        createShow: (parent, { data }, ctx, info) => { },
        updateShow: (parent, { id, data }, ctx, info) => { }
    },
    Show: {
        actors: { },
        directors: { },
        episodes: (parent, args, ctx, info) => (parent.episodes || []).map(id => db.findById('episodes', id)),
        seasons: (parent, args, ctx, info) => (parent.seasons || []).map(id => db.findById('seasons', id))
    },
    CreativeWorkSeason: {
        episodes: (parent, args, ctx, info) => (parent.episodes || []).map(id => db.findById('episodes', id)),
    },
    Episode: {
        partOfSeason: (parent, args, ctx, info) => db.findById('seasons', parent.partOfSeason)
    }
};

module.exports = {
    resolver
};