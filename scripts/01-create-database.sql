-- Crear base de datos para el sistema de rifas
CREATE DATABASE IF NOT EXISTS sistema_rifas;
USE sistema_rifas;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de rifas
CREATE TABLE IF NOT EXISTS rifas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    prize_description TEXT NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    total_numbers INT DEFAULT 1000,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    draw_date DATETIME,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    winner_number VARCHAR(3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de números de rifa
CREATE TABLE IF NOT EXISTS raffle_numbers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rifa_id INT NOT NULL,
    number VARCHAR(3) NOT NULL,
    user_id INT,
    status ENUM('available', 'reserved', 'paid') DEFAULT 'available',
    reserved_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_number_per_rifa (rifa_id, number)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    rifa_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    numbers_purchased TEXT, -- JSON array de números comprados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_raffle_numbers_rifa_status ON raffle_numbers(rifa_id, status);
CREATE INDEX idx_raffle_numbers_user ON raffle_numbers(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_rifa ON payments(rifa_id);
CREATE INDEX idx_rifas_status ON rifas(status);
