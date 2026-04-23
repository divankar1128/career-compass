import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../users/user.model.js";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";
import { redis } from "../../config/redis.js";

const REFRESH_DENYLIST_PREFIX = "deny:rt:";

export const authService = {
  async register({ email, password, name }) {
    const existing = await User.findOne({ email });
    if (existing) throw new AppError("Email already registered", 409);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, name });
    return user;
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) throw new AppError("Invalid credentials", 401);
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError("Invalid credentials", 401);
    user.lastLoginAt = new Date();
    await user.save();
    return user;
  },

  issueTokens(user) {
    const payload = { sub: user._id.toString(), role: user.role, plan: user.plan };
    return { accessToken: signAccess(payload), refreshToken: signRefresh(payload) };
  },

  async rotateRefresh(token) {
    const decoded = verifyRefresh(token);
    const denied = await redis.get(`${REFRESH_DENYLIST_PREFIX}${decoded.jti || token}`);
    if (denied) throw new AppError("Refresh token revoked", 401);
    const user = await User.findById(decoded.sub);
    if (!user) throw new AppError("User not found", 401);
    // denylist old token until its natural expiry (best-effort)
    await redis.set(`${REFRESH_DENYLIST_PREFIX}${token}`, "1", "EX", 60 * 60 * 24 * 30);
    return this.issueTokens(user);
  },

  async logout(token) {
    if (token) await redis.set(`${REFRESH_DENYLIST_PREFIX}${token}`, "1", "EX", 60 * 60 * 24 * 30);
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return null; // don't reveal
    const raw = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(raw).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 30 * 60_000);
    await user.save();
    return raw; // in real life, email this
  },

  async resetPassword(rawToken, newPassword) {
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordHash");
    if (!user) throw new AppError("Invalid or expired token", 400);
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return user;
  },
};
