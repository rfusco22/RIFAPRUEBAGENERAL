-- Insertar datos iniciales
USE sistema_rifas;

-- Insertar admin por defecto (password: admin123)
INSERT INTO admins (username, password_hash, email) VALUES 
('admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'admin@rifas.com');

-- Insertar rifa de ejemplo
INSERT INTO rifas (title, description, prize_description, ticket_price, start_date, end_date, draw_date) VALUES 
('Gran Rifa 2025', 'Participa en nuestra gran rifa del año y gana increíbles premios', 'iPhone 15 Pro Max + $500 en efectivo', 25.00, '2025-01-01 00:00:00', '2025-03-31 23:59:59', '2025-04-01 20:00:00');

-- Generar todos los números del 000 al 999 para la rifa
INSERT INTO raffle_numbers (rifa_id, number)
SELECT 1, LPAD(n, 3, '0')
FROM (
    SELECT a.N + b.N * 10 + c.N * 100 as n
    FROM 
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
    (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
    ORDER BY n
) numbers;

-- Insertar algunos usuarios de ejemplo
INSERT INTO users (name, email, phone) VALUES 
('Juan Pérez', 'juan@email.com', '+1234567890'),
('María García', 'maria@email.com', '+1234567891'),
('Carlos López', 'carlos@email.com', '+1234567892');
