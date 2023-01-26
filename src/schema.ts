import gql from "graphql-tag";

const typeDefs = gql`
  enum ActivityType {
    Routine
    Timer
  }

  type Time {
    hour: Int!
    minutes: Int!
  }

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
    budget: Float!
  }

  type Activity {
    name: String!
    user: String!
    switchCode: String!
    type: String!
    startTime: Time
    endTime: Time!
    usage: String!
  }

  type CompletedActivity {
    activity: String!
    status: String!
    completedTime: String!
    totalCurrent: Float!
    totalCost: Float!
    percentageOfQuota: Float!
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

  type CreateActivityResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    activity: Activity
  }

  type SetBudgetResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    budget: Float
  }

  type AuthenticationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    token: String
  }

  type StopActivityResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    activity: String!
  }

  type SwitchStatusCallbackData {
    switchId: Int!
    isOn: String!
  }

  type Subscription {
    subscribe2sensor(topic: String!): SensorData!
    subscribe2switch(topic: String!): SwitchData!
    switchStatusCallback(topic: String!): SwitchStatusCallbackData!
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

  input CreateTimeInput {
    hour: Int!
    minutes: Int!
  }

  input CreateActivityInput {
    name: String!
    ### Switch code
    switchCode: Int!
    type: ActivityType!
    startTime: CreateTimeInput
    endTime: CreateTimeInput!
    usage: String!
  }

  type Query {
    sensors: [Sensors!]!
    getUser: User!
    checkEmailAddress(emailAddress: String!): Boolean!
    getRoutines: [Activity!]
    getCompletedActivities(activityID: String!): [CompletedActivity!]
  }

  type Mutation {
    turnOnSwitch(switchId: String!): MutationResponse!
    turnOffSwitch(switchId: Int!): MutationResponse!
    authenticateUser(
      emailAddress: String!
      firebaseToken: String!
    ): AuthenticationResponse!
    createUser(userDetails: CreateUserInput): CreateUserResponse!
    createActivity(
      activityDetails: CreateActivityInput
    ): CreateActivityResponse!
    setBudget(amount: Float!): SetBudgetResponse!
    stopActivity(activityID: String!): StopActivityResponse!
  }
  schema {
    query: Query
    subscription: Subscription
    mutation: Mutation
  }
`;

export default typeDefs;
