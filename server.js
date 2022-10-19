require("dotenv").config();
const config = require("./config");
const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const server = express();

server.use(cors({ origin: true, credentials: true }));
server.use(helmet());
server.use(express.json());
server.use(morgan("dev"));
server.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }),
);

mongoose
  .connect(`${config.DB_URI}`)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => console.log(error));

const usersRouter = require("./routes/userRoutes");
const categoriesRouter = require("./routes/categoryRoutes");
const businessRouter = require("./routes/businessRoutes");
const addressRouter = require("./routes/addressRoutes");
const likesRouter = require("./routes/likesRoutes");
const commentsRouter = require("./routes/commentsRoutes");
const offersRouter = require("./routes/offersRoutes");
const mediaRouter = require("./routes/mediaRoutes");
const reviewRouter = require("./routes/reviewRoutes");

server.use("/account", usersRouter);
server.use("/", categoriesRouter);
server.use("/", businessRouter);
server.use("/", addressRouter);
server.use("/", likesRouter);
server.use("/", commentsRouter);
server.use("/", offersRouter);
server.use("/", mediaRouter);
server.use("/", reviewRouter);

const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
