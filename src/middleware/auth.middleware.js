import { UserRepository } from "../user/user.repository.js";
import { UserService } from "../user/user.service.js";

export async function authRequired(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await UserRepository.findById(req.session.userId);
  if (!user || user.deleted_at) {
    return res.status(401).json({ error: "Session invalid or user deleted" });
  }

  req.user = user;
  next();
}

export async function adminRequired(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await UserService.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.roleId !== 1) {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("adminRequired error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
