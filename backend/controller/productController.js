const Product = require('../models/productModel');

// Create product
exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Other CRUD operations for Products like update, delete, and list can go here.