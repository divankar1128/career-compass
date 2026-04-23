import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authRequired } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import { registerSchema, loginSchema, forgotSchema, resetSchema } from "./auth.validators.js";

/**
 * @openapi
 * tags: [{ name: Auth }]
 */
const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, validate(forgotSchema), authController.forgot);
router.post("/reset-password", authLimiter, validate(resetSchema), authController.reset);
router.get("/me", authRequired, authController.me);

export default router;
