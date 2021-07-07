import { Router } from "express";
import UserModel from "./schema.js";
import UploadModel from "./uploadschema.js";
import q2m from "query-to-mongo";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 } from "cloudinary";
import multer from "multer";
const router = Router();
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "strive",
  },
});

const uploader = multer({ storage: cloudinaryStorage });
console.log(uploader);
router.post("/upload", uploader.single("cover"), async (req, res, next) => {
  try {
    const newPic = req.file.path;

    const photoModel = new UploadModel();
    photoModel.imgURL = newPic;
    console.log(newPic);
    await photoModel.save();
    res.send(req.file.path);
  } catch (error) {
    next(error);
  }
});

router.get("/upload", async (req, res, next) => {
  try {
    const users = await UploadModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

router.get("/upload/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await UploadModel.findById(id);
    if (user) {
      res.send(user);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading users list a problem occurred!");
  }
});

router.delete("/upload/:id", async (req, res, next) => {
  try {
    const user = await UploadModel.findByIdAndDelete(req.params.id);
    if (user) {
      res.send({ message: "photo has been deleted from DB" });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

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
      .populate({ path: "cart", populate: { path: "products._id" } })
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
