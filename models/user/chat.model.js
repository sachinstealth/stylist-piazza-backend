const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    message: {
      type: String
    },
     chatid: {
      type:mongoose.Schema.Types.ObjectId,ref:'chatids'

    },
    sender: {
       type:mongoose.Schema.Types.ObjectId,ref:'signups'

    },
    receiver: {
        type:mongoose.Schema.Types.ObjectId,ref:'signups'

      },
  },
  {
    timestamps: true
  }
);

let Chat = mongoose.model("chat", chatSchema);

module.exports = Chat;
