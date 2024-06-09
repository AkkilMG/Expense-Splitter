

import mongoose, { Document, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { UserType } from "types";
import Joi from "joi";
("joi");

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  generateAuthToken: () => string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.JWT_PRIVATE_KEY || 'defaultPrivateKey' // Ensure a default value for JWT_PRIVATE_KEY
  );
  return token;
};

const User = mongoose.model<IUser>("User", userSchema);

const validateUser = (user: UserType) => {
  const schema = {
    name: Joi.string().min(1).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  };
  return Joi.object(schema).validate(user);
};


export default User;
export { validateUser as validate };