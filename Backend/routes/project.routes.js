import { Router } from 'express';
import {body} from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create' , 
    body('name').isString().withMessage('name must be a string!'),
    authMiddleware.authUser,
    projectController.createProject 
)

export default router;