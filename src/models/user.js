"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load variables from .env
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));
// Define schema with types and validation
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    }
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
