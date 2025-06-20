const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'logis_user',
  password: process.env.DB_PASSWORD || 'logis_password',
  database: process.env.DB_NAME || 'logis_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Logis API is running' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );

    // Generate token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: result.insertId,
        email,
        subscription_tier: 'free'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        subscription_tier: user.subscription_tier
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, subscription_tier, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Shipments routes
app.get('/api/shipments', authenticateToken, async (req, res) => {
  try {
    const [shipments] = await pool.execute(
      'SELECT s.*, f.name as folder_name FROM shipments s LEFT JOIN folders f ON s.folder_id = f.id WHERE s.user_id = ? ORDER BY s.created_at DESC',
      [req.user.userId]
    );
    res.json(shipments);
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/shipments', authenticateToken, async (req, res) => {
  try {
    const { name, folder_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Shipment name required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO shipments (user_id, name, folder_id) VALUES (?, ?, ?)',
      [req.user.userId, name, folder_id || null]
    );

    res.json({
      id: result.insertId,
      name,
      folder_id: folder_id || null,
      user_id: req.user.userId
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/shipments/:id', authenticateToken, async (req, res) => {
  try {
    const [shipments] = await pool.execute(
      'SELECT * FROM shipments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (shipments.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Get containers
    const [containers] = await pool.execute(
      'SELECT * FROM containers WHERE shipment_id = ?',
      [req.params.id]
    );

    // Get products
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE shipment_id = ?',
      [req.params.id]
    );

    res.json({
      ...shipments[0],
      containers,
      products
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Containers routes
app.post('/api/containers', authenticateToken, async (req, res) => {
  try {
    const { shipment_id, name, height, width, length, weight_limit, icon } = req.body;
    
    // Verify shipment ownership
    const [shipments] = await pool.execute(
      'SELECT id FROM shipments WHERE id = ? AND user_id = ?',
      [shipment_id, req.user.userId]
    );
    
    if (shipments.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const [result] = await pool.execute(
      'INSERT INTO containers (shipment_id, name, height, width, length, weight_limit, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [shipment_id, name, height, width, length, weight_limit, icon || 'Package']
    );

    res.json({
      id: result.insertId,
      shipment_id,
      name,
      height,
      width,
      length,
      weight_limit,
      icon: icon || 'Package'
    });
  } catch (error) {
    console.error('Create container error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Products routes
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const {
      shipment_id, container_id, name, height, width, length, weight,
      purchase_price, resale_price, days_to_sell, quantity, is_boxed, icon, tag
    } = req.body;
    
    // Verify shipment ownership
    const [shipments] = await pool.execute(
      'SELECT id FROM shipments WHERE id = ? AND user_id = ?',
      [shipment_id, req.user.userId]
    );
    
    if (shipments.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const [result] = await pool.execute(
      `INSERT INTO products (shipment_id, container_id, name, height, width, length, weight, 
       purchase_price, resale_price, days_to_sell, quantity, is_boxed, icon, tag) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [shipment_id, container_id || null, name, height, width, length, weight,
       purchase_price, resale_price, days_to_sell || 7, quantity || 1, 
       is_boxed || false, icon || 'Package', tag || '']
    );

    res.json({
      id: result.insertId,
      shipment_id,
      container_id: container_id || null,
      name, height, width, length, weight,
      purchase_price, resale_price,
      days_to_sell: days_to_sell || 7,
      quantity: quantity || 1,
      is_boxed: is_boxed || false,
      icon: icon || 'Package',
      tag: tag || ''
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Saved products routes
app.get('/api/saved-products', authenticateToken, async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM saved_products WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(products);
  } catch (error) {
    console.error('Get saved products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/saved-products', authenticateToken, async (req, res) => {
  try {
    const {
      name, description, height, width, length, weight,
      purchase_price, resale_price, days_to_sell, icon
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO saved_products (user_id, name, description, height, width, length, weight,
       purchase_price, resale_price, days_to_sell, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, name, description || '', height, width, length, weight,
       purchase_price, resale_price, days_to_sell || 7, icon || 'Package']
    );

    res.json({
      id: result.insertId,
      user_id: req.user.userId,
      name, description, height, width, length, weight,
      purchase_price, resale_price,
      days_to_sell: days_to_sell || 7,
      icon: icon || 'Package'
    });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Folders routes
app.get('/api/folders', authenticateToken, async (req, res) => {
  try {
    const [folders] = await pool.execute(
      'SELECT * FROM folders WHERE user_id = ? ORDER BY name',
      [req.user.userId]
    );
    res.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/folders', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Folder name required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO folders (user_id, name) VALUES (?, ?)',
      [req.user.userId, name]
    );

    res.json({
      id: result.insertId,
      user_id: req.user.userId,
      name
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});