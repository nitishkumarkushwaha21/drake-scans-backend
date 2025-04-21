import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import User from "./models/user";

import dotenv from 'dotenv';
dotenv.config(); // load .env variables

const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL, // frontend URL
  credentials: true, // allow cookies to be sent
}));
app.use(bodyParser.urlencoded({ extended: true }));

// Route: Home
app.get("/", async (req, res) => {
  res.send("Hello World!");
});

// Route: Login
app.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).send("User not found");
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    const token = jwt.sign({ email: user.email }, "secret", { expiresIn: "24h" });
    res.cookie("token", token);
    res.status(200).json({
      message: "Login successful",
       username: user.username,// 👈 directly send it
      
    })
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Middleware: Check if logged in
function isloggedin(req: Request, res: Response, next: Function) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Not logged in");

    const data = jwt.verify(token, "secret");
    (req as any).user = data;
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
}

// Route: Register
app.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).send("User already exists");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Include username when creating user
  await User.create({ email, password: hashedPassword, username });

  const token = jwt.sign({ email }, "secret");
  res.cookie("token", token);
  res.status(200).send("Registration successful");
});

// ✅ Fixed logout route
app.get("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
