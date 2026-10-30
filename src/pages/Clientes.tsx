import { useState, useEffect } from 'react';
import { useStorage, formatMoney, generarId } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function Clientes() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [editId, setEditId] = useState<string>('');

  // Form state
  const [form, setForm] = useState({
    tipoId: '05',
    identificacion: '',
    nombre: '',
    email: '',
    direccion: '',
    telefono: '',
    fechaNacimiento: '',
    alergias: '',
    grupoSanguineo: '',
    condiciones: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = () => {
    setClientes(storage.getClientes());
  };

  const guardarCliente = () => {
    const nuevo = {
      id: editId || generarId(),
      tipoId: form.tipoId,
      identificacion: form.identificacion,
      nombre: form.nombre,
      email: form.email,
      direccion: form.direccion,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento,
      alergias: form.alergias,
      grupoSanguineo: form.grupoSanguineo,
      condiciones: form.condiciones,
      fechaRegistro: new Date().toLocaleDateString('es-EC'),
    };

    const clientesAct = storage.getClientes();
    if (editId) {
      const idx = clientesAct.findIndex((c: any) => c.id === editId);
      if (idx !== -1) {
        clientesAct[idx] = nuevo;
        storage.saveClientes(clientesAct);
        alert('Cliente actualizado.');
      }
    } else {
      clientesAct.push(nuevo);
      storage.saveClientes(clientesAct);
      alert('Cliente agregado.');
    }

    setClientes(clientesAct);
    cancelarEdicion();
  };

  const cancelarEdicion = () => {
    setEditId('');
    setForm({
      tipoId: '05',
      identificacion: '',
      nombre: '',
      email: '',
      direccion: '',
      telefono: '',
      fechaNacimiento: '',
      alergias: '',
      grupoSanguineo: '',
      condiciones: '',
    });
    document.getElementById('cli-formTitle')!.textContent = '➕ Nuevo Cliente';
    document.getElementById('cli-btnGuardar')!.textContent = '💾 Guardar';
  };

  const editarCliente = (id: string) => {
    const c = storage.getClientes().find((x: any) => x.id === id);
    if (!c) return;
    setEditId(c.id);
    setForm({
      tipoId: c.tipoId || '05',
      identificacion: c.identificacion || '',
      nombre: c.nombre || '',
      email: c.email || '',
      direccion: c.direccion || '',
      telefono: c.telefono || '',
      fechaNacimiento: c.fechaNacimiento || '',
      alergias: c.alergias || '',
      grupoSanguineo: c.grupoSanguineo || '',
      condiciones: c.condiciones || '',
    });
    document.getElementById('cli-formTitle')!.textContent = '✏️ Editar Cliente';
    document.getElementById('cli-btnGuardar')!.textContent = '💾 Actualizar';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarCliente = (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    const clientesAct = storage.getClientes().filter((c: any) => c.id !== id);
    storage.saveClientes(clientesAct);
    setClientes(clientesAct);
    alert('Cliente eliminado.');
  };

  const renderClientes = () => {
    const div = document.getElementById('listaClientes');
    if (!div) return;
    const c = storage.getClientes();
    if (c.length === 0) {
      div.innerHTML = '<p style="color:#888;">Sin clientes.</p>';
      return;
    }
    let html = '<table><thead><tr><th>Identificación</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Fecha Registro</th><th>Acciones</th></tr></thead><tbody>';
    c.forEach((item: any) => {
      html += `<tr>
        <td>${item.identificacion}</td>
        <td>${item.nombre}</td>
        <td>${item.email || '-'}</td>
        <td>${item.telefono || '-'}</td>
        <td>${item.fechaRegistro}</td>
        <td>
          <button className="btn-sm btn-outline" onclick="window.editarCliente('${item.id}')">Editar</button>
          <button className="btn-sm btn-danger" onclick="window.eliminarCliente('${item.id}')">Elim</button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">👥 Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Tipo ID</label>
              <Select
                value={form.tipoId}
                onValueChange={(v) => setForm({ ...form, tipoId: v })}
              >
                <SelectTrigger>
                  <SelectValue>{form.tipoId}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="05">Cédula</SelectItem>
                  <SelectItem value="04">RUC</SelectItem>
                  <SelectItem value="06">Pasaporte</SelectItem>
                  <SelectItem value="07">Consumidor Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Identificación</label>
              <Input
                value={form.identificacion}
                onChange={(e) => setForm({ ...form, identificacion: e.target.value })}
                placeholder="Identificación"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Nombre</label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre completo"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Email</label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                placeholder="Email"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Dirección</label>
              <Input
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                placeholder="Dirección"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Teléfono</label>
              <Input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="Teléfono"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Fecha Nacimiento</label>
              <Input
                value={form.fechaNacimiento}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                type="date"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Alergias</label>
              <Input
                value={form.alergias}
                onChange={(e) => setForm({ ...form, alergias: e.target.value })}
                placeholder="Alergias"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Grupo Sanguíneo</label>
              <Input
                value={form.grupoSanguineo}
                onChange={(e) => setForm({ ...form, grupoSanguineo: e.target.value })}
                placeholder="Ej: O+"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Condiciones Médicas</label>
              <Input
                value={form.condiciones}
                onChange={(e) => setForm({ ...form, condiciones: e.target.value })}
                placeholder="Condiciones"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              id="cli-btnGuardar"
              onClick={guardarCliente}
              className="bg-[#d4af37] text-[#0f0f0f] py-2 px-4 rounded hover:bg-[#e8c84a] transition-colors"
            >
              💾 Guardar
            </Button>
            <Button
              variant="outline"
              onClick={cancelarEdicion}
              className="bg-transparent border-[#444] text-[#aaa] py-2 px-4 rounded hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </Button>
          </div>
          <h3 id="cli-formTitle" className="mt-6 text-[#d4af37]">➕ Nuevo Cliente</h3>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📋 Historial de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="listaClientes"></div>
        </CardContent>
      </Card>
    </div>
  );
}