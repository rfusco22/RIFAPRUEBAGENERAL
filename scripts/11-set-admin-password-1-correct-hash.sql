UPDATE admins 
SET password_hash = '$2b$12$q3mvcNmexy5E1LGGkokjKeoVzKDz97ZSq5ONqyAn3pi8IOG.QKPNS'
WHERE username = 'admin';

-- Verificar que se actualizó correctamente
SELECT id, username, email, password_hash FROM admins WHERE username = 'admin';
