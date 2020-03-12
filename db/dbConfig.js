const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const connection = mongoose.connection;

module.exports = connection;
