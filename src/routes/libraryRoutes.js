import { Router } from "express";
import { getLibrary } from "../controllers/libraryController.js";
const router = Router();

router.get("/", getLibrary);

export default router;
