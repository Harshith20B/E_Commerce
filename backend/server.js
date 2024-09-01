// const express = require('express');
// const path = require('path');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoStore = require('connect-mongo'); // To store session data in MongoDB
// const User = require('./models/User'); // Import the User model
// const Product = require('./models/Product'); // Import the Product model
// const Wishlist = require('./models/Wishlist'); // Import the Wishlist model
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, '../frontend/public')));

// // Set EJS as the view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '../frontend/views'));

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true, // This is deprecated and can be removed
//   useUnifiedTopology: true, // This is deprecated and can be removed
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));
// // Utility function to format price
// function formatPrice(price) {
//   return `$${(price / 100).toFixed(2)}`;
// }

// // Set up session management
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'secret',
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
// }));

// // Utility function to format price
// function formatPrice(price) {
//   return `$${(price / 100).toFixed(2)}`;
// }

// // Example route for the homepage
// app.get('/', (req, res) => {
//   res.render('pages/index', { 
//     title: 'Home',
//     user: req.session.userId // Pass user information
//   });
// });

// app.get('/products', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.render('pages/product', {
//       title: 'Products',
//       products: products,
//       formatPrice: formatPrice,
//       user: req.session.userId // Pass user information
//     });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).send('Server error');
//   }
// });

// app.get('/login', (req, res) => {
//   if (req.session.userId) {
//     return res.redirect('/');
//   }
//   res.render('pages/login', { title: 'Login' });
// });

// // Ensure other routes pass `user` as well
// // Route to fetch and display product details
// app.get('/product/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Fetch product by ID from the database
//     const product = await Product.findById(id);
    
//     if (!product) {
//       return res.status(404).send('Product not found');
//     }

//     res.render('pages/product-detail', {
//       title: 'Product Detail',
//       product: product,
//       formatPrice: formatPrice,
//       user: req.session.userId // Pass the user ID or user object
//     });
//   } catch (error) {
//     console.error('Error fetching product details:', error);
//     res.status(500).send('Server error');
//   }
// });

// // Handle login form submission
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user || user.password !== password) {
//       return res.status(400).send('Invalid email or password');
//     }

//     // Set user ID in session
//     req.session.userId = user._id;
//     res.redirect('/');
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).send('Server error');
//   }
// });

// // Example route for signup page
// app.get('/signup', (req, res) => {
//   if (req.session.userId) {
//     return res.redirect('/');
//   }
//   res.render('pages/signup', { title: 'Signup' });
// });

// // Handle signup form submission
// app.post('/signup', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).send('User already exists');
//     }

//     user = new User({ name, email, password });
//     await user.save();
//     res.redirect('/login');
//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(500).send('Server error');
//   }
// });

// app.get('/wishlist', async (req, res) => {
//   try {
//     const userId = req.session.userId; // Ensure this is set correctly when the user logs in
    
//     if (!userId) {
//       return res.redirect('/login'); // Redirect to login if the user is not logged in
//     }

//     // Fetch the user's wishlist and populate the products field
//     const wishlist = await Wishlist.findOne({ userId }).populate('products').exec();

//     if (!wishlist) {
//       return res.render('pages/wishlist', {
//         title: 'Wishlist',
//         wishlist: [],
//         formatPrice: formatPrice, // Ensure this is passed
//         user: userId,
//       });
//     }

//     // Calculate total price
//     const totalPrice = wishlist.products.reduce((acc, product) => acc + product.price, 0);

//     res.render('pages/wishlist', {
//       title: 'Wishlist',
//       wishlist: wishlist.products, // Pass the populated products array
//       formatPrice: formatPrice, // Ensure this is passed
//       totalPrice: totalPrice, // Pass total price
//       user: userId
//     });
//   } catch (error) {
//     console.error('Error fetching wishlist:', error);
//     res.status(500).send('Server error');
//   }
// });

// // Handle adding product to wishlist
// app.post('/wishlist/add', async (req, res) => {
//   const { productId } = req.body;

//   try {
//     const userId = req.session.userId; // Ensure the user is logged in
//     if (!userId) {
//       return res.status(401).json({ message: 'User not authenticated' }); // Send JSON response
//     }

//     // Check if the wishlist exists for the user
//     let wishlist = await Wishlist.findOne({ userId });

//     if (!wishlist) {
//       // Create a new wishlist if it doesn't exist
//       wishlist = new Wishlist({ userId, products: [] });
//     }

//     // Check if the product is already in the wishlist
//     if (!wishlist.products.includes(productId)) {
//       wishlist.products.push(productId);
//       await wishlist.save(); // Save the updated wishlist to the database
//     }

//     // Send success response
//     res.json({ message: 'Product added to wishlist' });
//   } catch (error) {
//     console.error('Error adding product to wishlist:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// // Handle logging out
// app.get('/logout', (req, res) => {
//   req.session.destroy(err => {
//     if (err) {
//       console.error('Error destroying session:', err);
//       return res.status(500).send('Server error');
//     }
//     res.redirect('/');
//   });
// });

// // Search route to handle product search
// app.get('/search', async (req, res) => {
//   const { query } = req.query;

//   try {
//     // Find products that match the search query (case-insensitive)
//     const products = await Product.find({
//       name: { $regex: query, $options: 'i' }
//     });

//     res.render('pages/product', {
//       title: `Search results for "${query}"`,
//       products: products,
//       formatPrice: formatPrice,
//       user: req.session.userId // Pass user information
//     });
//   } catch (error) {
//     console.error('Error searching for products:', error);
//     res.status(500).send('Server error');
//   }
// });

// // Handle removing product from wishlist
// app.post('/wishlist/remove', async (req, res) => {
//   const { productId } = req.body;

//   try {
//     const userId = req.session.userId;
//     if (!userId) {
//       return res.status(401).send('User not authenticated');
//     }

//     // Find the wishlist for the user
//     const wishlist = await Wishlist.findOne({ userId });

//     if (wishlist) {
//       // Remove the product from the wishlist
//       wishlist.products.pull(productId);
//       await wishlist.save(); // Save the updated wishlist to the database
//     }

//     // Redirect back to the wishlist page
//     res.redirect('/wishlist');
//   } catch (error) {
//     console.error('Error removing product from wishlist:', error);
//     res.status(500).send('Server error');
//   }
// });


// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
