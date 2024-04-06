const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/User");
const BlogModel = require("./models/Blog");

const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

//for deployment
app.use(express.static(path.join(__dirname, "/build")));

function verifytoken(req, res, next) {
  const token = req.headers.token;
  try {
    if (!token) throw "unauthorized access";
    let payload = jwt.verify(token, "reactblogapp");
    if (!payload) throw "unauthorized access";
    next();
  } catch (error) {
    res.status(401).send("Unauthorized Access");
  }
}

mongoose
  .connect(
    "mongodb+srv://arun:life@cluster0.acjyovk.mongodb.net/blogsign?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// posting user details
app.post("/signup", async (req, res) => {
  try {
    const user = await UserModel.create(req.body);
    res.json(user);
  } catch (err) {
    console.error("Error occurred while signing up:", err);
    res.status(400).json(err);
  }
});

//login verification
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username: username });
    if (user) {
      if (user.password === password) {
        // Create token payload
        const payload = { userId: user._id };
        // Sign token
        const token = jwt.sign(payload, "reactblogapp");
        // Send token in response
        res.json({ message: "Login successful", token });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } else {
      res.status(404).json({ message: "User is not registered" });
    }
  } catch (err) {
    console.error("Error occurred while logging in:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// display blogs
app.get("/blogs", verifytoken, async (req, res) => {
  try {
    const blogs = await BlogModel.find();
    res.json(blogs);
  } catch (err) {
    console.error("Error occurred while fetching blogs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//for update getting text field fill
app.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
    console.log("found");
  } catch (err) {
    console.error("Error occurred while fetching blog:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
//posting blog
app.post("/add", verifytoken, async (req, res) => {
  try {
    const blog = await BlogModel.create(req.body);
    res.json(blog);
  } catch (err) {
    console.error("Error occurred while saving blog:", err);
    res.status(400).json(err);
  }
});

//delete blog
app.delete("/blogs/:id", verifytoken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await BlogModel.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found!" });
    }
    res.json({ message: "Blog deleted successfully!" });
  } catch (err) {
    console.error("Error occurred while deleting blog:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
//for updating blog
app.put("/blogs/:id", verifytoken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, link } = req.body;
    const updatedBlog = await BlogModel.findByIdAndUpdate(
      id,
      { name, description, link },
      { new: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(updatedBlog);
  } catch (err) {
    console.error("Error occurred while updating blog:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/build/index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3001");
});
