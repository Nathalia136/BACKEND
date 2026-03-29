import { TOKEN_SECRET } from "../config.js";
import jwt from "jsonwebtoken";

export const authRequired = (req, res, next) => {
  // Leer token del header Authorization O de la cookie
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    // Formato: "Bearer eyJhbG..."
    token = req.headers.authorization.split(" ")[1];
  }

  console.log("token:", token);

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};