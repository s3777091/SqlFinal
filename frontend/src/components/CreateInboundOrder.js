// src/components/CreateInboundOrder.js
import React, { useState } from 'react';
import axios from '../api/axiosInstance';

const CreateInboundOrder = () => {
    const [formData, setFormData] = useState({
        productId: '',
        quantity: 0,
    });

    const [error, setError] = useState('');

    const validateInput = () => {
        // Add your validation logic here
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateInput()) {
            setError('Validation failed');
            return;
        }

        try {
            const response = await axios.post('/inbound-orders', formData);
            alert('Inbound Order created successfully');
        } catch (err) {
            setError('Error creating inbound order');
        }
    };

    return (
        <div className="form-container">
            <h2>Create Inbound Order</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Product ID:</label>
                    <input type="text" name="productId" onChange={handleChange} />
                </div>
                {/* Other fields go here */}
                <button type="submit">Create</button>
            </form>
        </div>
    );
};

export default CreateInboundOrder;