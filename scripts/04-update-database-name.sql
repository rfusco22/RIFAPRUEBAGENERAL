-- Actualizar el nombre de la base de datos y recrear las tablas si es necesario
CREATE DATABASE IF NOT EXISTS rifa;
USE rifa;

-- Verificar si las tablas existen, si no, crearlas
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rifas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    prize_description TEXT NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    draw_date DATETIME NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raffle_numbers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rifa_id INT NOT NULL,
    number VARCHAR(3) NOT NULL,
    user_id INT NULL,
    status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
    reserved_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_number_per_rifa (rifa_id, number),
    INDEX idx_rifa_status (rifa_id, status),
    INDEX idx_user_numbers (user_id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    rifa_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'expired') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    numbers JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE,
    INDEX idx_user_payments (user_id),
    INDEX idx_status (status)
);

-- Insertar admin por defecto si no existe
INSERT IGNORE INTO admins (username, password_hash, email) VALUES 
('admin', '$2b$12$LQv3c1yqBwlFhPXe3FMqve.xVHjpmNcGu6qrU3wEX.JbcqKim2eim', 'admin@rifas.com');

-- Insertar rifa de ejemplo si no existe
INSERT IGNORE INTO rifas (id, title, description, prize_description, ticket_price, start_date, end_date, draw_date) VALUES 
(1, 'Gran Rifa 2025', 'Participa en nuestra gran rifa del año y gana increíbles premios', 'iPhone 15 Pro Max + $500 en efectivo', 25.00, '2025-01-01 00:00:00', '2025-03-31 23:59:59', '2025-04-01 20:00:00');

-- Generar números si no existen
INSERT IGNORE INTO raffle_numbers (rifa_id, number)
SELECT 1, LPAD(n, 3, '0')
FROM (
    SELECT a.N + b.N * 10 + c.N * 100 as n
    FROM 
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
    ORDER BY n
) numbers;
