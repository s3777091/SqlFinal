const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    image: String,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    // ... (other attributes from product's category)
});

module.exports = mongoose.model('Product', productSchema);