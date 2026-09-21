const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
try {
    require('sqlite3/lib/binding/node-v108-win32-x64/node_sqlite3.node');
} catch (e) {}

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXIÓN E INICIALIZACIÓN DE SQLITE ---
const isPacked = process.pkg;
const dbDir = isPacked ? path.dirname(process.execPath) : __dirname;
const dbFile = path.join(dbDir, 'magniplastic.db');

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos SQLite', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite local.');
    }
});

// Crear tablas y datos iniciales de forma automática si no existen
db.serialize(() => {
    // --- CREACIÓN DE TABLAS ---
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        nombre TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS inventario (
        sku TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        location TEXT,
        stock REAL,
        min_stock REAL,
        unit TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tareas_operador (
        id TEXT PRIMARY KEY,
        status TEXT,
        machine TEXT,
        product TEXT,
        target INTEGER,
        current INTEGER,
        priority TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS asistencia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_empleado TEXT,
        tipo_evento TEXT,
        hora TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bitacoras_produccion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_bitacora TEXT,
        proceso TEXT,
        maquina TEXT,
        operador TEXT,
        turno TEXT,
        hora_inicio TEXT,
        hora_fin TEXT,
        observaciones TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ordenes_compra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_orden TEXT,
        proveedor TEXT,
        material TEXT,
        qty REAL,
        unit TEXT,
        precio_unitario REAL,
        amount REAL,
        eta TEXT,
        prioridad TEXT,
        notas TEXT,
        estatus TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS configuracion_usuario (
        usuario_id TEXT PRIMARY KEY,
        tipo_letra TEXT,
        idioma TEXT,
        modo_oscuro INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        empresa TEXT,
        telefono TEXT,
        email TEXT,
        tipo TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cotizaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folio TEXT,
        cliente TEXT,
        segmento TEXT,
        responsable TEXT,
        producto TEXT,
        cantidad REAL,
        unidad TEXT,
        precio_unitario REAL,
        subtotal REAL,
        iva REAL,
        total REAL,
        validez TEXT,
        condiciones TEXT,
        notas TEXT,
        estatus TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS solicitudes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folio TEXT,
        tipo TEXT,
        empleado TEXT,
        numero_empleado TEXT,
        area TEXT,
        turno TEXT,
        prioridad TEXT,
        descripcion TEXT,
        fecha TEXT,
        estatus TEXT,
        archivo TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folio TEXT,
        cliente TEXT,
        estatus_factura TEXT,
        archivo_factura TEXT,
        estatus_embarque TEXT,
        fecha_salida TEXT,
        destino TEXT,
        contacto TEXT,
        telefono TEXT,
        email TEXT,
        condiciones_pago TEXT,
        monto REAL,
        chofer TEXT,
        transportista TEXT,
        placas TEXT,
        notas TEXT
    )`);

    // --- INSERCIÓN DE DATOS INICIALES (SEEDERS) ---
    
    // 1. Usuarios de prueba
    db.get(`SELECT COUNT(*) as count FROM usuarios`, (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO usuarios (email, password, role, nombre) VALUES ('gerencia@magniplastic.com', 'gerencia123', 'gerencia', 'Gerente General')`);
            db.run(`INSERT INTO usuarios (email, password, role, nombre) VALUES ('operador@magniplastic.com', 'operador123', 'operador', 'Operador de Planta')`);
        }
    });

    // 2. Inventario inicial
    db.get(`SELECT COUNT(*) as count FROM inventario`, (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO inventario (sku, name, category, location, stock, min_stock, unit) VALUES ('#30-32-25', 'Contenedor Colapsable 30X32X25', 'Resina', 'Almacén A-1', 250, 100, 'pza')`);
            db.run(`INSERT INTO inventario (sku, name, category, location, stock, min_stock, unit) VALUES ('#45-48-34', 'Contenedor Industrial 45X48X34', 'Resina', 'Almacén A-2', 80, 150, 'pza')`);
            db.run(`INSERT INTO inventario (sku, name, category, location, stock, min_stock, unit) VALUES ('PIG-AZL', 'Pigmento Azul Industrial', 'Pigmento', 'Estante P-3', 45, 50, 'kg')`);
        }
    });

    // 3. Tareas iniciales del operador
    db.get(`SELECT COUNT(*) as count FROM tareas_operador`, (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO tareas_operador (id, status, machine, product, target, current, priority) VALUES ('OP-001', 'in_progress', 'Inyectora #04', 'Contenedor Colapsable 45X48X34', 1500, 450, 'high')`);
            db.run(`INSERT INTO tareas_operador (id, status, machine, product, target, current, priority) VALUES ('OP-002', 'pending', 'Inyectora #02', 'Carcasa Modelo X - Magniplastic', 800, 0, 'medium')`);
            db.run(`INSERT INTO tareas_operador (id, status, machine, product, target, current, priority) VALUES ('OP-003', 'completed', 'Extrusora #01', 'Charola Industrial 40X48X25', 2000, 2000, 'low')`);
        }
    });
});

// --- AUTENTICACIÓN / LOGIN ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT email, role, nombre FROM usuarios WHERE email = ? AND password = ?';
    db.get(query, [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }
        res.json({
            message: "Inicio de sesión exitoso",
            email: user.email,
            role: user.role,
            nombre: user.nombre
        });
    });
});

// --- CONTROL DE ASISTENCIA ---
app.post('/api/asistencia', (req, res) => {
    const { numero_empleado, tipo_evento, hora } = req.body;
    const query = 'INSERT INTO asistencia (numero_empleado, tipo_evento, hora) VALUES (?, ?, ?)';
    db.run(query, [numero_empleado || 'EMP-001', tipo_evento, hora], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Asistencia registrada correctamente", id: this.lastID });
    });
});

// --- INVENTARIO ---
app.get('/api/inventario', (req, res) => {
    db.all('SELECT sku, name, category, location, stock, min_stock as min, unit FROM inventario', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inventario/movimiento', (req, res) => {
    const { sku, tipo, cantidad, lote, notas } = req.body;
    const insertQuery = 'INSERT INTO movimientos_inventario (sku, tipo, cantidad, lote, notas) VALUES (?, ?, ?, ?, ?)';
    db.run(insertQuery, [sku, tipo, cantidad, lote || '', notas || ''], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        const operador = tipo === 'entrada' ? '+' : '-';
        const updateQuery = `UPDATE inventario SET stock = stock ${operador} ? WHERE sku = ?`;
        
        db.run(updateQuery, [cantidad, sku], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: `Movimiento de ${tipo} registrado con éxito` });
        });
    });
});

app.post('/api/inventario/nuevo', (req, res) => {
    const { sku, name, category, location, stock, min, unit } = req.body;
    const query = `
        INSERT INTO inventario (sku, name, category, location, stock, min_stock, unit) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [sku, name, category, location, stock || 0, min || 50, unit || 'pza'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Material creado exitosamente en inventario", id: this.lastID });
    });
});

// --- BITÁCORAS DE PRODUCCIÓN ---
app.get('/api/bitacoras', (req, res) => {
    db.all('SELECT * FROM bitacoras_produccion ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(row => ({
            id: row.codigo_bitacora || `BIT-${3320 + row.id}`,
            process: row.proceso,
            machine: row.maquina,
            operator: row.operador,
            shift: row.turno,
            startedAt: row.hora_inicio,
            endedAt: row.hora_fin,
            note: row.observaciones
        }));
        res.json(formatted);
    });
});

app.post('/api/bitacoras', (req, res) => {
    const { codigo_bitacora, proceso, maquina, operador, turno, hora_inicio, hora_fin, observaciones } = req.body;
    const codigo = codigo_bitacora || `BIT-PROD-${Math.floor(100 + Math.random() * 900)}`;
    const query = `
        INSERT INTO bitacoras_produccion (codigo_bitacora, proceso, maquina, operador, turno, hora_inicio, hora_fin, observaciones) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [codigo, proceso, maquina, operador, turno, hora_inicio, hora_fin || '—', observaciones], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Bitácora guardada exitosamente", id: this.lastID });
    });
});

app.get('/api/bitacoras-produccion', (req, res) => {
    db.all('SELECT * FROM bitacoras_produccion ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(row => ({
            id: row.id,
            process: row.proceso,
            machine: row.maquina,
            operator: row.operador,
            shift: row.turno,
            startedAt: row.hora_inicio,
            endedAt: row.hora_fin,
            note: row.observaciones,
            createdAt: row.fecha_registro ? new Date(row.fecha_registro) : new Date()
        }));
        res.json(formatted);
    });
});

app.post('/api/bitacoras-produccion', (req, res) => {
    const { process, machine, operator, shift, startedAt, endedAt, note } = req.body;
    const codigo = `BIT-PROD-${Math.floor(100 + Math.random() * 900)}`;
    const query = `
        INSERT INTO bitacoras_produccion 
        (codigo_bitacora, proceso, maquina, operador, turno, hora_inicio, hora_fin, observaciones) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [codigo, process, machine, operator, shift, startedAt, endedAt || '—', note], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Bitácora de producción guardada con éxito", id: this.lastID });
    });
});

// --- COMPRAS Y ÓRDENES ---
app.get('/api/compras', (req, res) => {
    db.all('SELECT * FROM ordenes_compra ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(row => ({
            id: row.codigo_orden || `OC-2026-${120 + row.id}`,
            supplier: row.proveedor,
            material: row.material,
            qty: parseFloat(row.qty),
            unit: row.unit,
            amount: parseFloat(row.amount),
            eta: row.eta,
            status: row.estatus
        }));
        res.json(formatted);
    });
});

app.post('/api/compras', (req, res) => {
    const { proveedor, material, cantidad, unidad, precio_unitario, total_estimado, fecha_entrega, prioridad, notas } = req.body;
    const codigo = `OC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
    
    const query = `
        INSERT INTO ordenes_compra (codigo_orden, proveedor, material, qty, unit, precio_unitario, amount, eta, prioridad, notas, estatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
    `;
    db.run(query, [codigo, proveedor || 'Proveedor Asignado', material, cantidad, unidad, precio_unitario, total_estimado, fecha_entrega, prioridad, notas], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Orden creada exitosamente', id: this.lastID });
    });
});

// --- CONFIGURACIÓN DE USUARIO ---
app.get('/api/configuracion/:usuario', (req, res) => {
    const { usuario } = req.params;
    db.get('SELECT * FROM configuracion_usuario WHERE usuario_id = ?', [usuario], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) {
            return res.json({ tipo_letra: 'Roboto', idioma: 'Español (MX)', modo_oscuro: false });
        }
        res.json({
            tipo_letra: row.tipo_letra,
            idioma: row.idioma,
            modo_oscuro: row.modo_oscuro === 1
        });
    });
});

app.post('/api/configuracion', (req, res) => {
    const { usuario_id, tipo_letra, idioma, modo_oscuro } = req.body;
    const query = `
        INSERT OR REPLACE INTO configuracion_usuario (usuario_id, tipo_letra, idioma, modo_oscuro) 
        VALUES (?, ?, ?, ?)
    `;
    db.run(query, [usuario_id || 'EMP-001', tipo_letra, idioma, modo_oscuro ? 1 : 0], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Configuración actualizada correctamente" });
    });
});

// --- CONTACTOS ---
app.get('/api/contactos', (req, res) => {
    db.all('SELECT * FROM contactos ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(row => ({
            id: row.id.toString(),
            name: row.nombre,
            company: row.empresa,
            phone: row.telefono,
            email: row.email,
            type: row.tipo,
            invoices: []
        }));
        res.json(formatted);
    });
});

app.post('/api/contactos', (req, res) => {
    const { nombre, empresa, telefono, email, tipo } = req.body;
    const query = 'INSERT INTO contactos (nombre, empresa, telefono, email, tipo) VALUES (?, ?, ?, ?, ?)';
    db.run(query, [nombre, empresa, telefono || '-', email, tipo], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contacto guardado exitosamente", id: this.lastID });
    });
});

app.delete('/api/contactos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM contactos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contacto eliminado correctamente" });
    });
});

app.put('/api/contactos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, empresa, telefono, email, tipo } = req.body;
    const query = 'UPDATE contactos SET nombre = ?, empresa = ?, telefono = ?, email = ?, tipo = ? WHERE id = ?';
    db.run(query, [nombre, empresa, telefono, email, tipo, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contacto actualizado correctamente" });
    });
});

// --- COTIZACIONES ---
app.get('/api/cotizaciones', (req, res) => {
    db.all('SELECT * FROM cotizaciones ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(row => ({
            id: row.folio,
            client: row.cliente,
            segment: row.segmento,
            amount: parseFloat(row.total),
            owner: row.responsable,
            date: row.validez || '2026-06-01',
            status: row.estatus,
            producto: row.producto,
            cantidad: row.cantidad,
            unidad: row.unidad,
            precioUnitario: parseFloat(row.precio_unitario),
            condiciones: row.condiciones,
            notas: row.notas
        }));
        res.json(formatted);
    });
});

app.post('/api/cotizaciones', (req, res) => {
    const { cliente, segmento, responsable, producto, cantidad, unidad, precioUnitario, validez, condiciones, notas } = req.body;
    const subtotal = parseFloat(cantidad) * parseFloat(precioUnitario);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    const folio = `COT-2026-${Math.floor(10 + Math.random() * 90)}`;

    const query = `
        INSERT INTO cotizaciones 
        (folio, cliente, segmento, responsable, producto, cantidad, unidad, precio_unitario, subtotal, iva, total, validez, condiciones, notas, estatus) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'En revisión')
    `;
    db.run(query, [folio, cliente, segmento, responsable, producto, cantidad, unidad, precioUnitario, subtotal, iva, total, validez, condiciones, notas], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cotización generada con éxito", folio, id: this.lastID });
    });
});

// --- RECUPERACIÓN DE CONTRASEÑA ---
app.post('/api/auth/recuperar', (req, res) => {
    const { email } = req.body;
    const checkUser = 'SELECT * FROM usuarios WHERE email = ?';
    db.get(checkUser, [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const insertToken = 'INSERT INTO recuperacion_password (email, token, expiracion) VALUES (?, ?, ?)';
        db.run(insertToken, [email, token, expiracion], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: "Se han enviado las instrucciones de recuperación al correo." });
        });
    });
});

// --- SOLICITUDES INTERNAS ---
app.get('/api/solicitudes', (req, res) => {
    db.all('SELECT * FROM solicitudes ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(row => ({
            id: row.id.toString(),
            folio: row.folio,
            type: row.tipo,
            operator: row.empleado,
            numero_empleado: row.numero_empleado,
            area: row.area,
            turno: row.turno,
            priority: row.prioridad,
            descripcion: row.descripcion,
            status: row.estatus,
            date: row.fecha || '',
            archivo: row.archivo
        }));
        res.json(formatted);
    });
});

app.post('/api/solicitudes', (req, res) => {
    const { tipo, empleado, numero_empleado, area, turno, prioridad, descripcion, archivo } = req.body;
    const folio = `SOL-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
    const fecha = new Date().toISOString().split('T')[0];

    const query = `
        INSERT INTO solicitudes (folio, tipo, empleado, numero_empleado, area, turno, prioridad, descripcion, fecha, estatus, archivo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)
    `;
    
    db.run(query, [folio, tipo, empleado, numero_empleado, area, turno, prioridad, descripcion, fecha, archivo || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Solicitud creada con éxito', id: this.lastID });
    });
});

// --- TAREAS DEL OPERADOR ---
app.get('/api/tareas-operador', (req, res) => {
    db.all('SELECT * FROM tareas_operador ORDER BY id ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/tareas-operador/:id', (req, res) => {
    const { id } = req.params;
    const { status, current } = req.body;
    let query = 'UPDATE tareas_operador SET status = ?';
    let params = [status];

    if (current !== undefined) {
        query += ', current = ?';
        params.push(current);
    }
    query += ' WHERE id = ?';
    params.push(id);

    db.run(query, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Tarea actualizada correctamente" });
    });
});

// --- VENTAS Y EMBARQUES ---
app.get('/api/ventas', (req, res) => {
    db.all('SELECT * FROM ventas ORDER BY id DESC', [], (err, ventasRows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all('SELECT * FROM productos_venta', [], (err2, prodRows) => {
            if (err2) return res.status(500).json({ error: err2.message });

            const formatted = ventasRows.map(sale => {
                const prods = prodRows
                    .filter(p => p.venta_id === sale.id)
                    .map(p => ({
                        partNumber: p.part_number,
                        descripcion: p.descripcion,
                        cantidad: p.cantidad,
                        peso: p.peso
                    }));

                return {
                    id: sale.id.toString(),
                    folio: sale.folio,
                    cliente: sale.cliente,
                    estatusFactura: sale.estatus_factura,
                    archivoFactura: sale.archivo_factura,
                    estatusEmbarque: sale.estatus_embarque,
                    fechaSalida: sale.fecha_salida,
                    destino: sale.destino,
                    contacto: sale.contacto,
                    telefono: sale.telefono,
                    email: sale.email,
                    condicionesPago: sale.condiciones_pago,
                    monto: parseFloat(sale.monto),
                    productos: prods,
                    chofer: sale.chofer,
                    transportista: sale.transportista,
                    placas: sale.placas,
                    notas: sale.notas
                };
            });
            res.json(formatted);
        });
    });
});

app.post('/api/embarques', (req, res) => {
    const { factura, chofer, transportista, fechaSalida, observaciones } = req.body;
    const query = `
        UPDATE ventas 
        SET estatus_embarque = 'en_transito', chofer = ?, transportista = ?, fecha_salida = ?, notas = COALESCE(notas, '') || ' | Observación: ' || ?
        WHERE folio = ? OR archivo_factura LIKE ?
    `;
    db.run(query, [chofer, transportista, fechaSalida, observaciones || '', factura, `%${factura}%`], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Embarque creado y vinculado con éxito" });
    });
});

app.get('/api/detalle-embarque/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;
    db.get('SELECT * FROM detalle_embarques WHERE order_number = ?', [orderNumber], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Embarque no encontrado' });

        const data = {
            orderNumber: row.order_number,
            shipmentNumber: row.shipment_number,
            status: row.status,
            priority: row.priority,
            shippingMethod: row.shipping_method,
            salesperson: row.salesperson,
            customer: {
                fullName: row.customer_name,
                company: row.company_name,
                contact: row.contact_person,
                phone: row.phone,
                email: row.email,
                operator: row.operator_name
            },
            dates: {
                saleDate: row.sale_date,
                scheduledShipment: row.scheduled_shipment_date,
                estimatedDelivery: row.estimated_delivery_date
            },
            destination: {
                address: row.delivery_address,
                city: row.city,
                state: row.state,
                postalCode: row.postal_code,
                country: row.country
            },
            transport: {
                type: row.transport_type,
                carrier: row.carrier_company,
                guideNumber: row.guide_number,
                packaging: row.packaging_type,
                conditions: row.special_conditions,
                paymentMethod: row.payment_method
            },
            invoice: {
                number: row.invoice_number,
                date: row.invoice_date,
                rfc: row.rfc,
                status: row.payment_status,
                subtotal: parseFloat(row.subtotal),
                tax: parseFloat(row.tax),
                total: parseFloat(row.total)
            },
            products: []
        };
        res.json(data);
    });
});

app.post('/api/ventas', (req, res) => {
    const { cliente, destino, contacto, telefono, email, condiciones_pago, monto, notas } = req.body;
    const folio = `VEN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const query = `
        INSERT INTO ventas 
        (folio, cliente, destino, contacto, telefono, email, condiciones_pago, monto, estatus_factura, estatus_embarque, notas) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 'pendiente', ?)
    `;
    
    db.run(query, [
        folio, 
        cliente, 
        destino || 'No especificado', 
        contacto || '', 
        telefono || '', 
        email || '', 
        condiciones_pago || 'Contado', 
        monto || 0, 
        notas || ''
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Venta registrada con éxito', folio, id: this.lastID });
    });
}); 

// --- UNIFICACIÓN FRONTEND/BACKEND ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`ERP de Magni Plastic ejecutándose en http://localhost:${PORT}`);
});