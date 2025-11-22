import { Router } from "express";
import { getUpcomingWaazi } from "../controllers/waaziController.js";
const router = Router();

router.get("/upcoming", getUpcomingWaazi);

export default router;
