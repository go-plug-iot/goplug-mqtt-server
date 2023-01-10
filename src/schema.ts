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

  type MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type Subscription {
    subscribe2sensor(topic: String!): SensorData!
    subscribe2switch(topic: String!): SwitchData!
  }
  type Sensors {
    id: String!
  }
  type Query {
    sensors: [Sensors!]!
  }

  type Mutation {
    turnOnSwitch(switchId: String!): MutationResponse!
    turnOffSwitch(switchId: String!): MutationResponse!
  }
  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }
`;

export default typeDefs;
