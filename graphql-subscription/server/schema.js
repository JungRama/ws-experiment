const typeDefs = `#graphql
  type Message {
    message: String
    time: String
    clientId: String
  }

  type Query {
    messages: [Message]
  }

  type Mutation {
    sendMessage(message: String, time: String, clientId: String, roomId: String): Message
  }

  type Subscription {
    message(roomId: String): Message
  }
`;
export default typeDefs