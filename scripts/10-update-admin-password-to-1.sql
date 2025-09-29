-- Actualizar la contraseña del admin a "1"
-- Hash generado con bcrypt para la contraseña "1"
UPDATE admins 
SET password_hash = '$2b$12$rMtHgXUBsy6VQzMHnEX8/.vS8VWw5pLX8hzWqNhFy3.Nv7EqGjO6u'
WHERE username = 'admin';

-- Verificar que se actualizó correctamente
SELECT id, username, email, password_hash FROM admins WHERE username = 'admin';
