import mongoose from "mongoose";
import UserModel from "../users/schema.js";

const { Schema, model } = mongoose;

const CartSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    status: { type: String, enum: ["active", "paid"] },
  },
  { timestamps: true }
);

CartSchema.static("findProductInCart", async function (userId, productId) {
  const isProductThere = await this.findOne({
    ownerId: userId,
    "products._id": mongoose.Types.ObjectId(productId),
  });
  return isProductThere;
});

CartSchema.static("incrementQuantity", async function (userId, productId) {
  await this.findOneAndUpdate(
    {
      ownerId: mongoose.Types.ObjectId(userId),
      "products._id": mongoose.Types.ObjectId(productId),
    },
    {
      $inc: { "products.$.quantity": 1 },
    },
    {
      upsert: true,
    }
  );
});

CartSchema.static("addProductToCart", async function (userId, product) {
  const cart = await this.findOneAndUpdate(
    {
      ownerId: userId,
    },
    {
      $addToSet: {
        products: product,
      },
    },
    {
      upsert: true,
    }
  );
  await UserModel.findByIdAndUpdate(
    { _id: userId },
    {
      $set: {
        cart: cart,
      },
    },
    { runValidators: true, new: true }
  );
});

CartSchema.static("removeProductFromCart", async function (userId, productId) {
  await this.findByIdAndUpdate(
    {
      ownerId: userId,
      status: "active",
    },
    {
      $pull: {
        products: { _id: productId },
      },
    }
  );
});

CartSchema.static("calculateCartTotal", async function (userId) {
  const { products } = await this.findOne({
    ownerId: userId,
    status: "active",
  });
  const total = products
    .map((product) => product.price * product.quantity)
    .reduce((acc, cv) => acc + cv, 0);
  return total;
});

export default model("Cart", CartSchema);
