import { authService } from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const authController = {
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    const tokens = authService.issueTokens(user);
    res.cookie("rt", tokens.refreshToken, cookieOpts);
    res.status(201).json({ user: sanitize(user), accessToken: tokens.accessToken });
  }),

  login: asyncHandler(async (req, res) => {
    const user = await authService.login(req.body);
    const tokens = authService.issueTokens(user);
    res.cookie("rt", tokens.refreshToken, cookieOpts);
    res.json({ user: sanitize(user), accessToken: tokens.accessToken });
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.rt || req.body?.refreshToken;
    const tokens = await authService.rotateRefresh(token);
    res.cookie("rt", tokens.refreshToken, cookieOpts);
    res.json({ accessToken: tokens.accessToken });
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.cookies?.rt);
    res.clearCookie("rt", { path: "/" });
    res.status(204).end();
  }),

  forgot: asyncHandler(async (req, res) => {
    const token = await authService.forgotPassword(req.body.email);
    // TODO: send email; returning token in dev only
    res.json({ ok: true, devToken: process.env.NODE_ENV === "production" ? undefined : token });
  }),

  reset: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ ok: true });
  }),

  me: asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
};

function sanitize(u) {
  return {
    id: u._id,
    email: u.email,
    name: u.name,
    role: u.role,
    plan: u.plan,
    onboarded: u.onboarded,
    avatarUrl: u.avatarUrl,
  };
}
