// src/components/CreateProduct.js
import React, { useState } from 'react';
import axios from '../api/axiosInstance';

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        image: '',
        length: 0,
        width: 0,
        height: 0,
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
            const response = await axios.post('/products', formData);
            alert('Product created successfully');
        } catch (err) {
            setError('Error creating product');
        }
    };

    return (
        <div className="form-container">
            <h2>Create Product</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title:</label>
                    <input type="text" name="title" onChange={handleChange} />
                </div>
                {/* Other fields go here */}
                <button type="submit">Create</button>
            </form>
        </div>
    );
};

export default CreateProduct;