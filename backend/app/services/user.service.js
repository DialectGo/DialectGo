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

export const getStreakInfo = async (userId) => {
  // Always recalculate to ensure accuracy based on historical data
  return await UserModel.calculateAndSyncStreak(userId);
};

export const refreshStreak = async (userId) => {
  return await UserModel.calculateAndSyncStreak(userId);
};

export const updateStreakStatus = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Count translations for the user today
  const { count, error } = await supabase
    .from('translation_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`);

  if (error) throw error;

  // 2. If threshold (3) is met, update the profile streak
  if (count === 3) {
    // We only increment once per day when they hit exactly 3
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count')
      .eq('id', userId)
      .single();

    await supabase
      .from('profiles')
      .update({ streak_count: (profile.streak_count || 0) + 1 })
      .eq('id', userId);
  }
};

export const loginAsGuest = async () => {
  return await UserModel.loginAsGuest();
};

export const adminLogin = async (email, password) => {
  // 1. Authenticate credentials against Supabase Auth
  const sessionData = await UserModel.loginUser(email, password);
  const userId = sessionData.user.id;

  // 2. Query the profile row to verify application permissions
  const profile = await UserModel.getProfileById(userId);

  // 3. Enforce strict role check
  if (!profile || profile.role !== 'admin') {
    throw new Error('Access Denied: You do not have administrative privileges.');
  }

  // 4. Return the fully signed JWT session tokens
  return {
    user: {
      id: profile.id,
      email: sessionData.user.email,
      role: profile.role,
      username: profile.username
    },
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_in: sessionData.session.expires_in
    }
  };
};