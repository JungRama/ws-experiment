import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub, withFilter } from 'graphql-subscriptions';
import cors from 'cors';

import typeDefs from './schema.js'

const pubsub = new PubSub();

const app = express();
const httpServer = http.createServer(app);

let messages = [];

const resolvers = {
  Query: {
    messages: () => {
      return messages
    }
  },
  Subscription: {
    message: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('MESSAGE'),
        (payload, variables) => {

          // check if roomId is provided, if provided sent to spesific room id, if not sent to all
          if(payload.message.roomId === 'BROADCAST') {
            return (true)
          }else {
            return (payload.message.roomId === variables.roomId);
          }
        },
      ),
    },
  },
  Mutation: {
    sendMessage: (_, args, __) => {
      pubsub.publish('MESSAGE', {
        message: {
          ...args
        }
      })

      return args
    },
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Set up WebSocket server.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start()

app.use('/graphql', cors('*'), express.json(), expressMiddleware(server))

await new Promise((resolve) => httpServer.listen({ port: 8000 }, resolve));

console.log(`🚀 Server ready at http://localhost:8000/`);