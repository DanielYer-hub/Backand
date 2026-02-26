const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    invite: { type: Schema.Types.ObjectId, ref: "invite", required: true },
    fromUser: { type: Schema.Types.ObjectId, ref: "user", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "user", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

chatMessageSchema.index({ invite: 1, createdAt: 1 });

module.exports = mongoose.model("chatMessage", chatMessageSchema);

