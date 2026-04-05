import { Router, Request, Response, NextFunction } from "express";
import { login, refresh, register } from "../controllers/auth.controller";

const router = Router();

function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: "Email, password and name are required for registration",
    });
  }
  next();
}

router.post("/register", validateRegister, register);
router.post("/login", login);
router.post("/refresh", refresh);

export default router;
