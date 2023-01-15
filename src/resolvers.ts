import { MQTTPubSub } from "graphql-mqtt-subscriptions";
import { connect } from "mqtt";
import jwt from "jsonwebtoken";

import { firebaseAuth } from "./configs/firebase.js";
import User from "./models/user.js";

const client = connect("mqtt://0.tcp.ap.ngrok.io:18657", {
  reconnectPeriod: 1000,
});

//FIXME: Fix with proper jwt secret
const JWT_SECRET = "secret";

// @ts-nocheck
const pubsub = new MQTTPubSub({
  client,
});

const resolvers = {
  Query: {
    sensors: () => {
      return [{ id: "Sensor1" }, { id: "Sensor2" }];
    },
    checkEmailAddress: async (
      _,
      { emailAddress }: { emailAddress: string }
    ) => {
      try {
        const user = await User.findOne({ emailAddress }).exec();
        return !!user;
      } catch (err) {
        console.log(err);
      }
    },
    getUser: async (_, __, { userId }: { userId: string }) => {
      console.log(userId);
      if (!userId) return null;
      try {
        //console.log(userId);
        const user = await User.findById(userId).exec();
        console.log({ ...user.toJSON(), id: user.id });
        return {
          ...user.toJSON(),
          id: user.id,
        };
      } catch (err) {
        return err;
      }
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
    createUser: async (
      _,
      {
        userDetails,
      }: {
        userDetails: {
          firstName: string;
          lastName: string;
          emailAddress: string;
          firebaseToken: string;
        };
      }
    ) => {
      try {
        const { firebaseToken, ...userInfo } = userDetails;
        const user = await User.create(userInfo);
        const isFirebaseTokenValid = await firebaseAuth().verifyIdToken(
          firebaseToken
        );
        if (isFirebaseTokenValid) {
          const jwtToken = jwt.sign({ data: { id: user.id } }, JWT_SECRET, {
            expiresIn: "4h",
          });
          return {
            code: 200,
            success: true,
            message: "User has been created",
            user,
            token: jwtToken,
          };
        }
      } catch (err) {
        return {
          code: err.extensions.response.status,
          success: false,
          message: err.extensions.response.body,
          user: null,
        };
      }
    },
    authenticateUser: async (
      _,
      {
        emailAddress,
        firebaseToken,
      }: { emailAddress: string; firebaseToken: string }
    ) => {
      try {
        const isFirebaseTokenValid = await firebaseAuth().verifyIdToken(
          firebaseToken
        );
        if (isFirebaseTokenValid) {
          const user = await User.findOne({ emailAddress }).exec();
          const jwtToken = jwt.sign({ data: { id: user.id } }, JWT_SECRET, {
            expiresIn: "4h",
          });
          return {
            code: 200,
            success: true,
            message: "Token has been generated",
            token: jwtToken,
          };
        }
      } catch (err) {
        console.log(err);
        return {
          code: 400,
          success: false,
          message: "Token could not be generated",
        };
      }
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
