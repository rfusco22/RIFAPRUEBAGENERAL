-- Corregir la contraseña del administrador
USE rifa;

-- Eliminar admin existente si existe
DELETE FROM admins WHERE username = 'admin';

-- Insertar admin con contraseña correctamente hasheada (password: admin123)
INSERT INTO admins (username, password_hash, email) VALUES 
('admin', '$2b$12$LQv3c1yqBwlFhPXe3FMqve.xVHjpmNcGu6qrU3wEX.JbcqKim2eim', 'admin@rifas.com');
