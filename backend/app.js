const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // To store session data in MongoDB
const User = require('./models/User'); // Import the User model
const Product = require('./models/Product'); // Import the Product model
const Wishlist = require('./models/Wishlist'); // Import the Wishlist model
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set up session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
}));

// Utility function to format price
function formatPrice(price) {
  return `$${(price / 100).toFixed(2)}`;
}

// Example route for the homepage
app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Home' });
});

// Example route for the products page
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('pages/product', {
      title: 'Products',
      products: products,
      formatPrice: formatPrice,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

// Route to fetch and display product details
app.get('/product/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch product by ID from the database
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('pages/product-detail', {
      title: 'Product Detail',
      product: product,
      formatPrice: formatPrice,
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send('Server error');
  }
});


// Example route for login page
app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).send('Invalid email or password');
    }

    // Set user ID in session
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Server error');
  }
});

// Example route for signup page
app.get('/signup', (req, res) => {
  res.render('pages/signup', { title: 'Signup' });
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send('User already exists');
    }

    user = new User({ name, email, password });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Server error');
  }
});

// Example route for wishlist page
app.get('/wishlist', async (req, res) => {
  try {
    // Fetch the user's wishlist (assumes userId is available, e.g., from session)
    // Replace with actual user ID from session or authentication mechanism
    const userId = req.session.userId; // Ensure this is set correctly when the user logs in
    const wishlist = await Wishlist.findOne({ userId }).populate('products').exec();

    if (!wishlist) {
      return res.status(404).send('Wishlist not found');
    }

    res.render('pages/wishlist', {
      title: 'Wishlist',
      wishlist: wishlist.products,
      formatPrice: formatPrice,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).send('Server error');
  }
});


// Handle adding product to wishlist
app.post('/wishlist/add', async (req, res) => {
  const { productId } = req.body;

  try {
    // Find the user and add the product to their wishlist
    const userId = req.session.userId; // Make sure you have user sessions set up
    if (!userId) {
      return res.status(401).send('User not authenticated');
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check if product is already in wishlist
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.redirect('/wishlist');
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    res.status(500).send('Server error');
  }
});

// Handle logging out
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Server error');
    }
    res.redirect('/');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
