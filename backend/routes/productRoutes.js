const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// Middleware for checking if the user is a seller
function checkIsSeller(req, res, next) {
    if (req.user && req.user.role === 'Seller') {
        next();
    } else {
        res.status(403).json({ message: 'Permission denied' });
    }
}

// Create new product
router.post('/', checkIsSeller, async (req, res) => {
    const { title, description, price, image, length, width, height, categoryAttributes } = req.body;

    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
        const newProduct = new Product({
            title,
            description,
            price,
            image,
            dimensions: { length, width, height },
            categoryAttributes,
        });

        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update product
router.put('/:id', checkIsSeller, async (req, res) => {
    const { id } = req.params;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Delete product
router.delete('/:id', checkIsSeller, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (deletedProduct) {
            res.json({ message: 'Product deleted' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;