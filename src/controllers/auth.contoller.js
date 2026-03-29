
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../libs/jwt.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json(["The email is already in use"]);

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: passwordHash });
    const userSaved = await newUser.save();

    const token = await createAccessToken({ id: userSaved._id });

    // Cookie accesible entre la VM y Windows en red local
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,      // false porque usamos http (no https)
      sameSite: "lax",    // lax funciona en red local sin https
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      token, // también lo mandamos en el body por si acaso
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (!userFound)
      return res.status(400).json({ message: ["The email does not exist"] });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch)
      return res.status(400).json({ message: ["The password is incorrect"] });

    const token = await createAccessToken({
      id: userFound._id,
      username: userFound.username,
    });

    // Cookie accesible entre la VM y Windows en red local
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,      // false porque usamos http (no https)
      sameSite: "lax",    // lax funciona en red local sin https
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      token, // también lo mandamos en el body por si acaso
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(400).json({ message: "User not found" });
  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: new Date(0), // expira inmediatamente
  });
  return res.sendStatus(200);
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  console.log(token);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "UNAUTHORIZED" });
    const userFound = await User.findById(user.id);
    if (!userFound) return res.status(401).json({ message: "UNAUTHORIZED" });
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  });
};