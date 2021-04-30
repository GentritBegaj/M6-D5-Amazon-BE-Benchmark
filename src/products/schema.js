import mongoose from "mongoose";
import { ReviewSchema } from "../reviews/schema.js";

const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    reviews: [ReviewSchema],
  },
  { timestamps: true }
);

ProductSchema.static("findProduct", async function (id) {
  const product = this.findById(id);
  return product;
});

ProductSchema.static("findProducts", async function (query) {
  const total = await this.countDocuments(query.criteria);

  const products = await this.find(query.criteria, query.options.fields)
    .skip(query.options.skip)
    .limit(query.options.limit)
    .sort(query.options.sort);
  return { total, products };
});

export default model("Product", ProductSchema);
