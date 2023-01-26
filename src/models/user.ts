import { Schema, model, connect, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  emailAddress: string;
  budget: number;
  quota: { usage: number; startDate: Date };
  fcmToken: string;
  bluetoothUUID: string;
  isAdmin: boolean;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  budget: { type: Number, required: true },
  quota: { type: Number, required: true },
  fcmToken: { type: String, required: true },
  bluetoothUUID: { type: String },
  isAdmin: { type: Boolean, default: false },
});

userSchema.set("toJSON", { virtuals: true });

const User = model<IUser>("User", userSchema);

export default User;
