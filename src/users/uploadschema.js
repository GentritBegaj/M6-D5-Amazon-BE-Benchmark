import mongoose from "mongoose";
const { Schema, model } = mongoose;
const uploadSchema = new Schema({
  imgURL: String,
});
export default model("Upload", uploadSchema);