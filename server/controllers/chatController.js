import mongoose from "mongoose";
import Chat from "../models/Chats.js";
import OwnerUser from "../models/OwnerUser.js";
import TenantUser from "../models/TenantUser.js";
import BadRequestError from "../request-errors/BadRequest.js";

function asObjectId(id) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * @description Send message
 * @returns {object} message
 */
const sendMessage = async (req, res) => {
  const { to, message } = req.body;
  const { userId: from } = req.user;
  if (!to || !message) {
    throw new BadRequestError("to and message are required");
  }
  const fromOid = asObjectId(from);
  const toOid = asObjectId(to);
  if (!fromOid || !toOid) {
    throw new BadRequestError("Invalid user id");
  }
  const newMessage = await Chat.create({
    chatUsers: [fromOid, toOid],
    message: String(message).trim(),
    sender: String(from),
  });
  res.status(201).json({ newMessage, msg: "Message sent successfully" });
};

/**
 * @description Get all messages for a chat
 * @returns {object} message
 */
const getMessages = async (req, res) => {
  const { to } = req.body;
  const { userId: from } = req.user;
  const fromOid = asObjectId(from);
  const toOid = asObjectId(to);
  if (!fromOid || !toOid) {
    throw new BadRequestError("Invalid chat participant");
  }

  const msgs = await Chat.find({
    chatUsers: { $all: [fromOid, toOid] },
  }).sort({ createdAt: 1 });

  const fromStr = String(from);
  const messages = msgs.map((msg) => {
    return {
      fromSelf: String(msg.sender) === fromStr,
      message: msg.message,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    };
  });
  return res.status(200).json({ messages });
};

/**
 * @description Get all chats for a user
 * @returns {object} message
 */

const getChats = async (req, res) => {
  const { userId } = req.user;
  const userOid = asObjectId(userId);
  if (!userOid) {
    return res.status(200).json({ chats: [] });
  }

  const lastMessages = await Chat.aggregate([
    {
      $match: {
        chatUsers: { $in: [userOid] },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $addFields: {
        sortedChatUsers: { $sortArray: { input: "$chatUsers", sortBy: 1 } },
      },
    },
    {
      $group: {
        _id: "$sortedChatUsers",
        lastMessage: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$lastMessage" },
    }
  ]);

  const uidStr = userId.toString();
  const chatContacts = lastMessages
    .map((lastMessage) => {
      const other = lastMessage.chatUsers.find((id) => id.toString() !== uidStr);
      lastMessage.to = other;
      return other;
    })
    .filter(Boolean);
  // console.log("lastMessages", lastMessages)
  let contacts = [];
  if (req.path.includes("tenant")) {
    contacts = await OwnerUser.find({ _id: { $in: chatContacts } }).select(
      "firstName lastName profileImage slug _id"
    );
  } else {
    contacts = await TenantUser.find({ _id: { $in: chatContacts } }).select(
      "firstName lastName profileImage slug _id"
    );
  }
  // console.log(contacts)

  const chats = lastMessages
    .map((lastMessage) => {
      const contact = contacts.find(
        (c) => c._id.toString() === lastMessage.to?.toString?.()
      );
      const merged = {
        ...lastMessage,
        ...(contact ? contact.toObject?.() || contact : {}),
      };
      if (contact) merged._id = contact._id;
      return merged;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.status(200).json({ chats });
}

export { sendMessage, getMessages, getChats };
