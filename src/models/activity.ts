import { Schema, model, connect, Document } from "mongoose";
import { ICompletedActivity } from "./completedActivity";
import { ISwitch } from "./switch";
import { IUser } from "./user";

export enum ActivityType {
  Routine = "Routine",
  Timer = "Timer",
}

export interface IActivity extends Document {
  name: string;
  user: IUser["_id"] | IUser;
  switchCode: ISwitch["_id"] | ISwitch;
  type: ActivityType;
  startTime: { hour: number; minutes: number };
  endTime: { hour: number; minutes: number };
  usage: string;
  createdActivities: ICompletedActivity["_id"] | ICompletedActivity;
}

// 2. Create a Schema corresponding to the document interface.
const activitySchema = new Schema<IActivity>({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  switchCode: { type: Schema.Types.ObjectId, required: true, ref: "Switch" },
  type: { type: String, enum: ActivityType, required: true },
  startTime: {
    hour: { type: Number },
    minutes: { type: Number },
  },
  endTime: {
    hour: { type: Number, required: true },
    minutes: { type: Number, required: true },
  },
  usage: { type: String, required: true },
  createdActivities: { type: Schema.Types.ObjectId, ref: "CompletedActivity" },
});

activitySchema.set("toJSON", { virtuals: true });

const Activity = model<IActivity>("Activity", activitySchema);

export default Activity;
