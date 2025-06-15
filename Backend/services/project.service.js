import mongoose from "mongoose";
import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";

export const createProject = async ({
    name, description = '', userId
}) => {
    if (!name) {
        throw new Error('Project name is required');
    }
    if (!userId) {
        throw new Error('User ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
    }

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Create project with user as owner
    const project = await projectModel.create({
        name: name.toLowerCase().trim(),
        description: description.trim(),
        users: [
            {
                user: userId,
                role: 'owner'
            }
        ]
    });

    // Populate user details before returning
    await project.populate('users.user', 'name email');
    
    return project;
}

export const getAllProjectByUserId = async ({
    userId
}) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
    }

    const allUserProjects = await projectModel.find({
        'users.user': userId
    })
    .populate('users.user', 'name email')
    .sort({ updatedAt: -1 });

    return allUserProjects;
}

export const addUsersToProject = async ({
    projectId, users, userId
}) => {
    if (!projectId) {
        throw new Error('Project ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID');
    }
    if (!userId) {
        throw new Error('User ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
    }
    if (!users || !Array.isArray(users) || users.length === 0) {
        throw new Error('Users array is required and must not be empty');
    }

    // Validate users array structure
    for (const userObj of users) {
        if (!userObj.user || !mongoose.Types.ObjectId.isValid(userObj.user)) {
            throw new Error('Invalid user ID in users array');
        }
    }

    // Check if requesting user belongs to project and has permission
    const project = await projectModel.findById(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const requestingUser = project.users.find(u => 
        u.user.toString() === userId.toString()
    );

    if (!requestingUser) {
        throw new Error('You do not belong to this project');
    }

    if (!['owner', 'admin'].includes(requestingUser.role)) {
        throw new Error('You do not have permission to add users to this project');
    }

    // Verify all users exist
    const userIds = users.map(u => u.user);
    const existingUsers = await userModel.find({
        _id: { $in: userIds }
    });

    if (existingUsers.length !== userIds.length) {
        throw new Error('One or more users not found');
    }

    // Prepare users to add (exclude already existing users)
    const existingUserIds = project.users.map(u => u.user.toString());
    const newUsers = users.filter(u => !existingUserIds.includes(u.user.toString()));

    if (newUsers.length === 0) {
        throw new Error('All users are already in the project');
    }

    // Set default role to 'member' if not specified
    const usersToAdd = newUsers.map(u => ({
        user: u.user,
        role: u.role ? u.role.toLowerCase() : 'member'
    }));

    const updatedProject = await projectModel.findByIdAndUpdate(
        projectId,
        {
            $push: {
                users: { $each: usersToAdd }
            }
        },
        { new: true }
    ).populate('users.user', 'name email');

    return updatedProject;
}

export const getProjectById = async ({
    projectId, userId
}) => {
    if (!projectId) {
        throw new Error('Project ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID');
    }

    const project = await projectModel.findById(projectId)
        .populate('users.user', 'name email');

    if (!project) {
        throw new Error('Project not found');
    }

    // Check if user has access to this project
    if (userId) {
        const userInProject = project.users.find(u => 
            u.user._id.toString() === userId.toString()
        );
        if (!userInProject) {
            throw new Error('Access denied');
        }
    }

    return project;
}

export const removeUserFromProject = async ({
    projectId, userIdToRemove, requestingUserId
}) => {
    if (!projectId || !userIdToRemove || !requestingUserId) {
        throw new Error('Project ID, user ID to remove, and requesting user ID are required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || 
        !mongoose.Types.ObjectId.isValid(userIdToRemove) || 
        !mongoose.Types.ObjectId.isValid(requestingUserId)) {
        throw new Error('Invalid ID format');
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const requestingUser = project.users.find(u => 
        u.user.toString() === requestingUserId.toString()
    );

    if (!requestingUser) {
        throw new Error('Access denied');
    }

    // Only owners and admins can remove users
    if (!['owner', 'admin'].includes(requestingUser.role)) {
        throw new Error('You do not have permission to remove users');
    }

    const userToRemove = project.users.find(u => 
        u.user.toString() === userIdToRemove.toString()
    );

    if (!userToRemove) {
        throw new Error('User not found in project');
    }

    // Prevent removing the last owner
    const owners = project.users.filter(u => u.role === 'owner');
    if (userToRemove.role === 'owner' && owners.length === 1) {
        throw new Error('Cannot remove the last owner from the project');
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
        projectId,
        {
            $pull: {
                users: { user: userIdToRemove }
            }
        },
        { new: true }
    ).populate('users.user', 'name email');

    return updatedProject;
}

export const updateProject = async ({
    projectId, updateData, userId
}) => {
    if (!projectId || !userId) {
        throw new Error('Project ID and user ID are required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || 
        !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid ID format');
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const user = project.users.find(u => 
        u.user.toString() === userId.toString()
    );

    if (!user) {
        throw new Error('Access denied');
    }

    // Only owners and admins can update project details
    if (!['owner', 'admin'].includes(user.role)) {
        throw new Error('You do not have permission to update this project');
    }

    // Clean and validate update data
    const cleanUpdateData = {};
    if (updateData.name) {
        cleanUpdateData.name = updateData.name.toLowerCase().trim();
    }
    if (updateData.description !== undefined) {
        cleanUpdateData.description = updateData.description.trim();
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
        projectId,
        cleanUpdateData,
        { new: true, runValidators: true }
    ).populate('users.user', 'name email');

    return updatedProject;
}

export const updateUserRole = async ({
    projectId, userId, role, requestingUserId
}) => {
    if (!projectId || !userId || !role || !requestingUserId) {
        throw new Error('All fields are required');
    }

    if (!['owner', 'admin', 'member', 'viewer'].includes(role.toLowerCase())) {
        throw new Error('Invalid role specified');
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const requestingUser = project.users.find(u => 
        u.user.toString() === requestingUserId.toString()
    );

    if (!requestingUser || !['owner', 'admin'].includes(requestingUser.role)) {
        throw new Error('Access denied');
    }

    const userToUpdate = project.users.find(u => 
        u.user.toString() === userId.toString()
    );

    if (!userToUpdate) {
        throw new Error('User not found in project');
    }

    // Prevent removing the last owner
    if (userToUpdate.role === 'owner' && role.toLowerCase() !== 'owner') {
        const owners = project.users.filter(u => u.role === 'owner');
        if (owners.length === 1) {
            throw new Error('Cannot change role of the last owner');
        }
    }

    const updatedProject = await projectModel.findOneAndUpdate(
        { 
            _id: projectId, 
            'users.user': userId 
        },
        { 
            $set: { 
                'users.$.role': role.toLowerCase() 
            }
        },
        { new: true }
    ).populate('users.user', 'name email');

    return updatedProject;
}