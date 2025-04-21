"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_1 = __importDefault(require("./models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // load .env variables
const app = (0, express_1.default)();
// Middleware setup
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // frontend URL
    credentials: true, // allow cookies to be sent
}));
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Route: Home
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Hello World!");
}));
// Route: Login
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_1.default.findOne({ email });
    if (!user) {
        res.status(400).send("User not found");
        return;
    }
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (isMatch) {
        const token = jsonwebtoken_1.default.sign({ email: user.email }, "secret", { expiresIn: "24h" });
        res.cookie("token", token);
        res.status(200).json({
            message: "Login successful",
            username: user.username, // 👈 directly send it
        });
    }
    else {
        res.status(401).send("Invalid credentials");
    }
}));
// Middleware: Check if logged in
function isloggedin(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(401).send("Not logged in");
        const data = jsonwebtoken_1.default.verify(token, "secret");
        req.user = data;
        next();
    }
    catch (err) {
        res.status(401).send("Invalid token");
    }
}
// Route: Register
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    const existingUser = yield user_1.default.findOne({ email });
    if (existingUser) {
        res.status(400).send("User already exists");
        return;
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    // Include username when creating user
    yield user_1.default.create({ email, password: hashedPassword, username });
    const token = jsonwebtoken_1.default.sign({ email }, "secret");
    res.cookie("token", token);
    res.status(200).send("Registration successful");
}));
// ✅ Fixed logout route
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});
// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
