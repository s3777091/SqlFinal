const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    availableVolume: { type: Number, required: true }
});

module.exports = mongoose.model('Warehouse', warehouseSchema);