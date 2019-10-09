const { GraphQLServer, Options } = require('graphql-yoga');
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { formatError } = require('apollo-errors');
const Database = require('somewhere');
const glue = require('schemaglue');
const genMockData = require('./gen-mock-data');
const { log } = require('./helpers');

const db = new Database('../db.json');
if (process.env.NODE_ENV !== 'production') {
  genMockData(db);
}

const options = {
  ...Options,
  formatError
};

const { schema, resolver } = glue('src/graphql');

const server = new GraphQLServer({
  typeDefs: [transpileSchema(schema)],
  resolvers: resolver,
  context: async () => {
    return {
      db
    };
  }
})
server.start(options, () => log.info(`Server is running at http://localhost:4000`))
