// src/App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CreateProduct from './components/CreateProduct';
import CreateInboundOrder from './components/CreateInboundOrder';
import './App.css';

function App() {
    return (
        <div className="App">
            <nav>
                <h2>Hello World</h2>
                <Link to="/create-product">Create Product</Link>
                <Link to="/create-inbound-order">Create Inbound Order</Link>
            </nav>
            <Routes>
                <Route path="/create-product" element={<CreateProduct />} />
                <Route path="/create-inbound-order" element={<CreateInboundOrder />} />
            </Routes>
        </div>
    );
}

export default App;