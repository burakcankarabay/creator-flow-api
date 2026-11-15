import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Oturum açmanız gerekiyor (Token bulunamadı)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "Bu tokena ait kullanıcı artık mevcut değil" });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Geçersiz veya süresi dolmuş oturum" });
  }
};
