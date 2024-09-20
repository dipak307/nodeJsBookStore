const express = require("express");
const validateToken = require("../middleware/middleware");
const Book = require("../models/books");
const Cart = require("../models/cart"); // Import Cart model to handle cart data
const Order=require("../models/Order");
const staticRouter = express.Router();

// Register page route
staticRouter.get("/register", (req, res) => {
    res.render("index", { message: "" });
});

// Login page route
staticRouter.get('/login', (req, res) => {
    res.render('login', { message: "" });
});

// Logout route
staticRouter.get('/logout', (req, res) => {
    // Clear the JWT token cookie
    res.clearCookie('token'); // assuming 'token' is the name of your cookie

    // Redirect to login page after logout
    res.redirect('/login');
});

// Add new book page route
staticRouter.get("/add/new", (req, res) => {
    res.render("addBook");
});

// Home page route with token validation
staticRouter.get('/', validateToken, async (req, res) => {
    try {
        const books = await Book.find();
        const cart = await Cart.findOne({ user: req.user._id });
        const cartCount = cart ? cart.items.length : 0; // Make sure cartCount is defined
 
        res.render('home', { books, user: req.user, cartCount }); // Pass cartCount to the view
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
 });
 

// Cart page route with token validation
staticRouter.get('/cart', validateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        const books = await Book.find({ '_id': { $in: cart.items.map(item => item.bookId) } });
        const cartCount = cart ? cart.items.length : 0; // Calculate cartCount here as well
 
        res.render('cart', { books, cart: cart.items, cartCount }); // Pass cartCount to the cart view
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
 });
 
 staticRouter.get('/order-history',validateToken, async (req, res) => {
    const userId = req.user.id; // assuming user is logged in
  
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  
    res.render('order-history', { orders });
  });

  /// order success

  staticRouter.get('/order-success',validateToken,async (req, res) => {
    const userId = req.user.id; 
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.render('order-success', { orders });
  });


  
module.exports = staticRouter;


