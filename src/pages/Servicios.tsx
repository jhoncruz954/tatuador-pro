import { useState, useEffect } from 'react';
import { useStorage, generarId } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function Servicios() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [servicios, setServicios] = useState<any[]>([]);
  const [editId, setEditId] = useState<string>('');

  // Form state
  const [form, setForm] = useState({
    nombre: '',
    tipoIva: 15,
    precioSinIva: 0,
  });

  useEffect(() => {
    setServicios(storage.getServicios());
  }, []);

  const guardarServicio = () => {
    const { nombre, tipoIva, precioSinIva } = form;

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    const sinIva = precioSinIva;
    const conIva = +(sinIva * (1 + tipoIva / 100)).toFixed(2);

    const nuevo = {
      id: editId || generarId(),
      nombre,
      tipoIva,
      precioSinIva: sinIva,
      precioConIva: conIva,
    };

    const serviciosAct = storage.getServicios();
    if (editId) {
      const idx = serviciosAct.findIndex((s: any) => s.id === editId);
      if (idx !== -1) {
        serviciosAct[idx] = nuevo;
        storage.saveServicios(serviciosAct);
        alert('Servicio actualizado.');
      }
    } else {
      serviciosAct.push(nuevo);
      storage.saveServicios(serviciosAct);
      alert('Servicio agregado.');
    }

    setServicios(serviciosAct);
    cancelarEdicionServicio();
  };

  const editarServicio = (id: string) => {
    const srv = storage.getServicios().find((s: any) => s.id === id);
    if (!srv) return;
    setEditId(srv.id);
    setForm({
      nombre: srv.nombre || '',
      tipoIva: srv.tipoIva || 15,
      precioSinIva: srv.precioSinIva || 0,
    });
    document.getElementById('srv-formTitle')!.textContent = '✏️ Editar Servicio';
    document.getElementById('srv-btnGuardar')!.textContent = '💾 Actualizar Servicio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicionServicio = () => {
    setEditId('');
    setForm({
      nombre: '',
      tipoIva: 15,
      precioSinIva: 0,
    });
    document.getElementById('srv-formTitle')!.textContent = '➕ Nuevo Servicio';
    document.getElementById('srv-btnGuardar')!.textContent = '💾 Guardar Servicio';
  };

  const eliminarServicio = (id: string) => {
    if (!confirm('¿Eliminar servicio?')) return;
    const serviciosAct = storage.getServicios().filter((s: any) => s.id !== id);
    storage.saveServicios(serviciosAct);
    setServicios(serviciosAct);
    if (editId === id) cancelarEdicionServicio();
    alert('Servicio eliminado.');
  };

  useEffect(() => {
    document.getElementById('listaServicios')!.innerHTML = '';
    const s = storage.getServicios();
    if (s.length === 0) {
      document.getElementById('listaServicios')!.innerHTML = '<p style="color:#888;">Sin servicios.</p>';
      return;
    }
    let html = '<table><thead><tr><th>ID</th><th>Nombre</th><th>IVA %</th><th>Sin IVA</th><th>Con IVA</th><th>Acciones</th></tr></thead><tbody>';
    s.forEach((item: any) => {
      html += `<tr>
        <td>${item.id}</td>
        <td>${item.nombre}</td>
        <td>${item.tipoIva}%</td>
        <td>$${(item.precioSinIva || 0).toFixed(2)}</td>
        <td>$${(item.precioConIva || 0).toFixed(2)}</td>
        <td>
          <button className="btn-sm btn-outline" onclick="window.editarServicio('${item.id}')">Editar</button>
          <button className="btn-sm btn-danger" onclick="window.eliminarServicio('${item.id}')">Elim</button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('listaServicios')!.innerHTML = html;
  }, [servicios]);

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
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                type="text"
                placeholder="Ej: Tatuaje pequeño"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">IVA %</label>
              <Input
                value={form.tipoIva}
                onChange={(e) => setForm({ ...form, tipoIva: parseFloat(e.target.value) || 15 })}
                type="number"
                step="0.01"
                value={15}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Precio sin IVA ($)</label>
              <Input
                value={form.precioSinIva}
                onChange={(e) => setForm({ ...form, precioSinIva: parseFloat(e.target.value) || 0 })}
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