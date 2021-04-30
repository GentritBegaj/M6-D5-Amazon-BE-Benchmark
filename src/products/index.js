import { Router } from "express";
import ProductModel from "./schema.js";
import ReviewModel from "../reviews/schema.js";
import mongoose from "mongoose";
import q2m from "query-to-mongo";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const { total, products } = await ProductModel.findProducts(query);
    res.send({ links: query.links("/products", total), products });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductModel.findProduct(req.params.productId);
    res.send(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductModel(req.body);
    const product = await newProduct.save();
    res.status(201).send(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:productId", async (req, res, next) => {
  try {
    const modifiedProduct = await ProductModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { runValidators: true, new: true }
    );
    if (modifiedProduct) {
      res.send(modifiedProduct);
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

router.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(
      req.params.productId
    );
    if (deletedProduct) {
      res.status(204).send("Product deleted!");
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

// *******************************Reviews routes *********************************

router.get("/:productId/reviews", async (req, res, next) => {
  try {
    const { reviews } = await ProductModel.findById(req.params.productId);
    res.send(reviews);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:productId/reviews/reviewId", async (req, res, next) => {
  try {
    const { reviews } = await ProductModel.findOne(
      {
        _id: req.params.productId,
      },
      {
        reviews: {
          $elemMatch: { _id: req.params.reviewId },
        },
      }
    );
    if (reviews && reviews.length > 0) {
      res.send(reviews[0]);
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

router.post("/:productId", async (req, res, next) => {
  try {
    const newReview = new ReviewModel(req.body);
    const review = { ...newReview.toObject() };
    await ProductModel.findByIdAndUpdate(
      req.params.productId,
      {
        $push: {
          reviews: { ...review, createdAt: new Date(), updatedAt: new Date() },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    res.send(review);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedProduct = await ProductModel.findOneAndUpdate(
      {
        _id: req.params.productId,
        "reviews._id": req.params.reviewId,
      },
      {
        $set: {
          "reviews.$": {
            ...req.body,
            _id: req.params.reviewId,
            updatedAt: new Date(),
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (modifiedProduct) {
      res.send(modifiedProduct);
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

router.delete("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedProduct = await ProductModel.findByIdAndUpdate(
      {
        _id: req.params.productId,
      },
      {
        $pull: {
          reviews: { _id: req.params.reviewId },
        },
      },
      {
        new: true,
      }
    );
    if (modifiedProduct) {
      res.send("Review deleted");
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

export default router;
