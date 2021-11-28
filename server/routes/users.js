const express = require('express');
const router = express.Router();
const users_controller = require('../controllers/users_controller');


// Login Page
router.get('/login', users_controller.login);
router.post('/login', users_controller.login);

// Dashboard Page
router.get('/dashboard', users_controller.dashboard);
router.post('/dashboard', users_controller.dashboard);

// Home Page
router.get('/', users_controller.view);
router.post('/', users_controller.search);

// Home page with sorted table
router.get('/sorted', users_controller.sorted);

// Add User
router.get('/adduser', users_controller.form);
router.post('/adduser', users_controller.add_user);

// Edit User
router.get('/edituser/:id', users_controller.edit_user);
router.post('/edituser/:id', users_controller.update_user);

// Delete User
router.get('/delete/:id', users_controller.delete_user);

// View User
router.get('/viewuser/:id', users_controller.view_user);

// Services
router.post('/services', users_controller.services);
router.get('/services', users_controller.services);

// Service
router.get('/service/:id', users_controller.service);

// Orders
router.get('/orders', users_controller.orders);


module.exports = router; 