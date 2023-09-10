const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { checkAuthorization } = require('./middlewares/authMiddleware');

const productRoutes = require('./routes/productRoutes');
const inboundOrderRoutes = require('./routes/inboundOrderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/inboundOrders', inboundOrderRoutes);
app.use('/api/users', userRoutes);

// Database Connection
mongoose.connect('mongodb://localhost:27017/myDatabase', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error.message);
    });

// Start Server
const PORT = 7000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});