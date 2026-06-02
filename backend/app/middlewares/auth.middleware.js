import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided"
      });
    }

    // 2. Verify custom JWT using your secret key
    // Make sure JWT_SECRET is defined in your backend .env file
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid or expired token"
        });
      }

      // 3. Attach the decrypted user data (e.g., id, role) to the request object
      req.user = decoded; 
      next();
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export default verifyToken;