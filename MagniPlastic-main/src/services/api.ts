// src/services/api.ts

const API_URL = 'http://localhost:3001/api';

// --- INVENTARIO ---
export const getInventario = async () => {
    const response = await fetch(`${API_URL}/inventario`);
    if (!response.ok) throw new Error('Error al obtener inventario');
    return response.json();
};

export const registrarEntradaInventario = async (datos: { sku: string, cantidad: number, lote: string, notas: string }) => {
    const response = await fetch(`${API_URL}/inventario/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!response.ok) throw new Error('Error al registrar entrada');
    return response.json();
};

// --- PRODUCCIÓN Y DASHBOARD ---
export const getDashboardKPIs = async () => {
    const response = await fetch(`${API_URL}/produccion/kpis`);
    if (!response.ok) throw new Error('Error al obtener KPIs');
    return response.json();
};

export const fetchBitacoras = async () => {
    const response = await fetch(`${API_URL}/bitacoras`);
    if (!response.ok) throw new Error('Error al cargar bitácoras');
    return response.json();
};

export const guardarBitacoraApi = async (data: any) => {
    const response = await fetch(`${API_URL}/bitacoras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al guardar bitácora');
    return response.json();
};

// --- ASISTENCIA ---
export const registrarAsistenciaApi = async (data: { numero_empleado: string; tipo_evento: string; hora: string }) => {
    const response = await fetch(`${API_URL}/asistencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al registrar asistencia');
    return response.json();
};



// --- VENTAS Y COMPRAS ---
export const generarCotizacion = async (datos: any) => {
    const response = await fetch(`${API_URL}/ventas/cotizacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!response.ok) throw new Error('Error al generar cotización');
    return response.json();
};

export const fetchCompras = async () => {
    const response = await fetch(`${API_URL}/compras`);
    if (!response.ok) throw new Error('Error al cargar órdenes de compra');
    return response.json();
};

export const crearOrdenCompraApi = async (data: any) => {
    const response = await fetch(`${API_URL}/compras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear orden de compra');
    return response.json();
};

export const fetchConfiguracion = async (usuario: string = 'EMP-001') => {
    const response = await fetch(`${API_URL}/configuracion/${usuario}`);
    if (!response.ok) throw new Error('Error al cargar configuración');
    return response.json();
};

export const guardarConfiguracionApi = async (data: any) => {
    const response = await fetch(`${API_URL}/configuracion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al guardar configuración');
    return response.json();
};

export const fetchContactos = async () => {
    const response = await fetch(`${API_URL}/contactos`);
    if (!response.ok) throw new Error('Error al cargar contactos');
    return response.json();
};

export const crearContactoApi = async (data: { nombre: string; empresa: string; telefono: string; email: string; tipo: string }) => {
    const response = await fetch(`${API_URL}/contactos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear contacto');
    return response.json();
};

export const fetchCotizaciones = async () => {
    const response = await fetch(`${API_URL}/cotizaciones`);
    if (!response.ok) throw new Error('Error al cargar cotizaciones');
    return response.json();
};

export const crearCotizacionApi = async (data: any) => {
    const response = await fetch(`${API_URL}/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear cotización');
    return response.json();
};

export const recuperarPasswordApi = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Error al procesar la recuperación de contraseña');
    return response.json();
};

export const fetchInventarioApi = async () => {
    const response = await fetch(`${API_URL}/inventario`);
    if (!response.ok) throw new Error('Error al cargar inventario');
    return response.json();
};

export const registrarMovimientoInventario = async (data: { sku: string; tipo: 'entrada' | 'salida'; cantidad: number; lote: string; notas: string }) => {
    // Si es entrada, usa /api/inventario/entrada o /api/inventario/movimiento unificado. 
    // Usaremos la ruta general de movimiento que ya maneja sumas y restas:
    const response = await fetch(`${API_URL}/inventario/movimiento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al registrar movimiento en inventario');
    }
    return response.json();
};

export const loginApi = async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al iniciar sesión');
    }
    return response.json();
};

export const fetchBitacorasProduccion = async () => {
    const response = await fetch(`${API_URL}/bitacoras-produccion`);
    if (!response.ok) throw new Error('Error al cargar bitácoras de producción');
    return response.json();
};

export const crearBitacoraProduccionApi = async (data: any) => {
    const response = await fetch(`${API_URL}/bitacoras-produccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al guardar bitácora de producción');
    return response.json();
};


export const fetchSolicitudes = async () => {
    const response = await fetch(`${API_URL}/solicitudes`);
    if (!response.ok) throw new Error('Error al cargar solicitudes');
    return response.json();
};

export const crearSolicitudApi = async (data: any) => {
    const response = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al registrar la solicitud');
    }
    return response.json();
};

// Si en tu frontend usabas esta función por separado, actualízala para que apunte a la misma ruta:
export const enviarSolicitudInterna = async (datos: any) => {
    return crearSolicitudApi(datos);
};



export const fetchTareasOperador = async () => {
    const response = await fetch(`${API_URL}/tareas-operador`);
    if (!response.ok) throw new Error('Error al cargar las tareas del operador');
    return response.json();
};

export const actualizarTareaOperadorApi = async (id: string, data: { status: string; current?: number }) => {
    const response = await fetch(`${API_URL}/tareas-operador/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar la tarea');
    return response.json();
};

export const fetchVentas = async () => {
    const response = await fetch(`${API_URL}/ventas`);
    if (!response.ok) throw new Error('Error al cargar ventas y embarques');
    return response.json();
};

export const crearEmbarqueApi = async (data: any) => {
    const response = await fetch(`${API_URL}/embarques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear el embarque');
    return response.json();
};

export const fetchDetalleEmbarque = async (orderNumber: string = "VEN-2026-0342") => {
    const response = await fetch(`${API_URL}/detalle-embarque/${orderNumber}`);
    if (!response.ok) throw new Error('Error al cargar el detalle del embarque');
    return response.json();
};



export const crearItemInventario = async (data: { sku: string; name: string; category: string; location: string; stock: number; min: number; unit: string }) => {
    const response = await fetch(`${API_URL}/inventario/nuevo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al crear material');
    }
    return response.json();
};

export const eliminarContactoApi = async (id: string) => {
    const response = await fetch(`${API_URL}/contactos/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar contacto');
    return response.json();
};

export const actualizarContactoApi = async (id: string, data: { nombre: string; empresa: string; telefono: string; email: string; tipo: string }) => {
    const response = await fetch(`${API_URL}/contactos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar contacto');
    return response.json();
};

export const crearVentaApi = async (data: any) => {
    const response = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al registrar la venta');
    }
    return response.json();
};