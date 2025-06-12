import projectModel from '../models/project.model.js'
import * as projectService from '../services/project.service.js'
import { validationResult } from 'express-validator';
import userModel from '../models/user.model.js';

export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const { name, description } = req.body;
        const loggedInUser = await userModel.findOne({ email : req.user.email });

        const userId = loggedInUser._id;

        // Check if project with same name already exists for this user
        const existingProject = await projectModel.findOne({
            name: name.toLowerCase(),
            'users.user': userId
        });

        if (existingProject) {
            return res.status(409).json({
                success: false,
                message: 'Project with this name already exists'
            });
        }

        const newProject = await projectService.createProject({ 
            name, 
            description: description || '', 
            userId 
        });

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: newProject
        });

    } catch (error) {
        console.error('Create project error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Project name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email : req.user.email });

        const userId = loggedInUser._id;

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId
        });

        res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            projects: allUserProjects,
            count: allUserProjects.length
        });

    } catch (error) {
        console.error('Get all projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await userModel.findOne({ email : req.user.email });

        const loggedInUserId = loggedInUser._id;

        // Check if user has permission to add users to this project
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const userInProject = project.users.find(u => 
            u.user.toString() === loggedInUserId.toString()
        );

        if (!userInProject || !['owner', 'admin'].includes(userInProject.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to add users to this project'
            });
        }

        const updatedProject = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUserId
        });

        return res.status(200).json({
            success: true,
            message: 'Users added to project successfully',
            project: updatedProject
        });

    } catch (error) {
        console.error('Add user to project error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const getProjectById = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const project = await projectService.getProjectById({ projectId, userId });

        return res.status(200).json({
            success: true,
            message: 'Project retrieved successfully',
            project
        });

    } catch (error) {
        console.error('Get project by ID error:', error);
        
        if (error.message === 'Project not found' || error.message === 'Access denied') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const removeUserFromProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const { projectId, userId } = req.body;
        const loggedInUserId = req.user._id;

        const updatedProject = await projectService.removeUserFromProject({
            projectId,
            userIdToRemove: userId,
            requestingUserId: loggedInUserId
        });

        res.status(200).json({
            success: true,
            message: 'User removed from project successfully',
            project: updatedProject
        });

    } catch (error) {
        console.error('Remove user from project error:', error);
        
        if (error.message === 'Project not found' || error.message === 'Access denied' || error.message === 'User not found in project') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const updateProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        const updatedProject = await projectService.updateProject({
            projectId,
            updateData,
            userId
        });

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project: updatedProject
        });

    } catch (error) {
        console.error('Update project error:', error);
        
        if (error.message === 'Project not found' || error.message === 'Access denied') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export const updateUserRole = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const { projectId, userId, role } = req.body;
        const requestingUserId = req.user._id;

        const updatedProject = await projectService.updateUserRole({
            projectId,
            userId,
            role,
            requestingUserId
        });

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            project: updatedProject
        });

    } catch (error) {
        console.error('Update user role error:', error);
        
        if (error.message === 'Project not found' || error.message === 'Access denied' || error.message === 'User not found in project') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}