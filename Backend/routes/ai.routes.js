import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";

const router = Router();




router.get( '/get-response' , aiController.getAiResponse );





export default router;