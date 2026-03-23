// Standardized response function
import { 
    getAllUsersService, 
    getUserByIdService, 
    createUserService, 
    updateUserService, 
    deleteUserService 
} from '../models/userModel.js';

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

export async function getUserById(req, res, next) {
    const { id } = req.params; // Extracts the UUID from the URL path
    try {
        const user = await getUserByIdService(id);
        
        if (!user) {
            return handleResponse(res, 404, "User not found");
        }

        handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
        next(err);
    }
}

// CREATE
export async function createUser(req, res, next) {
    const { email, password, metadata } = req.body;
    try {
        const newUser = await createUserService(email, password, metadata);
        handleResponse(res, 201, "User created successfully", newUser);
    } catch (err) {
        next(err);
    }
}

// READ ALL
export async function getAllUsers(req, res, next) {
    try {
        const users = await getAllUsersService();
        handleResponse(res, 200, "Users fetched successfully", users);
    } catch (err) {
        next(err);
    }
}

// UPDATE
export async function updateUser(req, res, next) {
    const { id } = req.params; // Get ID from URL /api/users/:id
    const updates = req.body;  // Get update data from body
    try {
        const updatedUser = await updateUserService(id, updates);
        handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
        next(err);
    }
}

// DELETE
export async function deleteUser(req, res, next) {
    const { id } = req.params;
    try {
        await deleteUserService(id);
        handleResponse(res, 200, "User deleted successfully");
    } catch (err) {
        next(err);
    }
}