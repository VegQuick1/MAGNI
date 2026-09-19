const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la BD
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// --- AUTENTICACIÓN / LOGIN ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT email, role, nombre FROM usuarios WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(401).json({ error: "Credenciales incorrectas." });
        }
        const user = results[0];
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
    db.query(query, [numero_empleado || 'EMP-001', tipo_evento, hora], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Asistencia registrada correctamente", id: results.insertId });
    });
});

// --- INVENTARIO ---
app.get('/api/inventario', (req, res) => {
    db.query('SELECT sku, name, category, location, stock, min_stock as `min`, unit FROM inventario', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/inventario/movimiento', (req, res) => {
    const { sku, tipo, cantidad, lote, notas } = req.body;
    const insertQuery = 'INSERT INTO movimientos_inventario (sku, tipo, cantidad, lote, notas) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [sku, tipo, cantidad, lote || '', notas || ''], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const operador = tipo === 'entrada' ? '+' : '-';
        const updateQuery = `UPDATE inventario SET stock = stock ${operador} ? WHERE sku = ?`;
        
        db.query(updateQuery, [cantidad, sku], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: `Movimiento de ${tipo} registrado con éxito` });
        });
    });
});

// --- BITÁCORAS DE PRODUCCIÓN ---
app.get('/api/bitacoras', (req, res) => {
    db.query('SELECT * FROM bitacoras_produccion ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(row => ({
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
    db.query(query, [codigo, proceso, maquina, operador, turno, hora_inicio, hora_fin || '—', observaciones], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Bitácora guardada exitosamente", id: results.insertId });
    });
});

app.get('/api/bitacoras-produccion', (req, res) => {
    db.query('SELECT * FROM bitacoras_produccion ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(row => ({
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
    db.query(query, [codigo, process, machine, operator, shift, startedAt, endedAt || '—', note], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Bitácora de producción guardada con éxito", id: results.insertId });
    });
});

// --- COMPRAS Y ÓRDENES ---
app.get('/api/compras', (req, res) => {
    db.query('SELECT * FROM ordenes_compra ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(row => ({
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


// --- CONFIGURACIÓN DE USUARIO ---
app.get('/api/configuracion/:usuario', (req, res) => {
    const { usuario } = req.params;
    db.query('SELECT * FROM configuracion_usuario WHERE usuario_id = ?', [usuario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.json({ tipo_letra: 'Roboto', idioma: 'Español (MX)', modo_oscuro: false });
        }
        res.json(results[0]);
    });
});

app.post('/api/configuracion', (req, res) => {
    const { usuario_id, tipo_letra, idioma, modo_oscuro } = req.body;
    const query = `
        INSERT INTO configuracion_usuario (usuario_id, tipo_letra, idioma, modo_oscuro) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE tipo_letra = ?, idioma = ?, modo_oscuro = ?
    `;
    db.query(query, [usuario_id || 'EMP-001', tipo_letra, idioma, modo_oscuro, tipo_letra, idioma, modo_oscuro], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Configuración actualizada correctamente" });
    });
});

// --- CONTACTOS ---
app.get('/api/contactos', (req, res) => {
    db.query('SELECT * FROM contactos ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(row => ({
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
    db.query(query, [nombre, empresa, telefono || '-', email, tipo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contacto guardado exitosamente", id: results.insertId });
    });
});

// --- COTIZACIONES ---
app.get('/api/cotizaciones', (req, res) => {
    db.query('SELECT * FROM cotizaciones ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(row => ({
            id: row.folio,
            client: row.cliente,
            segment: row.segmento,
            amount: parseFloat(row.total),
            owner: row.responsable,
            date: row.validez ? row.validez.toISOString().split('T')[0] : '2026-06-01',
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
    db.query(query, [folio, cliente, segmento, responsable, producto, cantidad, unidad, precioUnitario, subtotal, iva, total, validez, condiciones, notas], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cotización generada con éxito", folio, id: results.insertId });
    });
});

// --- RECUPERACIÓN DE CONTRASEÑA ---
app.post('/api/auth/recuperar', (req, res) => {
    const { email } = req.body;
    const checkUser = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkUser, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const insertToken = 'INSERT INTO recuperacion_password (email, token, expiracion) VALUES (?, ?, ?)';
        db.query(insertToken, [email, token, expiracion], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: "Se han enviado las instrucciones de recuperación al correo." });
        });
    });
});


// --- SOLICITUDES INTERNAS ---
app.get('/api/solicitudes', (req, res) => {
    db.query('SELECT * FROM solicitudes ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(row => ({
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
            date: row.fecha ? row.fecha.toISOString().split('T')[0] : '',
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
    
    db.query(query, [folio, tipo, empleado, numero_empleado, area, turno, prioridad, descripcion, fecha, archivo || null], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Solicitud creada con éxito', id: result.insertId });
    });
});

// --- TAREAS DEL OPERADOR ---
app.get('/api/tareas-operador', (req, res) => {
    db.query('SELECT * FROM tareas_operador ORDER BY id ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
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

    db.query(query, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Tarea actualizada correctamente" });
    });
});

// --- VENTAS Y EMBARQUES ---
app.get('/api/ventas', (req, res) => {
    const queryVentas = 'SELECT * FROM ventas ORDER BY id DESC';
    db.query(queryVentas, (err, ventasResults) => {
        if (err) return res.status(500).json({ error: err.message });

        const queryProductos = 'SELECT * FROM productos_venta';
        db.query(queryProductos, (err, prodResults) => {
            if (err) return res.status(500).json({ error: err.message });

            const formatted = ventasResults.map(sale => {
                const prods = prodResults
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
        SET estatus_embarque = 'en_transito', chofer = ?, transportista = ?, fecha_salida = ?, notas = CONCAT(IFNULL(notas, ''), ' | Observación: ', ?)
        WHERE folio = ? OR archivo_factura LIKE CONCAT('%', ?, '%')
    `;
    db.query(query, [chofer, transportista, fechaSalida, observaciones || '', factura, factura], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Embarque creado y vinculado con éxito" });
    });
});

app.get('/api/detalle-embarque/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;
    const queryEmbarque = 'SELECT * FROM detalle_embarques WHERE order_number = ?';
    db.query(queryEmbarque, [orderNumber], (err, embarqueResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (embarqueResults.length === 0) return res.status(404).json({ error: 'Embarque no encontrado' });

        const row = embarqueResults[0];
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

// --- UNIFICACIÓN FRONTEND/BACKEND ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`ERP de Magni Plastic ejecutándose en http://localhost:${PORT}`);
});

app.post('/api/inventario/nuevo', (req, res) => {
    const { sku, name, category, location, stock, min, unit } = req.body;
    const query = `
        INSERT INTO inventario (sku, name, category, location, stock, min_stock, unit) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [sku, name, category, location, stock || 0, min || 50, unit || 'pza'], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Material creado exitosamente en inventario" });
    });
});

// --- COMPRAS (Actualización para guardar el proveedor correcto) ---
app.post('/api/compras', (req, res) => {
    const { proveedor, material, cantidad, unidad, precio_unitario, total_estimado, fecha_entrega, prioridad, notas } = req.body;
    const codigo = `OC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
    
    const query = `
        INSERT INTO ordenes_compra (codigo_orden, proveedor, material, qty, unit, precio_unitario, amount, eta, prioridad, notas, estatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
    `;
    db.query(query, [codigo, proveedor || 'Proveedor Asignado', material, cantidad, unidad, precio_unitario, total_estimado, fecha_entrega, prioridad, notas], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Orden creada exitosamente', id: result.insertId });
    });
});

// --- ELIMINAR CONTACTO ---
app.delete('/api/contactos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM contactos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contacto eliminado correctamente" });
    });
});

// --- EDITAR CONTACTO ---
app.put('/api/contactos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, empresa, telefono, email, tipo } = req.body;
    const query = 'UPDATE contactos SET nombre = ?, empresa = ?, telefono = ?, email = ?, tipo = ? WHERE id = ?';
    db.query(query, [nombre, empresa, telefono, email, tipo, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contacto actualizado correctamente" });
    });
});