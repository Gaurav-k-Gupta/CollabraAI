import { Router } from "express";
import * as userController from '../controllers/user.controller.js';
import { body, validationResult } from "express-validator";
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();


const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

router.post('/register',
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters long')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name can only contain letters and spaces'),
        
        body('email')
            .trim()
            .isEmail()
            .withMessage('Email must be a valid email address')
            .isLength({ min: 6, max: 50 })
            .withMessage('Email must be between 6 and 50 characters long')
            .normalizeEmail(),
        
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        
        body('gender')
            .trim()
            .toLowerCase()
            .isIn(['male', 'female', 'other'])
            .withMessage('Gender must be either male, female, or other')
    ],
    handleValidationErrors,
    userController.createUserController
);

router.post('/login',
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Email must be a valid email address')
            .normalizeEmail(),
        
        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    handleValidationErrors,
    userController.loginController
);

router.get('/profile', 
    authMiddleware.authUser, 
    userController.profileController
);

router.get('/logout', 
    authMiddleware.authUser, 
    userController.logoutController
);

router.get('/all', 
    authMiddleware.authUser,
    userController.getAllUsersController
);

export default router;