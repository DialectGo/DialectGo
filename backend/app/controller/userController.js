import * as UserModel from '../models/userModel.js';

/**
 * Centralized response handler for consistent API output
 */
const handleResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        status: statusCode,
        message,
        data,
    });
};

// --- AUTHENTICATION ---

export const register = async (req, res, next) => {
    try {
        const { 
            email, 
            password, 
            firstName, 
            lastName,
            middleName,
            birthDate,
            addressLine,
            country,
            province,
            city,
            username,
            preferredLanguageCode
        } = req.body;

        const user = await UserModel.registerUser(email, password, { 
            firstName, 
            lastName,
            middleName,
            birthDate,
            addressLine,
            country,
            province,
            city,
            username,
            preferredLanguageCode
        });

        handleResponse(res, 201, "Registration successful", user);
    } catch (err) { 
        next(err); 
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const session = await UserModel.loginUser(email, password);
        handleResponse(res, 200, "Login successful", session);
    } catch (err) { next(err); }
};

// --- USER PROFILE (Authenticated User) ---

export const getProfile = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization.split(' ')[1];
        const profile = await UserModel.getProfileById(req.user.id, token);
        handleResponse(res, 200, "Profile fetched successfully", profile);
    } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
    try {
        const updatedProfile = await UserModel.updateProfileById(req.user.id, req.body);
        handleResponse(res, 200, "Profile updated successfully", updatedProfile);
    } catch (err) { next(err); }
};

// --- ADMIN CRUD FUNCTIONS ---

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.getAllUsersService();
        handleResponse(res, 200, "Users retrieved successfully", users);
    } catch (err) { next(err); }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await UserModel.getUserByIdService(req.params.id);
        handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
    try {
        const updatedUser = await UserModel.updateUserService(req.params.id, req.body);
        handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
    try {
        await UserModel.deleteUserService(req.params.id);
        handleResponse(res, 200, "User deleted successfully");
    } catch (err) { next(err); }
};