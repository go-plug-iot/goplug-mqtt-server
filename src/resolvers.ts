import { MQTTPubSub } from "graphql-mqtt-subscriptions";
import { connect } from "mqtt";
import jwt from "jsonwebtoken";
import cron from "node-cron";

import { firebaseAuth } from "./configs/firebase.js";
import User from "./models/user.js";
import Activity, { ActivityType } from "./models/activity.js";
import Switch from "./models/switch.js";
import CompletedActivity from "./models/completedActivity.js";

const client = connect("mqtt://localhost:1883", {
  reconnectPeriod: 1000,
});

//FIXME: Fix with proper jwt secret
const JWT_SECRET = "secret";

// @ts-nocheck
const pubsub = new MQTTPubSub({
  client,
});

export type ActivityPayload = {
  name: string;
  switchCode: number;
  type: ActivityType;
  startTime?: { hour: number; minutes: number };
  endTime: { hour: number; minutes: number };
  usage: string;
};

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
    getRoutines: async (_, __, { userId }: { userId: string }) => {
      if (!userId) return null;
      try {
        console.log(userId);
        const activities = await Activity.find({
          type: ActivityType.Routine,
          user: userId,
        }).exec();
        // console.log([...activities.to]);
        return activities;
      } catch (err) {
        console.log(err);
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
      pubsub.publish("TIMER_OFF", {
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
    createActivity: async (
      _,
      { activityDetails }: { activityDetails: ActivityPayload },
      { userId }: { userId: string }
    ) => {
      console.log("Waht hepp");
      try {
        if (!userId) return null;
        const userDetails = await User.findById(userId);
        if (!userDetails) return null;

        const switchDetails = await Switch.findOne({
          code: activityDetails.switchCode,
        });

        const newActivity = await Activity.create({
          ...activityDetails,
          switchCode: switchDetails.id,
          user: userId,
        });
        if (activityDetails.type == ActivityType.Timer) {
          pubsub.publish("TIMER_ON", {
            switchId: activityDetails.switchCode,
            hour: activityDetails.endTime.hour,
            minutes: activityDetails.endTime.minutes,
          });
        } else if (activityDetails.type == ActivityType.Routine) {
          cron.schedule(
            `${activityDetails.startTime.minutes} ${activityDetails.startTime.hour} * * *`,
            () => {
              pubsub.publish("TIMER_ON", {
                switchId: activityDetails.switchCode,
                hour: activityDetails.endTime.hour,
                minutes: activityDetails.endTime.minutes,
              });
            }
          );
        }
        console.log("Im good");
        return {
          code: 200,
          success: true,
          message: "Activity created successfully",
          activity: newActivity,
        };
      } catch (err) {
        console.log(err);
        return {
          code: err.extensions.response.status,
          success: false,
          message: err.extensions.response.body,
          activity: null,
        };
      }
    },
    setBudget: async (
      _,
      { amount }: { amount: number },
      { userId }: { userId: string }
    ) => {
      try {
        if (!userId) return;
        const userDetails = await User.findOneAndUpdate(
          { _id: userId },
          { budget: amount }
        );
        if (userDetails)
          return {
            code: 200,
            success: true,
            message: "Budget updated",
            budget: amount,
          };
      } catch (err) {
        return {
          code: err.extensions.response.status,
          success: false,
          message: err.extensions.response.body,
          activity: null,
        };
      }
    },
    stopActivity: async (
      _,
      { activityID }: { activityID: string },
      { userId }: { userId: string }
    ) => {
      try {
        if (!userId) return null;
        const currentlyRunningActivity = await CompletedActivity.findById(
          activityID
        );
        if (currentlyRunningActivity) {
          return {
            code: 200,
            success: true,
            message: "Activity stopped",
            activity: activityID,
          };
        }
      } catch (err) {
        return {
          code: err.extensions.response.status,
          success: false,
          message: err.extensions.response.body,
          activity: null,
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
    switchStatusCallback: {
      resolve: (payload) => {
        console.log(payload.data);
        return payload.data;
      },
      subscribe: (_, args) => pubsub.asyncIterator([args.topic]),
    },
  },
};

export default resolvers;
