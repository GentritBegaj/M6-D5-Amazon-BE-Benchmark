import { Router } from "express";

import CartModel from "./schema.js";
import ProductModel from "../products/schema.js";

const router = Router();

router.post("/:userId/addProduct", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.body._id);
    if (product) {
      const productToAdd = {
        ...product.toObject(),
      };

      const isProductThere = await CartModel.findProductInCart(
        req.params.userId,
        req.body._id
      );
      console.log(isProductThere);
      if (isProductThere) {
        await CartModel.incrementQuantity(req.params.userId, req.body._id);
        res.send("Quantity incremented");
      } else {
        await CartModel.addProductToCart(req.params.userId, {
          ...productToAdd,
          quantity: 1,
        });
        res.send("New product added");
      }
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/:userId/removeProduct", async (req, res, next) => {
  try {
    await CartModel.removeProductFromCart(req.params.userId, req.body._id);
    res.send("Product removed from cart");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:userId/total", async (req, res, next) => {
  try {
    await CartModel.calculateCartTotal(req.params.userId);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default router;
