-- Diagnóstico y corrección de problemas de autenticación

-- Verificar si la base de datos existe
SHOW DATABASES LIKE 'rifa';

-- Usar la base de datos correcta
USE rifa;

-- Verificar si la tabla admins existe
SHOW TABLES LIKE 'admins';

-- Ver la estructura de la tabla admins
DESCRIBE admins;

-- Verificar si existe el usuario admin
SELECT id, username, email, password_hash FROM admins WHERE username = 'admin';

-- Eliminar usuario admin existente si hay problemas
DELETE FROM admins WHERE username = 'admin';

-- Crear usuario admin con hash correcto
-- Contraseña: admin123
INSERT INTO admins (username, email, password_hash, created_at, updated_at) 
VALUES (
  'admin', 
  'admin@rifamax.com', 
  '$2a$12$LQv3c1yqBFVyhumFWOJSjO.1TTOIllI5qrUqqZdFJaO6PjUpuK9jS',
  NOW(), 
  NOW()
);

-- Verificar que se insertó correctamente
SELECT id, username, email, password_hash FROM admins WHERE username = 'admin';
