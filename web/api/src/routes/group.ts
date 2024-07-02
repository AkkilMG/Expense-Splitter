// import { Router } from "express";
// import { authMiddleWare } from "middleware";
// import { Expense, Group, User } from "models";
// import mongoose, { Types } from "mongoose";
// import { updateMemberBalances } from "services/expenseService";

// const router = Router();

// // Add Group
// router.post("/", authMiddleWare, async (req, res) => {
//   const group = new Group({
//     name: req.body.name,
//     description: req.body.description,
//     members: req.body.members.map((id: string) => new mongoose.Types.ObjectId(id)),
//   });
//   await group.save();

//   res.send(group);
// });

// // Get all groups from memberId
// // router.get("/member/:memberId", authMiddleWare, async (req, res) => {
// //   const memberId = new mongoose.Types.ObjectId(req.params.memberId);
// //   let groups = await Group.find({ members: memberId }).lean();
// //   groups = await Promise.all(groups.map(async (group) => {
// //     const totalExpenses = await Expense.countDocuments({ group: group._id });
// //     return {
// //       ...group,
// //       totalExpenses,
// //     };
// //   }));
// //   res.send(groups);
// // });
// router.get("/member/:memberId", authMiddleWare, async (req, res) => {
//   const memberId = req.params.memberId;
//   try {
//     let groups = await Group.find({ members: memberId }).lean();
//     groups = await Promise.all(groups.map(async (group) => {
//       const totalExpenses = await Expense.countDocuments({ group: group._id });
//       return {
//         ...group,
//         totalExpenses,
//       };
//     }));
//     res.send(groups);
//   } catch (error) {
//     console.log(error)
//     res.status(500).send('Error fetching groups.');
//   }
// });



// // Get Expense
// router.get("/:groupId", authMiddleWare, async (req, res) => {
//   const groupId = new mongoose.Types.ObjectId(req.params.groupId);
//   const group = await Group.findById(groupId)
//     .populate("members", {
//       password: 0,
//     })
//     .lean({ virtuals: true });
//   if (!group?._id) {
//     return res.status(404).send("Group not found");
//   }
//   const totalExpenses = await Expense.countDocuments({ group: group._id });
//   res.send({ ...group, totalExpenses });
// });

// // Delete member
// router.delete("/:groupId/member/:memberId", authMiddleWare, async (req, res) => {
//   const groupId = new mongoose.Types.ObjectId(req.params.groupId);
//   const memberId = new mongoose.Types.ObjectId(req.params.memberId);
//   const group = await Group.findById(groupId);
//   if (!group) {
//     return res.status(404).send("Group not found");
//   }
//   const index = group.members.indexOf(memberId);
//   if (index > -1) {
//     group.members.splice(index, 1);
//     await group.save();
//   }

//   const expenses = await Expense.find({ group: groupId });

//   const updatedMemberBalances = await updateMemberBalances(
//     expenses,
//     group.members
//   );

//   await Promise.all(
//     updatedMemberBalances.map(async (memberBalances) => {
//       await Expense.updateOne(
//         { _id: memberBalances.expenseId },
//         { $set: { membersBalance: memberBalances.membersBalance } }
//       );
//     })
//   );
//   res.send(group);
// });

// // Add Member
// router.post("/:groupId/member/:memberId", authMiddleWare, async (req, res) => {
//   const groupId = new mongoose.Types.ObjectId(req.params.groupId);
//   const memberId = new mongoose.Types.ObjectId(req.params.memberId);
//   const group = await Group.findById(groupId);
//   if (!group) {
//     return res.status(404).send("Group not found");
//   }
//   const member = await User.findById(memberId);
//   if (!member) {
//     return res.status(404).send("Member not found");
//   }
//   group.members.push(memberId);

//   const expenses = await Expense.find({ group: groupId });

//   const updatedMemberBalances = await updateMemberBalances(
//     expenses,
//     group.members
//   );

//   await Promise.all(
//     updatedMemberBalances.map(async (memberBalances) => {
//       await Expense.updateOne(
//         { _id: memberBalances.expenseId },
//         { $set: { membersBalance: memberBalances.membersBalance } }
//       );
//     })
//   );

//   await group.save();
//   res.send(group);
// });

// // Delete group
// router.delete("/:groupId", authMiddleWare, async (req, res) => {
//   const groupId = new mongoose.Types.ObjectId(req.params.groupId);
//   const group = await Group.findById(groupId);
//   if (!group) {
//     return res.status(404).send("Group not found");
//   }

//   await Expense.deleteMany({ group: groupId });
//   await Group.deleteOne({ _id: groupId });

//   return res.send("Group Deleted");
// });

// export default router;


import { Router } from "express";
import { authMiddleWare } from "../middleware";
import { validateGroup, insertGroup, getGroupsByMemberId, getGroupById, deleteGroup, updateGroupMembers } from "../models";
import { validateExpense, insertExpense, getExpensesByGroupId, countExpensesByGroupId, deleteExpensesByGroupId, updateExpenseMemberBalances } from "../models";
import { getUserById } from "../models";
import { updateMemberBalances } from "../services/expenseService";
import { v4 as uuidv4 } from 'uuid'; // Import the uuidv4 function from the uuid package

const router = Router();

// Add Group
router.post("/", authMiddleWare, async (req, res) => {
  const group = {
    id: uuidv4(), 
    name: req.body.name,
    description: req.body.description,
    members: req.body.members
  };

  await insertGroup(group);
  res.send(group);
});

// Get all groups from memberId
router.get("/member/:memberId", authMiddleWare, async (req, res) => {
  const memberId = req.params.memberId;
  try {
    let groups = await getGroupsByMemberId(memberId);
    groups = await Promise.all(groups.map(async (group) => {
      const totalExpenses = await countExpensesByGroupId(group.id);
      return {
        ...group,
        totalExpenses
      };
    }));
    res.send(groups);
  } catch (error) {
    console.log(error)
    res.status(500).send('Error fetching groups.');
  }
});

// Get Expense
router.get("/:groupId", authMiddleWare, async (req, res) => {
  const groupId = req.params.groupId;
  const group = await getGroupById(groupId);
  if (!group) {
    return res.status(404).send("Group not found");
  }
  const totalExpenses = await countExpensesByGroupId(group.id);
  res.send({ ...group, totalExpenses });
});

// Delete member
router.delete("/:groupId/member/:memberId", authMiddleWare, async (req, res) => {
  const groupId = req.params.groupId;
  const memberId = req.params.memberId;
  const group = await getGroupById(groupId);
  if (!group) {
    return res.status(404).send("Group not found");
  }
  
  const index = group.members.indexOf(memberId);
  if (index > -1) {
    group.members.splice(index, 1);
    await updateGroupMembers(group.id, group.members);
  }

  const expenses = await getExpensesByGroupId(groupId);
  const updatedMemberBalances = await updateMemberBalances(expenses, group.members);

  await Promise.all(updatedMemberBalances.map(async (memberBalances) => {
    await updateExpenseMemberBalances(memberBalances.expenseId, memberBalances.membersBalance);
  }));

  res.send(group);
});

// Add Member
router.post("/:groupId/member/:memberId", authMiddleWare, async (req, res) => {
  const groupId = req.params.groupId;
  const memberId = req.params.memberId;
  const group = await getGroupById(groupId);
  if (!group) {
    return res.status(404).send("Group not found");
  }
  
  const member = await getUserById(memberId);
  if (!member) {
    return res.status(404).send("Member not found");
  }

  group.members.push(memberId);

  const expenses = await getExpensesByGroupId(groupId);
  const updatedMemberBalances = await updateMemberBalances(expenses, group.members);

  await Promise.all(updatedMemberBalances.map(async (memberBalances) => {
    await updateExpenseMemberBalances(memberBalances.expenseId, memberBalances.membersBalance);
  }));

  await updateGroupMembers(group.id, group.members);
  res.send(group);
});

// Delete group
router.delete("/:groupId", authMiddleWare, async (req, res) => {
  const groupId = req.params.groupId;
  const group = await getGroupById(groupId);
  if (!group) {
    return res.status(404).send("Group not found");
  }

  await deleteExpensesByGroupId(groupId);
  await deleteGroup(groupId);

  return res.send("Group Deleted");
});

export default router;
