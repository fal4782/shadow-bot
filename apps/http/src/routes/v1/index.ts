import { Router } from "express";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { meetingRouter } from "./meeting";

const router: Router = Router();

router.get("/status", (_req, res) => {
  res.json({ status: "API is running" });
});

router.use("/auth", authRouter);
router.use("/chat", chatRouter);
router.use("/meeting", meetingRouter);

export { router as v1Router };
