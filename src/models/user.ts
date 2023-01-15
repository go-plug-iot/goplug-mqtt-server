import { Schema, model, connect } from "mongoose";

interface IUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  isAdmin: boolean;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

const User = model<IUser>("User", userSchema);

export default User;
