import { useState, useEffect } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function Servicios() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [servicios, setServicios] = useState<any[]>([]);
  const [editId, setEditId] = useState<string>('');

  useEffect(() => {
    setServicios(storage.getServicios());
  }, []);

  const renderServicios = () => {
    const div = document.getElementById('listaServicios');
    if (!div) return;
    const s = storage.getServicios();
    setServicios(s);
    if (s.length === 0) {
      div.innerHTML = '<p style="color:#888;">Sin servicios.</p>';
      return;
    }
    let html = '<table><thead><tr><th>ID</th><th>Nombre</th><th>IVA %</th><th>Sin IVA</th><th>Con IVA</th><th>Acciones</th></tr></thead><tbody>';
    s.forEach((srv: any) => {
      html += `<tr>
        <td>${srv.id}</td>
        <td>${srv.nombre}</td>
        <td>${srv.tipoIva}%</td>
        <td>$${(srv.precioSinIva || 0).toFixed(2)}</td>
        <td>$${(srv.precioConIva || 0).toFixed(2)}</td>
        <td>
          <Button size="sm" variant="outline" onClick={() => editarServicio(srv.id)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => eliminarServicio(srv.id)}>Eliminar</Button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
  };

  const guardarServicio = () => {
    const nombre = document.getElementById('srv-nombre')?.value?.trim() || '';
    const tipoIva = parseFloat(document.getElementById('srv-tipoIva')?.value) || 0;
    const precio = parseFloat(document.getElementById('srv-precio')?.value) || 0;

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    const serviciosAct = storage.getServicios();
    const sinIva = precio;
    const conIva = +(sinIva * (1 + tipoIva / 100)).toFixed(2);

    if (editId) {
      const idx = serviciosAct.findIndex((s: any) => s.id === editId);
      if (idx !== -1) {
        serviciosAct[idx] = { ...serviciosAct[idx], nombre, tipoIva, precioSinIva: sinIva, precioConIva: conIva };
        storage.saveServicios(serviciosAct);
        alert('Servicio actualizado.');
      }
    } else {
      const nuevo = { id: 'SRV-' + Date.now().toString(36), nombre, tipoIva, precioSinIva: sinIva, precioConIva: conIva };
      serviciosAct.push(nuevo);
      storage.saveServicios(serviciosAct);
      alert('Servicio agregado.');
    }

    setServicios(serviciosAct);
    cancelarEdicionServicio();
    renderServicios();
  };

  const editarServicio = (id: string) => {
    const srv = storage.getServicios().find((s: any) => s.id === id);
    if (!srv) return;

    document.getElementById('srv-editId')!.value = srv.id;
    document.getElementById('srv-nombre')!.value = srv.nombre;
    document.getElementById('srv-tipoIva')!.value = String(srv.tipoIva);
    document.getElementById('srv-precio')!.value = String(srv.precioSinIva);
    document.getElementById('srv-formTitle')!.textContent = '✏️ Editar Servicio';
    document.getElementById('srv-btnGuardar')!.textContent = '💾 Actualizar Servicio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicionServicio = () => {
    document.getElementById('srv-editId')!.value = '';
    ['srv-nombre', 'srv-tipoIva', 'srv-precio'].forEach((id) => {
      (document.getElementById(id) as HTMLInputElement).value = '';
    });
    document.getElementById('srv-formTitle')!.textContent = '➕ Nuevo Servicio';
    document.getElementById('srv-btnGuardar')!.textContent = '💾 Guardar Servicio';
  };

  const eliminarServicio = (id: string) => {
    if (!confirm('¿Eliminar servicio?')) return;
    const serviciosAct = storage.getServicios().filter((s: any) => s.id !== id);
    storage.saveServicios(serviciosAct);
    setServicios(serviciosAct);
    if (document.getElementById('srv-editId')!.value === id) cancelarEdicionServicio();
    renderServicios();
    alert('Servicio eliminado.');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">💇 Catálogo de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Nombre del servicio</label>
              <Input
                id="srv-nombre"
                type="text"
                placeholder="Ej: Tatuaje pequeño"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">IVA %</label>
              <Input
                id="srv-tipoIva"
                type="number"
                step="0.01"
                value={15}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Precio sin IVA ($)</label>
              <Input
                id="srv-precio"
                type="number"
                step="0.01"
                value={0}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              id="srv-btnGuardar"
              onClick={guardarServicio}
              className="bg-[#d4af37] text-[#0f0f0f] py-2 px-4 rounded hover:bg-[#e8c84a] transition-colors"
            >
              💾 Guardar Servicio
            </Button>
            <Button
              variant="outline"
              onClick={cancelarEdicionServicio}
              className="bg-transparent border-[#444] text-[#aaa] py-2 px-4 rounded hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </Button>
          </div>
          <h3 id="srv-formTitle" className="mt-6 text-[#d4af37]">➕ Nuevo Servicio</h3>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📋 Listado de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="listaServicios"></div>
        </CardContent>
      </Card>
    </div>
  );
}