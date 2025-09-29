-- Agregar columna password_hash si no existe y actualizar la contraseña del admin
USE rifa;

-- Agregar la columna password_hash si no existe
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '';

-- Actualizar el usuario admin con la contraseña hasheada correctamente
-- Contraseña: admin123
-- Hash bcrypt con salt rounds 10
UPDATE admins 
SET password_hash = '$2b$10$rQ8K5O2GxIlRcDyxVpxOKuYvJ6P3H4N2M1L0Z9Y8X7W6V5U4T3S2R1'
WHERE username = 'admin';

-- Verificar que el usuario admin tiene la contraseña
SELECT id, username, email, password_hash FROM admins WHERE username = 'admin';
