import { useState, useCallback } from 'react';

export type Config = {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  dirMatriz: string;
  estab: string;
  ptoEmi: string;
  secuencial: number;
  obligadoContabilidad: string;
  ambiente: string;
  registroSanitario: string;
  pieFactura: string;
  pieTicket: string;
};

export type Cliente = {
  id: string;
  tipoId: string;
  identificacion: string;
  nombre: string;
  email: string;
  direccion: string;
  telefono: string;
  fechaNacimiento: string;
  alergias: string;
  grupoSanguineo: string;
  condiciones: string;
  fechaRegistro: string;
};

export type Servicio = {
  id: string;
  nombre: string;
  tipoIva: number;
  precioSinIva: number;
  precioConIva: number;
};

export type Factura = {
  id: string;
  numeroFactura: string;
  secuencial: number;
  fechaEmision: string;
  fechaISO: string;
  clienteId: string;
  clienteNombre: string;
  clienteIdentificacion: string;
  clienteTipoId: string;
  clienteEmail: string;
  clienteDireccion: string;
  lineas: FacturaLinea[];
  subtotal: number;
  iva: number;
  total: number;
  xml: string | null;
  estado: string;
};

export type FacturaLinea = {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  tipoIva: number;
  descuento: number;
};

export type Cita = {
  id: string;
  fecha: string;
  hora: string;
  clienteId: string;
  clienteNombre: string;
  servicioId: string;
  servicioNombre: string;
  estado: string;
  notas: string;
};

export type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  costo: number;
};

export type Kardex = {
  id: string;
  fecha: string;
  productoId: string;
  productoNombre: string;
  tipo: string;
  cantidad: number;
  proveedor: string;
  factura: string;
};

export type MovimientoCaja = {
  id: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  concepto: string;
  fecha: string;
};

export type Caja = {
  abierta: boolean;
  fechaApertura: string | null;
  montoApertura: number;
  movimientos: MovimientoCaja[];
};

export type Arqueo = {
  id: string;
  fechaApertura: string;
  fechaCierre: string;
  montoApertura: number;
  saldoEsperado: number;
  montoReal: number;
  diferencia: number;
  movimientos: MovimientoCaja[];
};

export type Compra = {
  id: string;
  tipo: 'compra' | 'gasto';
  proveedor: string;
  beneficiario: string;
  categoria: string;
  descripcion: string;
  subtotal: number;
  ivaPorc: number;
  ivaValor: number;
  total: number;
  formaPago: string;
  fecha: string;
  fechaISO: string;
  documento: string;
  notas: string;
};

export type Consentimiento = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteIdentificacion: string;
  fecha: string;
  hora: string;
  alergias: string;
  grupoSanguineo: string;
  condiciones: string;
};

export const STORAGE_KEYS = {
  CONFIG: 'tatuador_config',
  CLIENTES: 'tatuador_clientes',
  SERVICIOS: 'tatuador_servicios',
  FACTURAS: 'tatuador_facturas',
  CITAS: 'tatuador_citas',
  PRODUCTOS: 'tatuador_productos',
  KARDEX: 'tatuador_kardex',
  CAJA: 'tatuador_caja',
  ARQUEOS: 'tatuador_arqueos',
  COMPRAS: 'tatuador_compras',
  CONSENTIMIENTOS: 'tatuador_consentimientos',
};

const defaultServices: Servicio[] = [
  { id: 'SRV-001', nombre: 'Tatuaje pequeño (hasta 5cm)', tipoIva: 15, precioSinIva: 43.48, precioConIva: 50 },
  { id: 'SRV-002', nombre: 'Tatuaje mediano (5-15cm)', tipoIva: 15, precioSinIva: 104.35, precioConIva: 120 },
  { id: 'SRV-003', nombre: 'Tatuaje grande (más de 15cm)', tipoIva: 15, precioSinIva: 217.39, precioConIva: 250 },
  { id: 'SRV-004', nombre: 'Sesión de retoque', tipoIva: 15, precioSinIva: 26.09, precioConIva: 30 },
  { id: 'SRV-005', nombre: 'Perforación corporal', tipoIva: 15, precioSinIva: 21.74, precioConIva: 25 },
];

const defaultProducts: Producto[] = [
  { id: 'PRD-001', nombre: 'Tinta negra 30ml', categoria: 'Tintas', stock: 3, minimo: 2, costo: 12.50 },
  { id: 'PRD-002', nombre: 'Agujas liner 3RL', categoria: 'Agujas', stock: 10, minimo: 5, costo: 1.20 },
  { id: 'PRD-003', nombre: 'Guantes nitrilo (caja)', categoria: 'Insumos', stock: 1, minimo: 2, costo: 8.00 },
  { id: 'PRD-004', nombre: 'Papel film transparente', categoria: 'Insumos', stock: 5, minimo: 3, costo: 4.50 },
];

const defaultConfig: Config = {
  ruc: '1712345678001',
  razonSocial: 'TATUAJES ARTÍSTICOS ANDES',
  nombreComercial: 'Estudio Black Ink',
  dirMatriz: 'Av. Amazonas N24-123, Quito',
  estab: '001',
  ptoEmi: '001',
  secuencial: 1,
  obligadoContabilidad: 'NO',
  ambiente: '1',
  registroSanitario: '',
  pieFactura: 'Gracias por su preferencia. Documento sin validez tributaria (simulación).',
  pieTicket: '¡Gracias por tu visita! Estudio Black Ink',
};

function storageAvailable(): boolean {
  try {
    const testKey = '__test_ls__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const memStorage: Record<string, any> = {};
const storageOk = storageAvailable();

function getItem<T>(key: string, fallback: T): T {
  try {
    if (storageOk) {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : (memStorage[key] !== undefined ? memStorage[key] : fallback);
    }
    return memStorage[key] !== undefined ? memStorage[key] : fallback;
  } catch {
    return memStorage[key] !== undefined ? memStorage[key] : fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  memStorage[key] = value;
  try {
    if (storageOk) localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('No se pudo guardar en localStorage:', key);
  }
}

function removeItem(key: string): void {
  delete memStorage[key];
  try {
    if (storageOk) localStorage.removeItem(key);
  } catch {}
}

export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatMoney(n: number): string {
  return '$' + parseFloat(String(n || 0)).toFixed(2);
}

export function fechaActual(): string {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

export function fechaISO(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function calcularEdad(fechaNacimiento: string): number | null {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento + 'T00:00:00');
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export function formatearFecha(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d + '/' + m + '/' + y;
}

export function normalizarServicio(s: any): Servicio {
  if (s.precioSinIva !== undefined && s.tipoIva !== undefined) return s;
  const sin = parseFloat(s.precio) || 0;
  const tipo = 15;
  return {
    id: s.id,
    nombre: s.nombre,
    tipoIva: tipo,
    precioSinIva: sin,
    precioConIva: +(sin * (1 + tipo / 100)).toFixed(2),
  };
}

export function escapeHTML(s: any): string {
  if (s == null) return '';
  return String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

export function escapeXML(s: any): string {
  return escapeHTML(s).replace(/'/g, '&apos;');
}

export function esTunel(): boolean {
  const host = window.location.hostname;
  return host.includes('ngrok') ||
    host.includes('trycloudflare') ||
    host.includes('loca.lt') ||
    host.includes('tunnel') ||
    host.includes('serveo') ||
    (window.location.protocol === 'https:' && host !== 'localhost' && host !== '127.0.0.1');
}

export function useStorage() {
  const [storageOkState] = useState(storageOk);

  const getConfig = useCallback((): Config => getItem(STORAGE_KEYS.CONFIG, { ...defaultConfig }), []);
  const saveConfig = useCallback((c: Config) => setItem(STORAGE_KEYS.CONFIG, c), []);

  const getClientes = useCallback((): Cliente[] => getItem(STORAGE_KEYS.CLIENTES, []), []);
  const saveClientes = useCallback((c: Cliente[]) => setItem(STORAGE_KEYS.CLIENTES, c), []);

  const getServicios = useCallback((): Servicio[] => getItem(STORAGE_KEYS.SERVICIOS, [...defaultServices]), []);
  const saveServicios = useCallback((s: Servicio[]) => setItem(STORAGE_KEYS.SERVICIOS, s), []);

  const getFacturas = useCallback((): Factura[] => getItem(STORAGE_KEYS.FACTURAS, []), []);
  const saveFacturas = useCallback((f: Factura[]) => setItem(STORAGE_KEYS.FACTURAS, f), []);

  const getCitas = useCallback((): Cita[] => getItem(STORAGE_KEYS.CITAS, []), []);
  const saveCitas = useCallback((c: Cita[]) => setItem(STORAGE_KEYS.CITAS, c), []);

  const getProductos = useCallback((): Producto[] => getItem(STORAGE_KEYS.PRODUCTOS, [...defaultProducts]), []);
  const saveProductos = useCallback((p: Producto[]) => setItem(STORAGE_KEYS.PRODUCTOS, p), []);

  const getKardex = useCallback((): Kardex[] => getItem(STORAGE_KEYS.KARDEX, []), []);
  const saveKardex = useCallback((k: Kardex[]) => setItem(STORAGE_KEYS.KARDEX, k), []);

  const getCaja = useCallback((): Caja => getItem(STORAGE_KEYS.CAJA, { abierta: false, fechaApertura: null, montoApertura: 0, movimientos: [] }), []);
  const saveCaja = useCallback((c: Caja) => setItem(STORAGE_KEYS.CAJA, c), []);

  const getArqueos = useCallback((): Arqueo[] => getItem(STORAGE_KEYS.ARQUEOS, []), []);
  const saveArqueos = useCallback((a: Arqueo[]) => setItem(STORAGE_KEYS.ARQUEOS, a), []);

  const getCompras = useCallback((): Compra[] => getItem(STORAGE_KEYS.COMPRAS, []), []);
  const saveCompras = useCallback((c: Compra[]) => setItem(STORAGE_KEYS.COMPRAS, c), []);

  const getConsentimientos = useCallback((): Consentimiento[] => getItem(STORAGE_KEYS.CONSENTIMIENTOS, []), []);
  const saveConsentimientos = useCallback((c: Consentimiento[]) => setItem(STORAGE_KEYS.CONSENTIMIENTOS, c), []);

  const exportarDatos = useCallback(() => {
    const backup: Record<string, any> = {};
    Object.values(STORAGE_KEYS).forEach(k => {
      const v = getItem(k, null);
      if (v !== null) backup[k] = v;
    });
    backup.__exportedAt = new Date().toISOString();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `tatuador_backup_${fecha}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
    return json;
  }, []);

  const importarDatos = useCallback((data: any) => {
    Object.keys(data).forEach(k => {
      if (k !== '__exportedAt' && Object.values(STORAGE_KEYS).includes(k)) {
        setItem(k, data[k]);
      }
    });
  }, []);

  const borrarTodo = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => {
      removeItem(k);
    });
  }, []);

  return {
    storageOk: storageOkState,
    getConfig, saveConfig,
    getClientes, saveClientes,
    getServicios, saveServicios,
    getFacturas, saveFacturas,
    getCitas, saveCitas,
    getProductos, saveProductos,
    getKardex, saveKardex,
    getCaja, saveCaja,
    getArqueos, saveArqueos,
    getCompras, saveCompras,
    getConsentimientos, saveConsentimientos,
    exportarDatos, importarDatos, borrarTodo,
  };
}