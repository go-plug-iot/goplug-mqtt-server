import gql from "graphql-tag";

const typeDefs = gql`
  type SensorData {
    temp: Float!
    humid: Float!
  }
  type SwitchData {
    isOn: Int!
    voltage: String
    current: String
  }

  type User {
    id: String!
    firstName: String!
    lastName: String!
    emailAddress: String!
    isAdmin: Boolean!
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type CreateUserResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
    token: String
  }

  type AuthenticationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    token: String
  }

  type Subscription {
    subscribe2sensor(topic: String!): SensorData!
    subscribe2switch(topic: String!): SwitchData!
  }
  type Sensors {
    id: String!
  }

  input CreateUserInput {
    firstName: String!
    lastName: String!
    emailAddress: String!
    password: String!
    firebaseToken: String!
  }
  type Query {
    sensors: [Sensors!]!
    getUser: User!
    checkEmailAddress(emailAddress: String!): Boolean!
  }

  type Mutation {
    turnOnSwitch(switchId: String!): MutationResponse!
    turnOffSwitch(switchId: String!): MutationResponse!
    authenticateUser(
      emailAddress: String!
      firebaseToken: String!
    ): AuthenticationResponse!
    createUser(userDetails: CreateUserInput): CreateUserResponse!
  }
  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }
`;

export default typeDefs;
