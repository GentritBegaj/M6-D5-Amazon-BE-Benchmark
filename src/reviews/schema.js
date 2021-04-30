import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const ReviewSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  updatedAt: Date,
  createdAt: Date,
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model("Review", ReviewSchema);
