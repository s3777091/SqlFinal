const mongoose = require('mongoose');

const inboundOrderSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: Number
});

module.exports = mongoose.model('InboundOrder', inboundOrderSchema);