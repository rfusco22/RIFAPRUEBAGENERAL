-- Script final para configurar correctamente el usuario admin
USE rifa;

-- Verificar si la columna password_hash existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rifa' 
  AND TABLE_NAME = 'admins' 
  AND COLUMN_NAME = 'password_hash';

-- Agregar la columna password_hash si no existe
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Eliminar usuario admin existente si existe
DELETE FROM admins WHERE username = 'admin';

-- Insertar usuario admin con contraseña hasheada correctamente
-- Contraseña: admin123
-- Hash generado con bcrypt, salt rounds 12
INSERT INTO admins (username, email, password_hash, created_at, updated_at) 
VALUES (
  'admin', 
  'admin@rifamax.com', 
  '$2b$12$LQv3c1yqBwLVFqkSS9vEsOeEsavaVmwxrkHGJmwEIaLGA7oAOUdQC',
  NOW(),
  NOW()
);

-- Verificar que el usuario se creó correctamente
SELECT id, username, email, 
       CASE 
         WHEN password_hash IS NOT NULL AND password_hash != '' 
         THEN 'Hash configurado correctamente' 
         ELSE 'Hash faltante o vacío' 
       END as password_status
FROM admins WHERE username = 'admin';
