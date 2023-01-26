import { Schema, model, connect, Document } from "mongoose";
import { IUser } from "./user";

export interface ISwitch extends Document {
  name: string;
  code: number;
  totalCurrent: number;
  totalPower: number;
  lastUser: IUser["_id"] | IUser;
  isOn: boolean;
  blockedUsers: string[];
}

// 2. Create a Schema corresponding to the document interface.
const switchSchema = new Schema<ISwitch>({
  name: { type: String, required: true },
  code: { type: Number, required: true },
  totalCurrent: { type: Number, required: true },
  totalPower: { type: Number, required: true },
  lastUser: { type: Schema.Types.ObjectId, ref: "User" },
  isOn: { type: Boolean, required: true },
  blockedUsers: [{ type: String, ref: "User" }],
});

switchSchema.set("toJSON", { virtuals: true });

const Switch = model<ISwitch>("Switch", switchSchema);

export default Switch;
