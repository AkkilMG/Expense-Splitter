

// import mongoose, { Document, Schema } from "mongoose";
// import jwt from "jsonwebtoken";
// import { UserType } from "types";
// import Joi from "joi";
// ("joi");

// interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   generateAuthToken: () => string;
// }

// const userSchema = new Schema<IUser>({
//   name: {
//     type: String,
//     required: true,
//     minlength: 1,
//     maxlength: 50,
//   },
//   email: {
//     type: String,
//     required: true,
//     minlength: 5,
//     maxlength: 255,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 5,
//     maxlength: 1024,
//   },
// });

// userSchema.methods.generateAuthToken = function () {
//   const token = jwt.sign(
//     {
//       _id: this._id,
//       name: this.name,
//       email: this.email,
//     },
//     process.env.JWT_PRIVATE_KEY || 'defaultPrivateKey' // Ensure a default value for JWT_PRIVATE_KEY
//   );
//   return token;
// };

// const User = mongoose.model<IUser>("User", userSchema);

// const validateUser = (user: UserType) => {
//   const schema = {
//     name: Joi.string().min(1).max(50).required(),
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(5).max(1024).required(),
//   };
//   return Joi.object(schema).validate(user);
// };


// export default User;
// export { validateUser as validate };


import Joi from 'joi';
import client from '../config/cassandra';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const userSchema = {
  name: Joi.string().min(1).max(50).required(),
  email: Joi.string().min(5).max(255).required().email(),
  password: Joi.string().min(5).max(1024).required()
};

const validate = (user: any) => {
  return Joi.object(userSchema).validate(user);
};

const insertUser = async (user: any) => {
  const query = 'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)';
  const params = [uuidv4(), user.name, user.email, user.password];
  await client.execute(query, params, { prepare: true });
};

const generateAuthToken = (user: any) => {
  const token = jwt.sign(
    {
      _id: user.id,
      name: user.name,
      email: user.email
    },
    process.env.JWT_PRIVATE_KEY || 'defaultPrivateKey'
  );
  return token;
};


const getUserNamesByIds = async (ids: any) => {
  const query = 'SELECT id, name FROM users WHERE id IN ?';
  const result = await client.execute(query, [ids], { prepare: true });
  return result.rows;
};


const getUserById = async (id: any) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  const result = await client.execute(query, [id], { prepare: true });
  return result.rowLength ? result.first() : null;
};

const getUserByEmail = async (email: any) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const result = await client.execute(query, [email], { prepare: true });
  return result.rowLength ? result.first() : null;
};

const getUsersByIds = async (ids: any) => {
  const query = 'SELECT * FROM users WHERE id IN ?';
  const result = await client.execute(query, [ids], { prepare: true });
  return result.rows;
};

export { validate, getUserById, insertUser, generateAuthToken, getUserNamesByIds, getUserByEmail, getUsersByIds };
