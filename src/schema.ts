const typeDefs = `#graphql
  type SensorData {
    temp: Float!
    humid: Float!
  }
  type SwitchData {
    isOn: Boolean!
    voltage: String
    current: String
    power: String
  }

  interface MutationResponse {
  code: String!
  success: Boolean!
  message: String!
}

type SwitchStateResponse implements MutationResponse{}

  type Subscription {
    subscribe2sensor(topic: String!): SensorData!
  }
  type Sensors {
    id: String!
  }
  type Query {
    sensors: [Sensors!]!
  }

  type Mutation{
  turnOnSwitch(switchId: String!): SwitchStateResponse!
  }
  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }
`;

export default typeDefs;
