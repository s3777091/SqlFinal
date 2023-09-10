-- Create database
CREATE DATABASE IF NOT EXISTS InventoryManagement;
USE InventoryManagement;


-- Create Sellers table
CREATE TABLE Sellers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    INDEX idx_name (name)
);


-- Create WHWorkers table
CREATE TABLE WHWorkers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50)
);

-- Create DeliveryHeroes table
CREATE TABLE DeliveryHeroes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50)
);

-- Create Categories table
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    extra_attributes JSON
);

-- Create Products table
CREATE TABLE Products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    description TEXT,
    price FLOAT,
    image_url VARCHAR(255),
    length FLOAT,
    width FLOAT,
    height FLOAT,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

-- Create Warehouses table
CREATE TABLE Warehouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    total_cbm FLOAT,
    available_cbm FLOAT
);

-- Create InboundOrders table
CREATE TABLE InboundOrders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    seller_id INT,
    quantity INT,
    status ENUM('Pending', 'Completed'),
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (seller_id) REFERENCES Sellers(id)
);

-- Sample data
INSERT INTO Sellers (name) VALUES ('Seller 1'), ('Seller 2');
INSERT INTO WHWorkers (name) VALUES ('WH Worker 1'), ('WH Worker 2');
INSERT INTO DeliveryHeroes (name) VALUES ('Delivery Hero 1'), ('Delivery Hero 2');
INSERT INTO Categories (name, extra_attributes) VALUES ('Electronics', '{"warranty": "1 year"}'), ('Furniture', '{"material": "wood"}');
INSERT INTO Products (title, description, price, image_url, length, width, height, category_id) VALUES ('Laptop', 'Powerful laptop', 1000, 'http://image.com/laptop.jpg', 30, 20, 5, 1);
INSERT INTO Warehouses (name, total_cbm, available_cbm) VALUES ('Warehouse 1', 100000, 90000), ('Warehouse 2', 200000, 180000);
INSERT INTO InboundOrders (product_id, seller_id, quantity, status) VALUES (1, 1, 50, 'Pending');

CREATE INDEX idx_available_cbm ON Warehouses(available_cbm);