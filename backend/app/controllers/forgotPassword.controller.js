export const sendPasswordResetOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // This sends the OTP to the user's email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) return res.status(400).json({ success: false, message: error.message });

    return res.status(200).json({ 
      success: true, 
      message: "6-digit OTP has been sent to your email." 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery' // Crucial: use 'recovery' for password resets
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    // If successful, Supabase returns a session (access_token)
    return res.status(200).json({ 
      success: true, 
      message: "OTP Verified",
      token: data.session.access_token // Send this back to the app to authorize the password change
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  const { new_password } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  // This route should be protected by your auth middleware 
  // which sets req.user using the Supabase token

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: new_password
    }, { accessToken: token });

    if (error) return res.status(400).json({ success: false, message: error.message });

    return res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};