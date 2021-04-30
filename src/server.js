import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import productsRoutes from "./products/index.js";
import usersRoutes from "./users/index.js";
import cartsRoutes from "./carts/index.js";
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";

const server = express();
const port = process.env.PORT;

server.use(cors());
server.use(express.json());
server.use("/products", productsRoutes);
server.use("/users", usersRoutes);
server.use("/carts", cartsRoutes);

console.log(listEndpoints(server));

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(catchAllErrorHandler);

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      if (process.env.NODE_ENV === "production") {
        console.log("Server is running on cloud on port", port);
      } else {
        console.log(`Server is running on port ${port}`);
      }
    })
  )
  .catch((error) => console.log(error));
