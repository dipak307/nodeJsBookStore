const express=require("express");
const router=express.Router();
const { userSignup, getLogin,addNewBook ,upload, updateQuantity, removeFromCart, placeOrder, updateCart, addToCart} = require("../controllers/user");

const validateToken = require("../middleware/middleware");


//routing 
router.post('/signup', userSignup);
router.post('/login',getLogin)
router.post("/book",validateToken,upload.single('coverImage'),addNewBook);
router.post("/update-quantity",validateToken,updateQuantity);
router.post("/remove-cart",validateToken,removeFromCart);
router.post("/update-cart",validateToken,updateCart);
router.post("/add-to-cart",validateToken,addToCart);
router.post("/order",validateToken,placeOrder);


module.exports=router;