import userModel from "../models/user.model.js";

export const createUser = async ({
    name, email, password, gender
}) => {
    // Validate required fields
    if (!name || !email || !password || !gender) {
        throw new Error('Name, email, password, and gender are required!');
    }

    // Validate email format (additional server-side validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format!');
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender.toLowerCase())) {
        throw new Error('Gender must be male, female, or other!');
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error('User already exists with this email!');
    }

    // Hash password
    const hashedPassword = await userModel.hashPassword(password);

    // Create user
    const user = await userModel.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        gender: gender.toLowerCase()
    });

    return user;
}

export const getAllUsers = async ({ userId }) => {
    if (!userId) {
        throw new Error('User ID is required!');
    }

    const users = await userModel.find({
        _id: { $ne: userId }
    }).select('-password'); // Exclude password from results

    return users;
}

