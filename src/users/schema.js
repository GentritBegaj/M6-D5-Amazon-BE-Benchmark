import mongoose from "mongoose";
const { Schema, model } = mongoose;
const UserSchema = new Schema(
  {
    name: String,
    surname: String,
    email: String,
    age: Number,
    cart: { type: Schema.Types.ObjectId, ref: "Cart" },
  },
  { timestamps: true }
);

UserSchema.post("validate", function (error, doc, next) {
  if (error) {
    error.httpStatusCode = 400;
    next(error);
  } else {
    next();
  }
});

export default model("User", UserSchema);
