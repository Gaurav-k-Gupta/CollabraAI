import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// Validation middleware to handle errors
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

router.post('/create',
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Project name must be between 2 and 50 characters long')
            .matches(/^[a-zA-Z0-9\s\-_]+$/)
            .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters')
    ],
    handleValidationErrors,
    authMiddleware.authUser,
    projectController.createProject
);

router.get('/all',
    authMiddleware.authUser,
    projectController.getAllProject
);

router.put('/add-user',
    [
        body('projectId')
            .notEmpty()
            .withMessage('Project ID is required')
            .isMongoId()
            .withMessage('Project ID must be a valid MongoDB ObjectId'),
        
        body('users')
            .isArray({ min: 1 })
            .withMessage('Users must be a non-empty array')
            .custom((users) => {
                return users.every(userObj => {
                    return typeof userObj === 'object' && 
                           userObj.user && 
                           typeof userObj.user === 'string' &&
                           (!userObj.role || ['owner', 'admin', 'member', 'viewer'].includes(userObj.role.toLowerCase()));
                });
            })
            .withMessage('Each user must be an object with a valid user ID and optional role (owner, admin, member, viewer)')
    ],
    handleValidationErrors,
    authMiddleware.authUser,
    projectController.addUserToProject
);

router.get('/get-project/:projectId',
    [
        param('projectId')
            .notEmpty()
            .withMessage('Project ID is required')
            .isMongoId()
            .withMessage('Project ID must be a valid MongoDB ObjectId')
    ],
    handleValidationErrors,
    authMiddleware.authUser,
    projectController.getProjectById
);

// Additional route for removing users from project
router.put('/remove-user',
    [
        body('projectId')
            .notEmpty()
            .withMessage('Project ID is required')
            .isMongoId()
            .withMessage('Project ID must be a valid MongoDB ObjectId'),
        
        body('userId')
            .notEmpty()
            .withMessage('User ID is required')
            .isMongoId()
            .withMessage('User ID must be a valid MongoDB ObjectId')
    ],
    handleValidationErrors,
    authMiddleware.authUser,
    projectController.removeUserFromProject
);

// Route for updating project details
router.put('/update/:projectId',
    [
        param('projectId')
            .notEmpty()
            .withMessage('Project ID is required')
            .isMongoId()
            .withMessage('Project ID must be a valid MongoDB ObjectId'),
        
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Project name must be between 2 and 50 characters long')
            .matches(/^[a-zA-Z0-9\s\-_]+$/)
            .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters')
    ],
    handleValidationErrors,
    authMiddleware.authUser,
    projectController.updateProject
);

// Route for updating user role in project
router.put('/update-user-role',
    [
        body('projectId')
            .notEmpty()
            .withMessage('Project ID is required')
            .isMongoId()
            .withMessage('Project ID must be a valid MongoDB ObjectId'),
        
        body('userId')
            .notEmpty()
            .withMessage('User ID is required')
            .isMongoId()
            .withMessage('User ID must be a valid MongoDB ObjectId'),
        
        body('role')
            .trim()
            .toLowerCase()
            .isIn(['owner', 'admin', 'member', 'viewer'])
            .withMessage('Role must be one of: owner, admin, member, viewer')
    ],
    handleValidationErrors,
    authMiddleware.authUser,
    projectController.updateUserRole
);

export default router;