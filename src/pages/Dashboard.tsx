import { useEffect, useState } from 'react';
import { useStorage, formatMoney, fechaISO, escapeHTML } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    facturadoMes: 0,
    citasHoy: 0,
    stockBajo: 0,
    clientes: 0,
  });
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [stockBajoList, setStockBajoList] = useState<any[]>([]);
  const [ultimasFacturas, setUltimasFacturas] = useState<any[]>([]);

  const calcularStats = () => {
    const facturas = storage.getFacturas();
    const citas = storage.getCitas();
    const productos = storage.getProductos();
    const clientes = storage.getClientes();
    const hoy = fechaISO();
    const mesActual = hoy.substring(0, 7);

    const facturadoMes = facturas
      .filter((f) => f.fechaISO && f.fechaISO.substring(0, 7) === mesActual)
      .reduce((s, f) => s + (f.total || 0), 0);

    const citasHoyList = citas.filter((c) => c.fecha === hoy);
    const stockBajo = productos.filter((s) => s.stock <= s.minimo);

    setStats({
      facturadoMes,
      citasHoy: citasHoyList.length,
      stockBajo: stockBajo.length,
      clientes: clientes.length,
    });
    setCitasHoy(citasHoyList);
    setStockBajoList(stockBajo);
    setUltimasFacturas(facturas.slice(-5).reverse());
  };

  useEffect(() => {
    calcularStats();
  }, []);

  const navegar = (view: string) => {
    navigate('/' + view);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-[#3a2a1a] border-l-4 border-[#f39c12] text-[#e0e0e0]">
        <AlertTitle>⚠️ Simulación:</AlertTitle>
        <AlertDescription>
          Este sistema NO firma ni transmite al SRI. Requiere backend con certificado PKCS#12 para cumplir normativa 2026.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-box bg-[#222] p-4 rounded-lg border-l-4 border-[#d4af37]">
          <div className="stat-label text-xs text-[#888] uppercase tracking-wider">Facturado este mes</div>
          <div className="stat-value text-xl font-bold text-[#d4af37] mt-1">{formatMoney(stats.facturadoMes)}</div>
        </div>
        <div className="stat-box bg-[#222] p-4 rounded-lg border-l-4 border-[#d4af37]">
          <div className="stat-label text-xs text-[#888] uppercase tracking-wider">Citas hoy</div>
          <div className="stat-value text-xl font-bold text-[#d4af37] mt-1">{stats.citasHoy}</div>
        </div>
        <div className={`stat-box bg-[#222] p-4 rounded-lg border-l-4 ${stats.stockBajo > 0 ? 'border-[#e74c3c] alert' : 'border-[#d4af37]'}`}>
          <div className="stat-label text-xs text-[#888] uppercase tracking-wider">Insumos bajo stock</div>
          <div className={`stat-value text-xl font-bold mt-1 ${stats.stockBajo > 0 ? 'text-[#e74c3c]' : 'text-[#d4af37]'}`}>{stats.stockBajo}</div>
        </div>
        <div className="stat-box bg-[#222] p-4 rounded-lg border-l-4 border-[#d4af37]">
          <div className="stat-label text-xs text-[#888] uppercase tracking-wider">Clientes registrados</div>
          <div className="stat-value text-xl font-bold text-[#d4af37] mt-1">{stats.clientes}</div>
        </div>
      </div>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">💾 Respaldo de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Si usas la app por túnel y la URL cambia, exporta tus datos antes y restáuralos después.
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => { storage.exportarDatos(); }} className="bg-[#27ae60] hover:bg-[#229954] text-white">
              📤 Exportar datos (JSON)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev: any) => {
                    try {
                      const data = JSON.parse(ev.target.result);
                      if (confirm('Esto reemplazará TODOS los datos actuales. ¿Continuar?')) {
                        storage.importarDatos(data);
                        window.location.reload();
                      }
                    } catch (err: any) {
                      alert('Archivo inválido: ' + err.message);
                    }
                  };
                  reader.readAsText(file);
                };
                input.click();
              }}
              className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f0f0f]"
            >
              📥 Importar datos (JSON)
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('¿Borrar TODOS los datos de la aplicación? Esta acción no se puede deshacer.')) {
                  storage.borrarTodo();
                  window.location.reload();
                }
              }}
            >
              🗑️ Borrar todos los datos
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader>
            <CardTitle className="text-[#d4af37]">📅 Citas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {citasHoy.length === 0 ? (
              <p className="text-[#888]">No hay citas agendadas para hoy.</p>
            ) : (
              <div className="space-y-2">
                {citasHoy
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map((c) => (
                    <div key={c.id} className="cita-hoy p-2 border-l-2 border-[#d4af37] bg-[#222] rounded">
                      <span className="hora text-[#d4af37] font-bold">{c.hora}</span> — {c.clienteNombre}
                      <span className={`badge badge-${c.estado} ml-2`}>{c.estado}</span>
                      <br />
                      <small className="text-[#aaa]">{c.servicioNombre}</small>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader>
            <CardTitle className="text-[#d4af37]">⚠️ Insumos por Reponer</CardTitle>
          </CardHeader>
          <CardContent>
            {stockBajoList.length === 0 ? (
              <p className="text-[#888]">Todo el inventario está sobre el mínimo.</p>
            ) : (
              <div className="space-y-2">
                {stockBajoList.map((s) => (
                  <div key={s.id} className="p-2 border-l-3 border-[#e74c3c] bg-[#2a1a1a] rounded">
                    <strong>{s.nombre}</strong>
                    <br />
                    <small className="text-[#aaa]">Stock: {s.stock} / Mínimo: {s.minimo}</small>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">⚡ Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navegar('facturacion')}>➕ Nueva Factura</Button>
            <Button variant="outline" onClick={() => navegar('agenda')}>📅 Agendar Cita</Button>
            <Button variant="outline" onClick={() => navegar('clientes')}>👤 Nuevo Cliente</Button>
            <Button variant="outline" onClick={() => navegar('inventario')}>📦 Ver Inventario</Button>
            <Button variant="outline" onClick={() => navegar('compras')}>🛒 Compras & Gastos</Button>
            <Button variant="outline" onClick={() => navegar('reportes')}>📊 Reportes</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">🧾 Últimas Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          {ultimasFacturas.length === 0 ? (
            <p className="text-[#888]">No hay facturas emitidas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-[#d4af37] font-semibold">Secuencial</th>
                    <th className="text-left text-[#d4af37] font-semibold">Cliente</th>
                    <th className="text-left text-[#d4af37] font-semibold">Fecha</th>
                    <th className="text-right text-[#d4af37] font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasFacturas.map((f) => (
                    <tr key={f.id} className="border-b border-[#333] hover:bg-[#222]">
                      <td>{f.numeroFactura}</td>
                      <td>{f.clienteNombre}</td>
                      <td>{f.fechaEmision}</td>
                      <td className="text-right">{formatMoney(f.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
