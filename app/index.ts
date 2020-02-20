import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { graphqls2s } from 'graphql-s2s';
import glue from 'schemaglue';

const { transpileSchema } = graphqls2s;
const { schema, resolver } = glue('app/graphql');

const apolloServer = new ApolloServer({
  typeDefs: [transpileSchema(schema)],
  resolvers: resolver,
  introspection: true
});

const app = express();

apolloServer.applyMiddleware({
  app,
  path: '/graphql'
});

export default app;