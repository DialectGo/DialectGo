import * as UserModel from '../models/user.model.js';

export const register = async (data) => {
  return await UserModel.registerUser(data);
};

export const login = async (email, password) => {
  return await UserModel.loginUser(email, password);
};

export const getProfile = async (userId) => {
  return await UserModel.getProfileById(userId);
};

export const updateProfile = async (userId, data) => {
  return await UserModel.updateProfileById(userId, data);
};

export const getAllUsers = async () => {
  return await UserModel.getAllUsers();
};

export const getUserById = async (id) => {
  return await UserModel.getUserById(id);
};

export const updateUser = async (id, data) => {
  return await UserModel.updateUser(id, data);
};

export const deleteUser = async (id) => {
  return await UserModel.deleteUser(id);
};