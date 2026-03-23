import supabase from '../config/db.js';

export const getAllUsersService = async () => {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    return users;
};

export const getUserByIdService = async (id) => {
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error) throw error;
    return data.user;
};

export const createUserService = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: metadata,
        email_confirm: true 
    });
    if (error) throw error;
    return data.user;
};

export const updateUserService = async (id, updates) => {
    const { data, error } = await supabase.auth.admin.updateUserById(id, updates);
    if (error) throw error;
    return data.user;
};

export const deleteUserService = async (id) => {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
    return true; 
};