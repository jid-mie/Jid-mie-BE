require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/jidmie_dev';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'password123';
const name = process.argv[4] || 'Admin User';

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB:', MONGO_URL);

    let user = await User.findOne({ email });
    if (user) {
      if (user.role === 'admin') {
        console.log(`User ${email} already exists and is an admin.`);
      } else {
        user.role = 'admin';
        await user.save();
        console.log(`User ${email} existed and was upgraded to admin.`);
      }
    } else {
      user = await User.create({ name, email, password, role: 'admin' });
      console.log(`Created admin user: ${email}`);
    }

    // create a JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    console.log('--- Admin credentials ---');
    console.log('email:', email);
    console.log('password:', password);
    console.log('jwt token:', token);
    console.log('Use this token as Authorization: Bearer <token>');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

run();
