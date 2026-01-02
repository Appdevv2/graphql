const express = require("express");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");
const { createHandler } = require("graphql-http/lib/use/express");
const auth = require("./middleware/auth");

const app = express();

app.use(bodyParser.json());

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    cb(null, safeTimestamp + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow access from any domain
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  ); // allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // allowed headers
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.use(auth);

app.use(
  "/graphql",
  createHandler({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,

    context: (req, res) => req,

    formatError: (err) => {
      if (!err.originalError) return err;
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.code || 500;
      return { message, status: code, data };
    },
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(3005, () => {
      console.log("server is running on the port 3005");
    });
  })
  .catch((err) => {
    console.log(err);
  });
