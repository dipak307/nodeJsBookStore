const jwt = require('jsonwebtoken');

const validateToken = async (req, res, next) => {
    // Retrieve the token from cookies
    console.log(req.cookies);
    const token = req.cookies.token;
    
    // Check if the token exists
    if (!token) {
        return res.status(401).redirect("/login")
        // return res.status(401).json({ message: "No token provided please login first http://localhost:5000/login" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = validateToken;
