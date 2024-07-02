// import Joi from "joi";
// import mongoose from "mongoose";

// const expenseSchema = new mongoose.Schema({
//   description: {
//     type: String,
//     required: true,
//     minlength: 1,
//     maxlength: 100,
//   },
//   amount: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
//   date: {
//     type: Date,
//     required: true,
//     default: Date.now,
//   },
//   group: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Group",
//     required: true,
//   },
//   paidBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   membersBalance: {
//     type: Array,
//     required: true,
//     default: [],
//   },
//   settledMembers: {
//     type: Array,
//     default: [],
//   },

//   isSettled: {
//     type: Boolean,
//     default: false,
//   },
// });

// const Expense = mongoose.model("Expense", expenseSchema);

// const validateExpense = (expense: any) => {
//   const schema = {
//     description: Joi.string().min(1).max(100).required(),
//     amount: Joi.number().min(0).required(),
//     date: Joi.date().required(),
//     group: Joi.required(),
//     paidBy: Joi.required(),
//   };
//   return Joi.object(schema).validate(expense);
// };

// export default Expense;
// export { validateExpense };



import Joi from 'joi';
import client from '../config/cassandra';
import { v4 as uuidv4 } from 'uuid';

const expenseSchema = {
  description: Joi.string().min(1).max(100).required(),
  amount: Joi.number().min(0).required(),
  date: Joi.date().required(),
  group: Joi.string().required(),
  paidBy: Joi.string().required(),
  membersBalance: Joi.array().items(Joi.object()).required(),
  settledMembers: Joi.array().items(Joi.string()).default([]),
  isSettled: Joi.boolean().default(false)
};

const validateExpense = (expense: any) => {
  return Joi.object(expenseSchema).validate(expense);
};

const insertExpense = async (expense: any) => {
  const query = 'INSERT INTO expenses (id, description, amount, date, group_id, paid_by, members_balance, settled_members, is_settled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [uuidv4(), expense.description, expense.amount, expense.date, expense.group, expense.paidBy, expense.membersBalance, expense.settledMembers, expense.isSettled];
  await client.execute(query, params, { prepare: true });
};

const getExpenseById = async (id: any) => {
  const query = 'SELECT * FROM expenses WHERE id = ?';
  const result = await client.execute(query, [id], { prepare: true });
  return result.rowLength ? result.first() : null;
};

const updateExpenseSettledMembers = async (expense: any, memberId: any) => {
  const index = expense.settled_members.indexOf(memberId);
  if (index > -1) {
    expense.settled_members.splice(index, 1);
  } else {
    expense.settled_members.push(memberId);
  }

  if (expense.settled_members.length === JSON.parse(expense.members_balance).filter(member => member.memberId !== expense.paid_by).length) {
    expense.is_settled = true;
  }

  const query = 'UPDATE expenses SET settled_members = ?, is_settled = ? WHERE id = ?';
  const params = [expense.settled_members, expense.is_settled, expense.id];
  await client.execute(query, params, { prepare: true });
};

const revertExpenseSettledMember = async (expense: any, memberId: any) => {
  const index = expense.settled_members.indexOf(memberId);
  if (index > -1) {
    expense.settled_members.splice(index, 1);
  }

  if (expense.settled_members.length !== JSON.parse(expense.members_balance).filter(member => member.memberId !== expense.paid_by).length) {
    expense.is_settled = false;
  }

  const query = 'UPDATE expenses SET settled_members = ?, is_settled = ? WHERE id = ?';
  const params = [expense.settled_members, expense.is_settled, expense.id];
  await client.execute(query, params, { prepare: true });
};

const getExpensesByGroupId = async (groupId: any) => {
  const query = 'SELECT * FROM expenses WHERE group_id = ?';
  const result = await client.execute(query, [groupId], { prepare: true });
  return result.rows;
};

const countExpensesByGroupId = async (groupId: any) => {
  const query = 'SELECT COUNT(*) FROM expenses WHERE group_id = ?';
  const result = await client.execute(query, [groupId], { prepare: true });
  return result.rowLength ? result.first().count : 0;
};

const deleteExpensesByGroupId = async (groupId: any) => {
  const query = 'DELETE FROM expenses WHERE group_id = ?';
  await client.execute(query, [groupId], { prepare: true });
};

const updateExpenseMemberBalances = async (expenseId: any, membersBalance: any) => {
  const query = 'UPDATE expenses SET members_balance = ? WHERE id = ?';
  const params = [JSON.stringify(membersBalance), expenseId];
  await client.execute(query, params, { prepare: true });
};

const getExpensesByPaidBy = async (userId: any) => {
  const query = 'SELECT * FROM expenses WHERE paid_by = ?';
  const result = await client.execute(query, [userId], { prepare: true });
  return result.rows;
};

const getOwedExpensesByUserId = async (userId: any) => {
  const query = 'SELECT * FROM expenses WHERE members_balance CONTAINS ? AND settled_members NOT CONTAINS ?';
  const result = await client.execute(query, [{ memberId: userId }, userId], { prepare: true });
  return result.rows;
};


const getUserExpenses = async (userId: any) => {
  const paidByExpenses = await getExpensesByPaidBy(userId);
  const owedExpenses = await getOwedExpensesByUserId(userId);

  const lent = paidByExpenses.reduce((previousValue: any, currentValue: any) => {
    if (currentValue.members_balance.length < 1) return 0;
    let myBalance = currentValue.members_balance.find(
      (member: any) => member.member_id === userId
    )?.balance;

    const settledExpenses =
      currentValue.settled_members.length > 0
        ? currentValue.settled_members.map((member: any) => {
            return currentValue.members_balance.find(
              (memberBalance: any) => memberBalance.member_id === member
            )?.balance;
          })
        : [];

    myBalance =
      Number(myBalance) +
      settledExpenses?.reduce((previousValue: any, currentValue: any) => {
        return previousValue + Number(currentValue);
      }, 0);

    return previousValue + Number(myBalance);
  }, 0);

  const owe = owedExpenses.reduce((previousValue: any, currentValue: any) => {
    if (currentValue.members_balance.length < 1) return 0;
    if (currentValue.settled_members.includes(userId)) return 0;
    const myBalance = currentValue.members_balance.find(
      (member: any) => member.member_id === userId
    )?.balance;
    return previousValue + Number(myBalance);
  }, 0);

  return { lent, owe };
};

export { validateExpense, getUserExpenses, getExpensesByPaidBy, getOwedExpensesByUserId, getExpensesByGroupId, countExpensesByGroupId, deleteExpensesByGroupId, updateExpenseMemberBalances, insertExpense, getExpenseById, updateExpenseSettledMembers, revertExpenseSettledMember };