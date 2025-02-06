const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const MenuItem = require('./model/menuItem');  // Corrected import for MenuItem
const { resolve } = require('path');

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://shanmugapriyab211:client1@cluster0.noafv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log('Failed to connect:', err));

// Home route
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Add new menu item
app.post('/menu', (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !price || price <= 0) {
    return res.status(400).json({ error: "name and price are required and price must be greater than zero" });
  }

  const newMenuItem = new MenuItem({
    name,
    description,
    price
  });

  newMenuItem.save()
    .then(() => {
      res.status(200).json({ message: 'Item added successfully', item: newMenuItem });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Internal server error', details: err.message });
    });
});

// Get all menu items
app.get('/menu', (req, res) => {
  MenuItem.find()
    .then((items) => {
      res.status(200).json(items);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to retrieve menu items', details: err.message });
    });
});

// Update a menu item
app.put('/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  MenuItem.findByIdAndUpdate(id, { name, description, price }, { new: true, runValidators: true })
    .then((updated) => {
      if (!updated) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(200).json({ message: 'Item updated successfully', updated });
    })
    .catch((err) => {
      res.status(400).json({ message: 'Error updating the menu item', details: err.message });
    });
});

// Delete a menu item
app.delete('/menu/:id', (req, res) => {
  const { id } = req.params;

  MenuItem.findByIdAndDelete(id)
    .then((deleted) => {
      if (!deleted) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(200).json({ message: 'Item deleted successfully' });
    })
    .catch((err) => {
      res.status(400).json({ message: 'Error deleting menu item', details: err.message });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});