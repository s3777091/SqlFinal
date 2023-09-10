const express = require('express');
const InboundOrder = require('../models/inboundOrderModel');
const { checkAuthorization } = require('../middlewares/authMiddleware');
const Warehouse = require('../models/warehouseModel');
const router = express.Router();

// Create a new inbound order (Authorization: Seller)
router.post('/', checkAuthorization('Seller'), async (req, res) => {
    try {
        const newInboundOrder = new InboundOrder(req.body);
        await newInboundOrder.save();
        res.status(201).json(newInboundOrder);
    } catch (error) {
        res.status(400).json({ message: 'Error creating inbound order', error });
    }
});

// WH worker finishes IO (Authorization: WH Worker)
router.post('/finish-io', checkAuthorization('WH Worker'), async (req, res) => {
    try {
        const { inboundOrderId } = req.body;
        const inboundOrder = await InboundOrder.findById(inboundOrderId);

        if (!inboundOrder) {
            return res.status(404).json({ message: 'Inbound order not found' });
        }

        // Calculate the volume needed
        const volumeNeeded = inboundOrder.width * inboundOrder.length * inboundOrder.height;

        // Get a list of warehouses sorted by availableVolume
        const warehouses = await Warehouse.find().sort({ availableVolume: -1 });

        // Find the appropriate warehouse and update
        for (let warehouse of warehouses) {
            if (warehouse.availableVolume >= volumeNeeded) {
                warehouse.availableVolume -= volumeNeeded;
                await warehouse.save();

                // Update the inboundOrder to set warehouseId and status
                inboundOrder.warehouseId = warehouse._id;
                inboundOrder.status = 'Completed';
                await inboundOrder.save();

                return res.status(200).json({ message: 'IO completed', warehouse });
            }
        }

        return res.status(400).json({ message: 'Not enough space in any warehouse' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
module.exports = router;