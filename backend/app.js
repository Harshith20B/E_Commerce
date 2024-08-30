const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));

// Example route for the homepage
app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Home' });
});

// Example route for the products page
app.get('/products', (req, res) => {
  // Fetch products from the database
  // Example static products
  const products = [
    { _id: '1', name: 'Product 1', description: 'Description 1', price: 1999 },
    { _id: '2', name: 'Product 2', description: 'Description 2', price: 2999 },
  ];
  res.render('pages/product', { title: 'Products', products: products });
});

// Example route for product detail
app.get('/product/:id', (req, res) => {
  const product = { name: 'Product 1', description: 'Description 1', price: 1999 }; // Replace with actual product data
  res.render('pages/product-detail', { title: 'Product Detail', product: product });
});

// Example route for login page
app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

// Example route for signup page
app.get('/signup', (req, res) => {
  res.render('pages/signup', { title: 'Signup' });
});

// Example route for wishlist page
app.get('/wishlist', (req, res) => {
  const wishlist = [
    { product: { _id: '1', name: 'Product 1' } },
    { product: { _id: '2', name: 'Product 2' } },
  ]; // Replace with actual wishlist data
  res.render('pages/wishlist', { title: 'Wishlist', wishlist: wishlist });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
