// import Joi from "joi";
// import mongoose from "mongoose";
// import { UserType } from "types";

// const groupSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     minlength: 1,
//     maxlength: 50,
//   },
//   description: {
//     type: String,
//     maxlength: 512,
//   },
//   members: {
//     type: [mongoose.Schema.Types.ObjectId],
//     ref: "User",
//   },
// });

// const Group = mongoose.model("Group", groupSchema);

// const validateGroup = (user: UserType) => {
//   const schema = {
//     name: Joi.string().min(1).max(50).required(),
//   };
//   return Joi.object(schema).validate(user);
// };

// export default Group;
// export { validateGroup  };


import Joi from 'joi';
import client from '../config/cassandra';
import { v4 as uuidv4 } from 'uuid';

const groupSchema = {
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(512).optional(),
  members: Joi.array().items(Joi.string()).required()
};

const validateGroup = (group: any) => {
  return Joi.object(groupSchema).validate(group);
};

const insertGroup = async (group: any) => {
  const query = 'INSERT INTO groups (id, name, description, members) VALUES (?, ?, ?, ?)';
  const params = [uuidv4(), group.name, group.description, group.members];
  await client.execute(query, params, { prepare: true });
};

const getGroupById = async (id: any) => {
  const query = 'SELECT * FROM groups WHERE id = ?';
  const result = await client.execute(query, [id], { prepare: true });
  return result.rowLength ? result.first() : null;
};

const getGroupsByMemberId = async (memberId: any) => {
  const query = 'SELECT * FROM groups WHERE ? IN members';
  const result = await client.execute(query, [memberId], { prepare: true });
  return result.rows;
};

const deleteGroup = async (id: any) => {
  const query = 'DELETE FROM groups WHERE id = ?';
  await client.execute(query, [id], { prepare: true });
};

const updateGroupMembers = async (id: any, members: any) => {
  const query = 'UPDATE groups SET members = ? WHERE id = ?';
  await client.execute(query, [members, id], { prepare: true });
};

export { insertGroup, getGroupsByMemberId, getGroupById, validateGroup, deleteGroup, updateGroupMembers };

