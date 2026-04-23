import { verifyAccess } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../modules/users/user.model.js";

export async function authRequired(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new AppError("Missing access token", 401);
    const decoded = verifyAccess(token);
    const user = await User.findById(decoded.sub).select("_id email role plan");
    if (!user) throw new AppError("User no longer exists", 401);
    req.user = { id: user._id.toString(), email: user.email, role: user.role, plan: user.plan };
    next();
  } catch (e) {
    next(e instanceof AppError ? e : new AppError("Invalid or expired token", 401));
  }
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError("Forbidden", 403));
  next();
};

export const requirePlan = (...plans) => (req, _res, next) => {
  if (!req.user || !plans.includes(req.user.plan)) return next(new AppError("Upgrade required", 402));
  next();
};
