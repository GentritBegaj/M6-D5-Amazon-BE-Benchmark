import { Router } from "express";
import UserModel from "./schema.js";
// import UploadModel from "./uploadschema.js";
import q2m from "query-to-mongo";
// import cloudinary from "cloudinary";
// import formidable from "formidable"
const router = Router();
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });

// router.post("/uploadUser", async (res, req, next) => {
//   const userImage = new UploadModel(req.body);
//   console.log(userImage);
//   const result = await cloudinary.v2.uploader(req.file.path);
//   userImage.imgURL = result.secure_url;
//   await userImage.save();
//   res.send({ message: "Image is uploaded" });
// });

router.post("/", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);

    console.log(newUser);

    const { _id } = await newUser.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await UserModel.countDocuments(query.criteria);

    const users = await UserModel.find(query.criteria, query.options.fields)
      .populate("cart")
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort);
    res.send({ links: query.links("/users", total), users });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const modifiedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (modifiedUser) {
      res.send(modifiedUser);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (user) {
      res.send({ message: "User has been deleted from DB" });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default router;
