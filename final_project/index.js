const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.session.authorization; // Retrieve the JWT from session

    if (!token) {
        // If no token is found in session, respond with an error
        return res.status(403).json({ message: "Access Denied: No Token Provided" });
    }

    // Verify the JWT token
    jwt.verify(token.accessToken, 'your_secret_key', (err, user) => {
        if (err) {
            // If the token is not valid, send a forbidden error
            return res.status(403).json({ message: "Invalid or Expired Token" });
        }

        // Attach user information to the request object to use in the next route
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
