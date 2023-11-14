import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// Although Apollo Client can use your GraphQLWsLink to execute all operation types, in most cases it should continue using HTTP for queries and mutations. This is because queries and mutations don't require a stateful or long-lasting connection, making HTTP more efficient and scalable if a WebSocket connection isn't already present.
const httpLink = new HttpLink({
  uri: 'http://localhost:8000/graphql'
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:8000/graphql',
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  uri: 'http://localhost:8000/graphql',
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
