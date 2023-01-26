import { Schema, model, connect, Document } from "mongoose";
import { IActivity } from "./activity";
import { ISwitch } from "./switch";
import { IUser } from "./user";

export interface ICompletedActivity extends Document {
  activity: IActivity["_id"] | IActivity;
  status: ActivityStatus;
  completedTime: Date;
  totalCurrent: number;
  totalCost: number;
  percentageOfQuota: number;
}

export enum ActivityStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  STOPPED = "STOPPED",
}

// 2. Create a Schema corresponding to the document interface.
const completedActivitySchema = new Schema<ICompletedActivity>({
  activity: { type: Schema.Types.ObjectId, required: true, ref: "Activity" },
  status: {
    type: String,
    enum: ActivityStatus,
    default: ActivityStatus.ACTIVE,
  },
  completedTime: { type: Date, required: true },
  totalCurrent: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  percentageOfQuota: { type: Number, required: true },
});

completedActivitySchema.set("toJSON", { virtuals: true });

const CompletedActivity = model<IActivity>(
  "CompletedActivity",
  completedActivitySchema
);

export default CompletedActivity;
