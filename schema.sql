

CREATE DATABASE IF NOT EXISTS drukdeals_db;
USE drukdeals_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    cat_id INT PRIMARY KEY AUTO_INCREMENT,
    cat_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    prod_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cat_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

INSERT IGNORE INTO categories (cat_name) VALUES 
('Electronics'), ('Clothing'), ('Books'), ('Furniture'), ('Other');

SELECT 'Database setup complete!' AS Status;
