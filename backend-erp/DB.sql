CREATE DATABASE IF NOT EXISTS magni_plastic_erp;
USE magni_plastic_erp;

-- 1. Asistencia
CREATE TABLE IF NOT EXISTS asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_empleado VARCHAR(50) DEFAULT 'EMP-001',
    tipo_evento VARCHAR(20) NOT NULL, -- 'entrada', 'salida', 'comida'
    hora VARCHAR(20) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bitácoras de Producción (Consolidada en una sola creación)
CREATE TABLE IF NOT EXISTS bitacoras_produccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_bitacora VARCHAR(50),
    proceso VARCHAR(100) NOT NULL,
    maquina VARCHAR(50) NOT NULL,
    operador VARCHAR(100) NOT NULL,
    turno VARCHAR(50) NOT NULL,
    hora_inicio VARCHAR(30) NOT NULL,
    hora_fin VARCHAR(30) DEFAULT '—',
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Órdenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_orden VARCHAR(50),
    proveedor VARCHAR(150) NOT NULL,
    material VARCHAR(150) NOT NULL,
    qty DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    eta VARCHAR(50) NOT NULL,
    prioridad VARCHAR(50) NOT NULL,
    notas TEXT,
    estatus VARCHAR(50) DEFAULT 'Pendiente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Configuración de Usuario
CREATE TABLE IF NOT EXISTS configuracion_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(50) DEFAULT 'EMP-001',
    tipo_letra VARCHAR(50) DEFAULT 'Roboto',
    idioma VARCHAR(50) DEFAULT 'Español (MX)',
    modo_oscuro BOOLEAN DEFAULT FALSE,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Contactos
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    empresa VARCHAR(100) NOT NULL,
    telefono VARCHAR(50) DEFAULT '-',
    email VARCHAR(100) NOT NULL,
    tipo ENUM('cliente', 'proveedor') NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(50) NOT NULL,
    cliente VARCHAR(150) NOT NULL,
    segmento VARCHAR(100) NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    producto VARCHAR(150) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) DEFAULT 'pza',
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    iva DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    validez DATE NOT NULL,
    condiciones VARCHAR(50) DEFAULT '30 días',
    notas TEXT,
    estatus VARCHAR(50) DEFAULT 'En revisión',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recuperación de Contraseña
CREATE TABLE IF NOT EXISTS recuperacion_password (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Inventario (Estructura unificada con las columnas correctas en inglés)
CREATE TABLE IF NOT EXISTS inventario (
    sku VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    stock DECIMAL(10,2) DEFAULT 0.00,
    min_stock DECIMAL(10,2) DEFAULT 100.00,
    unit VARCHAR(20) DEFAULT 'pza'
);

-- Inserción correcta adaptada a la estructura de inventario
INSERT IGNORE INTO inventario (sku, name, category, location, stock, min_stock, unit) VALUES 
('#30-32-25', 'Contenedor Colapsable 30X32X25', 'Resina', 'Almacén A-1', 250, 100, 'pza'),
('#45-48-34', 'Contenedor Industrial 45X48X34', 'Resina', 'Almacén A-2', 80, 150, 'pza'),
('PIG-AZL', 'Pigmento Azul Industrial', 'Pigmento', 'Estante P-3', 45, 50, 'kg');

-- 9. Movimientos de Inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'entrada' o 'salida'
    cantidad DECIMAL(10,2) NOT NULL,
    lote VARCHAR(50),
    notas TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'operador',
    nombre VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO usuarios (email, password, role, nombre) VALUES 
('gerencia@magniplastic.com', 'gerencia123', 'gerencia', 'Gerente General'),
('operador@magniplastic.com', 'operador123', 'operador', 'Operador de Planta');

-- 11. Solicitudes Internas
CREATE TABLE IF NOT EXISTS solicitudes_internas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(50) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    empleado VARCHAR(150) NOT NULL,
    numero_empleado VARCHAR(50) NOT NULL,
    area VARCHAR(100) NOT NULL,
    turno VARCHAR(50) NOT NULL,
    prioridad VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    detalles_extra JSON,
    estatus VARCHAR(50) DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tareas del Operador
CREATE TABLE IF NOT EXISTS tareas_operador (
    id VARCHAR(50) PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'pending',
    machine VARCHAR(100) NOT NULL,
    product VARCHAR(255) NOT NULL,
    target INT NOT NULL,
    current INT DEFAULT 0,
    priority VARCHAR(50) DEFAULT 'medium',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO tareas_operador (id, status, machine, product, target, current, priority) VALUES 
('OP-001', 'in_progress', 'Inyectora #04', 'Contenedor Colapsable 45X48X34', 1500, 450, 'high'),
('OP-002', 'pending', 'Inyectora #02', 'Carcasa Modelo X - Magniplastic', 800, 0, 'medium'),
('OP-003', 'completed', 'Extrusora #01', 'Charola Industrial 40X48X25', 2000, 2000, 'low'),
('OP-004', 'pending', 'Inyectora #05', 'Tapa Hermética PP', 3000, 0, 'high'),
('OP-005', 'in_progress', 'Sopladora #03', 'Contenedor 60X48X50', 600, 200, 'medium');

-- 13. Ventas y Productos de Venta
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(50) NOT NULL UNIQUE,
    cliente VARCHAR(150) NOT NULL,
    estatus_factura VARCHAR(50) DEFAULT 'pendiente',
    archivo_factura VARCHAR(100) DEFAULT '',
    estatus_embarque VARCHAR(50) DEFAULT 'pendiente',
    fecha_salida VARCHAR(50) DEFAULT '—',
    destino VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(100),
    condiciones_pago VARCHAR(50),
    monto DECIMAL(12, 2) DEFAULT 0.00,
    chofer VARCHAR(100) DEFAULT '—',
    transportista VARCHAR(100) DEFAULT '—',
    placas VARCHAR(50) DEFAULT '—',
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT,
    part_number VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    peso DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
);

-- 14. Detalle de Embarques
CREATE TABLE IF NOT EXISTS detalle_embarques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    shipment_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'en_transito',
    priority VARCHAR(50) DEFAULT 'alta',
    shipping_method VARCHAR(100) DEFAULT 'Terrestre - Express',
    salesperson VARCHAR(100) DEFAULT 'Ana García',
    customer_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    operator_name VARCHAR(100) DEFAULT 'Juan Pérez García',
    sale_date VARCHAR(50),
    scheduled_shipment_date VARCHAR(50),
    estimated_delivery_date VARCHAR(50),
    delivery_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'México',
    transport_type VARCHAR(100) DEFAULT 'Terrestre - Camión 3.5 Ton',
    carrier_company VARCHAR(150) NOT NULL,
    guide_number VARCHAR(50) NOT NULL,
    packaging_type VARCHAR(150) DEFAULT 'Tarimas de madera con película strech',
    special_conditions VARCHAR(255),
    payment_method VARCHAR(150) DEFAULT 'Transferencia Bancaria - 30 días',
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date VARCHAR(50) NOT NULL,
    rfc VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pendiente de Pago',
    subtotal DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL
);

INSERT IGNORE INTO detalle_embarques (
    order_number, shipment_number, status, priority, customer_name, company_name, 
    contact_person, phone, email, delivery_address, city, state, postal_code, 
    carrier_company, guide_number, invoice_number, invoice_date, rfc, subtotal, tax, total
) VALUES (
    'VEN-2026-0342', 'EMB-2026-0891', 'en_transito', 'alta', 
    'Roberto Martínez Hernández', 'AutoParts del Norte S.A. de C.V.', 'Roberto Martínez', 
    '+52 81 8888-9999', 'rmartinez@autopartsnorte.com', 'Av. Revolución 2450, Col. Industrial', 
    'Monterrey', 'Nuevo León', '64700', 'Transportes Rápidos del Norte', 'TRN-2026-45678', 
    'FAC-2026-0342', '15 Mayo 2026', 'APN050315HT4', 285000.00, 45600.00, 330600.00
);

INSERT IGNORE INTO ventas (folio, cliente, destino, estatus_factura, monto)
VALUES ('VEN-2026-001', 'Plásticos del Norte', 'Monterrey, NL', 'emitida', 45000.00),
       ('VEN-2026-002', 'AutoParts S.A.', 'Saltillo, COAH', 'pendiente', 12500.50);


CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(50) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    empleado VARCHAR(150) NOT NULL,
    numero_empleado VARCHAR(50) NOT NULL,
    area VARCHAR(100) NOT NULL,
    turno VARCHAR(50) NOT NULL,
    prioridad VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATE,
    estatus VARCHAR(50) DEFAULT 'pendiente',
    archivo VARCHAR(255)
);
