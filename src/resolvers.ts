import { MQTTPubSub } from "graphql-mqtt-subscriptions";
import { connect } from "mqtt";

const client = connect("mqtt://0.tcp.ap.ngrok.io:16059", {
  reconnectPeriod: 1000,
});

// @ts-nocheck
const pubsub = new MQTTPubSub({
  client
});

const resolvers = {
  Query: {
    sensors: () => {
      return [{ id: "Sensor1" }, { id: "Sensor2" }];
    },
  },
  Subscription: {
    subscribe2sensor: {
      resolve: (payload) => {
        return {
          temp: payload.data.temp,
          humid: payload.data.humid,
        };
      },
      subscribe: (_, args) => pubsub.asyncIterator([args.topic]),
    },
  },
  Mutation: {
    
  }
};

export default resolvers;
