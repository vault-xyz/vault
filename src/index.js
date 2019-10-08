const fs = require('fs');
const path = require('path');
const { GraphQLServer, Options } = require('graphql-yoga');
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { formatError } = require('apollo-errors');
const GraphQLJSON = require('graphql-type-json');
const GraphQLLong = require('graphql-type-long');
const { GraphQLDateTime } = require('graphql-iso-date');
const Database = require('somewhere');
const fromEntries = require('fromentries');
const typeDefs = fs.readFileSync(path.join(__dirname, './types.graphql'), 'utf8');
const genMockData = require('./gen-mock-data');
const AppError = require('./errors/app-error');

const log = console;
if (process.env.NODE_ENV !== 'development') {
  log.debug = () => {};
}

const createThing = ({
  type,
  data,
  ctx
}) => {
  const id = (new Date()).getTime();

  ctx.db.set(id, {
    id,
    ...data,
    '@type': type
  });

  return {
    ...data,
    id
  };
};

const __resolveType = (obj, ctx, info) => {
  return obj['@type'];
};

const getAllPeople = field => (parent, args, ctx, info) => parent[field].map(id => ctx.db.findOne('people', { id }));

const resolvers = {
  Query: {
    hello: (_, args) => `Hello ${args.name || 'World'}!`,
    thing: (parent, { id }, ctx, info) => {
      const collections = Object.keys(ctx.db.database);
      const things = collections
        .map(collection => ctx.db.find(collection, {}))
        .reduce((previousValue, currentValue) => {
          return [
            ...previousValue,
            ...currentValue
          ];
        }, []);


      const thing = things.find(thing => thing.id === id);
      if (thing) {
        const {
          id,
          description,
          disambiguatingDescription,
          name,
          alternateName,
          alternateNames,
          sameAs,
          ...rest
        } = thing;

        return {
          id,
          description,
          disambiguatingDescription,
          name,
          alternateName,
          alternateNames,
          sameAs,
          node: thing
        };
      }
    },
    things(parent, args, ctx, info) {
      const collections = Object.keys(ctx.db.database);
      const things = collections
        .map(collection => ctx.db.find(collection, {}))
        .reduce((previousValue, currentValue) => {
          return [
            ...previousValue,
            ...currentValue
          ];
        }, []);

      return things.map(thing => {
        if (thing) {
          const {
            id,
            description,
            disambiguatingDescription,
            name,
            alternateName,
            alternateNames,
            sameAs,
            ...rest
          } = thing;

          return {
            id,
            description,
            disambiguatingDescription,
            name,
            alternateName,
            alternateNames,
            sameAs,
            node: thing
          };
        }
      });
    },
    person(parent, { id }, ctx, info) {
      const person = ctx.db.findOne('people', { id });

      if (!person.id) {
        throw new AppError('Not found!');
      }

      return person;
    },
    people(parent, args, ctx, info) {
      return ctx.db.find('people', {});
    },
    movie(parent, { id }, ctx, info) {
      return ctx.db.findOne('movies', { id });
    },
    movies(parent, { director, directors, actor, actors }, ctx, info) {
      const movies = ctx.db.find('movies', {});

      const hasAll = field => itemsToCheck => {
        // Ensure the movie has all the ids in the field
        return movies.filter(movie => itemsToCheck.every(item => movie[field].includes(item)));
      };

      if (director || directors || actor || actors) {
        return [
          ...director ? hasAll('directors')([director]) : [],
          ...directors ? hasAll('directors')(directors) : [],
          ...actor ? hasAll('actors')([actor]) : [],
          ...actors ? hasAll('actors')(actors) : [],
        ]
      }

      return movies;
    },
    show(parent, { id }, ctx, info) {
      return ctx.db.findOne('shows', { id });
    },
    shows(parent, args, ctx, info) {
      return ctx.db.find('shows', {});
    },
    game(parent, { id }, ctx, info) {
      return ctx.db.findOne('games', { id });
    },
    games(parent, args, ctx, info) {
      return ctx.db.find('games', {});
    },
    country(parent, { id }, ctx, info) {
      return ctx.db.findOne('countries', { id });
    },
    countries(parent, args, ctx, info) {
      return ctx.db.find('countries', {});
    }
  },
  Mutation: {
    deleteThing: (parent, { id }, ctx, info) => ctx.db.delete(id),
    createPerson: (parent, { data }, ctx, info) => createThing({ type: 'Person', data, ctx }),
    createMovie: (parent, { data }, ctx, info) => createThing({ type: 'Movie', data, ctx }),
    updatePerson: (parent, { id, data }, ctx, info) => {
      const person = ctx.db.findOne('people', { id });

      if (!person) {
        throw new Error(`Couldn't find person with id ${id}`);
      }

      const updatedPerson = ctx.db.update('people', id, {
        ...fromEntries(Object.entries(person).map(([ key, value ]) => {
          const dataValue = data[key];
          return [key, dataValue !== undefined ? dataValue : value];
        }))
      });

      return updatedPerson;
    },
  },
  Thing: {
    __resolveType
  },
  Movie: {
    actors: getAllPeople('actors'),
    directors({ directors = [] }, args, ctx, info) {
      return directors.map(id => ctx.db.findOne('people', { id }));
    }
  },
  Person: {
    name({ familyName, givenName }, args, ctx, info) {
      return `${givenName} ${familyName}`;
    },
    knows({ knows = [], parents = [], children = [] }, args, ctx, info) {
      return [...knows, ...parents, ...children].map(id => {
        const person = ctx.db.findOne('people', { id });
        log.debug(`looking for ${id} in "people", found ${JSON.stringify(person, null, 2)}`);
        return person;
      });
    },
    occupation: ({ occupations = [] }, args, ctx, info) => ctx.db.findOne('occupation', { id: occupations[0] }),
    occupations: ({ occupations = [] }, args, ctx, info) => occupations.map(id => ctx.db.findOne('occupation', { id })),
    parent: ({ parents = [] }, args, ctx, info) => ctx.db.findOne('people', { id: parents[0] }),
    parents: ({ parents = [] }, args, ctx, info) => parents.map(id => ctx.db.findOne('people', { id })),
    child: ({ children = [] }, args, ctx, info) => ctx.db.findOne('people', { id: children[0] }),
    children: ({ children = [] }, args, ctx, info) => children.map(id => ctx.db.findOne('people', { id })),
    sibling: ({ siblings = [] }, args, ctx, info) => ctx.db.findOne('people', { id: siblings[0] }),
    siblings: ({ siblings = [] }, args, ctx, info) => siblings.map(id => ctx.db.findOne('people', { id })),
    spouse: ({ spouses = [] }, args, ctx, info) => ctx.db.findOne('people', { id: spouses[0] }),
    spouses: ({ spouses = [] }, args, ctx, info) => spouses.map(id => ctx.db.findOne('people', { id })),
    nationality: ({ nationality = [] }, args, ctx, info) => ctx.db.findOne('countries', { id: nationality })
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
  },
  VideoGame: {
    gamePlatform: (parent, args, ctx, info) => parent.gamePlatform.map(id => ctx.db.findOne('consoles', { id }))
  },
  OrgOrPerson: {
    __resolveType
  },
  Address: {
    __resolveType
  },
  Date: GraphQLDateTime,
  JSON: GraphQLJSON,
  Long: GraphQLLong
};

const db = new Database('../db.json');
if (process.env.NODE_ENV !== 'production') {
  genMockData(db);
}

const options = {
  ...Options,
  formatError
};

const server = new GraphQLServer({
  typeDefs: [transpileSchema(typeDefs)],
  resolvers,
  context: async () => {
    return {
      db
    };
  }
})
server.start(options, () => log.info(`Server is running at http://localhost:4000`))
