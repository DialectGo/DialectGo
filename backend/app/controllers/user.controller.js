import * as UserService from '../services/user.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await UserService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const session = await UserService.login(
      req.body.email,
      req.body.password
    );
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await UserService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getStreakData = async (req, res, next) => {
  try {
    const data = await UserService.getStreakInfo(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ADMIN
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const loginGuest = async (req, res, next) => {
  try {
    const session = await UserService.loginAsGuest();
    res.json({ 
      success: true, 
      message: "Guest session initialized", 
      data: session 
    });
  } catch (err) {
    next(err);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const adminSession = await UserService.adminLogin(
      req.body.email,
      req.body.password,
      req
    );
    
    // Return the session tokens cleanly to your React frontend workspace
    res.json({ 
      success: true, 
      message: "Administrative portal authentication verified successfully.",
      data: adminSession 
    });
  } catch (err) {
    // If the role check failed, explicitly flag it as an authentication barrier
    if (err.message.includes('Access Denied')) {
      return res.status(403).json({ success: false, message: err.message });
    }
    next(err);
  }
};