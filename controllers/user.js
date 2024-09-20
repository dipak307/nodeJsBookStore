const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Book = require("../models/books");
const path = require("path");
const multer = require("multer");
const Cart = require("../models/cart");
const Order=require("../models/Order");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    cb(null, filename);
  }
});

module.exports.upload = multer({ storage: storage });

// User Signup Controller
module.exports.userSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let message;

    if (!username) {
      message = "Username is mandatory";
      return res.render('index', { message });
    }

    if (!email) {
      message = "Email is required";
      return res.render('index', { message });
    }

    if (!password) {
      message = "Password is required";
      return res.render('index', { message });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      message = "User already exists";
      return res.render('index', { message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(200).redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// User Login Controller
module.exports.getLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let message;

    if (!email) {
      message = "Email is required";
      return res.render("login", { message });
    }

    if (!password) {
      message = "Password is required";
      return res.render("login", { message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      message = "User not found";
      return res.render("login", { message });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      message = "Password does not match";
      return res.render("login", { message });
    }

    const token = jwt.sign(
      { email: user.email, username: user.username, id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    res.status(200).redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Add New Book Controller
module.exports.addNewBook = async (req, res) => {
  const { title, price, description, author } = req.body;

  if (!title || !price || !author) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const book = await Book.findOne({ title });
  if (book) {
    return res.render("addBook", { error: "Book already exists" });
  }

  const newBook = await Book.create({
    user: req.user._id,
    title,
    price,
    description,
    author,
    coverImage: `/uploads/${req.file.filename}`
  });

  res.status(201).json(newBook);
};

// Update Cart Quantity Controller
module.exports.updateQuantity = async (req, res) => {
  const { bookId, quantityChange } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      const item = cart.items.find(item => item.bookId.toString() === bookId);
      if (item) {
        item.quantity += parseInt(quantityChange, 10);
        if (item.quantity <= 0) {
          cart.items.pull({ bookId: item.bookId });
        }
        await cart.save();
      }
    }

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Remove Item from Cart Controller
module.exports.removeFromCart = async (req, res) => {
  const { bookId } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items.pull({ bookId });
      await cart.save();
    }

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


// Update Cart Using Session Controller
module.exports.updateCart = async (req, res) => {
  try {
    const { bookId, action } = req.body;

    // Assuming `validateToken` middleware attaches the user object to req
    const userId = req.user.id; // Ensure you use `_id` since MongoDB ObjectId is usually `_id`

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).send('Cart not found'); // Handle case where cart does not exist
    }

    // Check if the book is in the cart
    const item = cart.items.find(item => item.bookId.toString() === bookId);

    if (action === 'increase') {
      if (item) {
        item.quantity += 1; // Increase quantity
      }
    } else if (action === 'decrease') {
      if (item && item.quantity > 1) {
        item.quantity -= 1; // Decrease quantity if more than 1
      }
    } else if (action === 'remove') {
      cart.items = cart.items.filter(item => item.bookId.toString() !== bookId); // Remove item from cart
    }

    // Save the updated cart
    await cart.save();

    // Return the updated cart or a success message
    res.redirect("/cart"); // Optionally return the updated cart
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).send('Server error');
  }
};


// Add to Cart Controller 

module.exports.addToCart = async (req, res) => {
  try {
    const bookId = req.body.bookId;

    // Assuming `validateToken` middleware attaches the user object to req
    const userId = req.user.id; // Ensure you use `_id` since MongoDB ObjectId is usually `_id`
    
    if (!userId) {
      return res.status(400).send('User is not authenticated');
    }

    // Find the user's cart or create a new one if it doesn't exist
    let cart = await Cart.findOne({ user: userId });
    console.log(cart);
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Fetch the book details to get the title
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).send('Book not found');
    }

    // Check if the book is already in the cart
    const existingItem = cart.items.find(item => item.bookId.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += 1; // Increment the quantity if the book is already in the cart
    } else {
      // Add the book to the cart with an initial quantity of 1 and include the title
      cart.items.push({ bookId, title: book.title, quantity: 1,price:book.price,coverImage:book.coverImage }); // Include title here
    }

    // Save the updated cart
    await cart.save();

    // Redirect to the cart page after adding the book
    res.redirect('/cart');
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).send('Server error');
  }
};


// Home Page Controller
module.exports.homePage = async (req, res) => {
  try {
    const books = await Book.find();
    const cart = await Cart.findOne({ user: req.user._id });
    const cartCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
    
    res.render('home', { books, user: req.user, cartCount });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

//// place order code 

// In your controller (e.g., orderController.js)
module.exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id; // assuming user is logged in
       console.log(userId)
    // Fetch the cart associated with the user
    const cart = await Cart.findOne({ user:userId });
         console.log(cart);
    // If the cart is empty or doesn't exist
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Create a new order with the items from the cart
    const order = new Order({
      userId,
      items: cart.items.map(item => ({
        bookId: item.bookId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        coverImage:item.coverImage
      }))
    });

    // Save the new order to the database
    await order.save();

    // Clear the cart after the order is placed
    await Cart.updateOne({ userId }, { $set: { items: [] } });

    // Return a success message
    return res.status(200).json({ message: 'Order placed successfully!' });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'An error occurred while placing the order.' });
  }
};



