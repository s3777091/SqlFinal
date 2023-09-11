const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    inboundOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InboundOrder'
        }
    ]
});

module.exports = mongoose.model('Seller', sellerSchema);
