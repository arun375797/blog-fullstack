const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  name: String,
  description: String,
  link: String,
});

const BlogModel = mongoose.model("blogs", BlogSchema);

module.exports = BlogModel;
