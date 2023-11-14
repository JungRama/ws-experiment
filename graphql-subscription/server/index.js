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

// Create a new instance of the PubSub class
const pubsub = new PubSub();

// Create an instance of the Express app
const app = express();

// Create an HTTP server using the Express app
const httpServer = http.createServer(app);

// Define the resolvers for the GraphQL schema
const resolvers = {
  Query: {
    // Resolver for the "messages" query
    messages: () => {
      return messages
    }
  },
  Subscription: {
    // Resolver for the "message" subscription
    message: {
      subscribe: withFilter(
        // Subscribe to the "MESSAGE" channel of the pubsub instance
        () => pubsub.asyncIterator('MESSAGE'),
        // Filter the messages based on the roomId provided
        (payload, variables) => {

          // Check if roomId is provided, if provided send to specific room id, if not send to all
          if(payload.message.roomId === 'BROADCAST') {
            return (true)
          } else {
            return (payload.message.roomId === variables.roomId);
          }
        },
      ),
    },
  },
  Mutation: {
    // Resolver for the "sendMessage" mutation
    sendMessage: (_, args, __) => {
      // Publish the new message to the "MESSAGE" channel of the pubsub instance
      pubsub.publish('MESSAGE', {
        message: {
          ...args
        }
      })

      return args
    },
  }
};

// Create the executable schema for GraphQL using the typeDefs and resolvers
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Set up WebSocket server.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Clean up resources when the server is closed
const serverCleanup = useServer({ schema }, wsServer);

// Create the Apollo Server instance
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

// Start the Apollo Server
await server.start()

// Set up the GraphQL endpoint on the Express app
app.use('/graphql', cors('*'), express.json(), expressMiddleware(server))

// Start the HTTP server and listen on port 8000
await new Promise((resolve) => httpServer.listen({ port: 8000 }, resolve));

console.log(`🚀 Server ready at http://localhost:8000/`);