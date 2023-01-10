import { MQTTPubSub } from "graphql-mqtt-subscriptions";
import { connect } from "mqtt";

const client = connect("mqtt://0.tcp.ap.ngrok.io:17340", {
  reconnectPeriod: 1000,
});

// @ts-nocheck
const pubsub = new MQTTPubSub({
  client,
});

const resolvers = {
  Query: {
    sensors: () => {
      return [{ id: "Sensor1" }, { id: "Sensor2" }];
    },
  },
  Mutation: {
    turnOnSwitch: (_, args: { switchId: string }) => {
      pubsub.publish("SWITCH_ON", {
        switchId: args.switchId,
      });
      return {
        code: "200",
        message: `Turning on SWITCH ${args.switchId}`,
        success: true,
      };
    },
    turnOffSwitch: (_, args: { switchId: string }) => {
      pubsub.publish("SWITCH_OFF", {
        switchId: args.switchId,
      });
      return {
        code: "200",
        message: `Turning off SWITCH ${args.switchId}`,
        success: true,
      };
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
    subscribe2switch: {
      resolve: (payload) => {
        return payload.data;
      },
      subscribe: (_, args) => pubsub.asyncIterator([args.topic]),
    },
  },
};

export default resolvers;
