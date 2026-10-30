import { useState, useEffect } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useStorage as useStorageHook } from '@/hooks/useStorage';

export default function Clientes() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [editId, setEditId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    setClientes(storage.getClientes());
  }, []);

  const toggleClearBuscador = () => {
    const combo = document.getElementById('cli-buscadorCombo');
    if (!combo) return;
    const tiene = document.getElementById('cli-buscador')?.value?.trim() !== '';
    combo.classList.toggle('has-value', tiene);
  };

  const renderClientes = () => {
    const filtro = (document.getElementById('cli-buscador')?.value || '').trim().toLowerCase();
    const div = document.getElementById('listaClientes');

    const filtrados = filtro === ''
      ? clientes
      : clientes.filter((c: any) =>
          c.nombre.toLowerCase().includes(filtro) ||
          c.identificacion.toLowerCase().includes(filtro) ||
          (c.email || '').toLowerCase().includes(filtro)
        );

    if (clientes.length === 0) {
      div.innerHTML = '<p style="color:#888;">Sin clientes.</p>';
      return;
    }
    if (filtrados.length === 0) {
      div.innerHTML = '<p style="color:#888;">No hay coincidencias con la búsqueda.</p>';
      return;
    }

    let html = '<table><thead><tr><th>Identificación</th><th>Nombre</th><th>Edad</th><th>Grupo</th><th>Alergias</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr></thead><tbody>';
    filtrados.forEach((c: any) => {
      const edad = c.fechaNacimiento ? calcularEdad(c.fechaNacimiento) : null;
      const tieneAlergia = c.alergias && c.alergias.trim() && !/^ninguna/i.test(c.alergias.trim());
      html += `<tr>
        <td>${c.identificacion}</td>
        <td>${c.nombre}</td>
        <td>${edad !== null ? edad + ' años' : '-'}</td>
        <td>${c.grupoSanguineo || '-'}</td>
        <td>${tieneAlergia ? `<span className="badge badge-alergia" title="${c.alergias}">⚠️ Sí</span>` : (c.alergias ? c.alergias.substring(0, 20) : '-')}</td>
        <td>${c.email || '-'}</td>
        <td>${c.telefono || '-'}</td>
        <td>
          <Button size="sm" variant="outline" onClick={() => editarCliente(c.id)}>Editar</Button>
          <Button size="sm" variant="info" onClick={() => imprimirConsentimiento(c.id)}>🖨️ Consentimiento</Button>
          <Button size="sm" variant="danger" onClick={() => eliminarCliente(c.id)}>Eliminar</Button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
  };

  const calcularEdad = (fechaNacimiento: string): number | null => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nac = new Date(fechaNacimiento + 'T00:00:00');
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const guardarCliente = () => {
    const id = document.getElementById('cli-identificacion')?.value?.trim() || '';
    const nom = document.getElementById('cli-nombre')?.value?.trim() || '';
    if (!id || !nom) {
      alert('Identificación y nombre son obligatorios.');
      return;
    }

    const clientesAct = storage.getClientes();
    const datos = {
      tipoId: document.getElementById('cli-tipoId')?.value || '05',
      identificacion: id,
      nombre: nom,
      email: document.getElementById('cli-email')?.value?.trim() || '',
      direccion: document.getElementById('cli-direccion')?.value?.trim() || '',
      telefono: document.getElementById('cli-telefono')?.value?.trim() || '',
      fechaNacimiento: document.getElementById('cli-fechaNacimiento')?.value || '',
      alergias: document.getElementById('cli-alergias')?.value?.trim() || '',
      grupoSanguineo: document.getElementById('cli-grupoSanguineo')?.value || '',
      condiciones: document.getElementById('cli-condiciones')?.value?.trim() || '',
    };

    let clienteGuardado: any = null;

    if (editId) {
      const idx = clientesAct.findIndex((c: any) => c.id === editId);
      if (idx !== -1) {
        clientesAct[idx] = { ...clientesAct[idx], ...datos };
        clienteGuardado = clientesAct[idx];
        storage.saveClientes(clientesAct);
        alert('Cliente actualizado.');
      }
    } else {
      if (clientesAct.some((c: any) => c.identificacion === id)) {
        alert('Ya existe un cliente con esa identificación.');
        return;
      }
      const nuevo = { id: storage.generarId(), ...datos, fechaRegistro: new Date().toISOString() };
      clientesAct.push(nuevo);
      storage.saveClientes(clientesAct);
      clienteGuardado = nuevo;
      alert('Cliente agregado.');
    }

    if (clienteGuardado) {
      document.getElementById('cli-editId')!.value = clienteGuardado.id;
      document.getElementById('cli-formTitle')!.textContent = '✅ Cliente guardado: ' + clienteGuardado.nombre;
      document.getElementById('cli-btnGuardar')!.textContent = '💾 Actualizar Cliente';
      document.getElementById('cli-btnConsentimiento')!.classList.remove('hidden');
      document.getElementById('cli-btnCancelar')!.classList.remove('hidden');
    }

    setClientes(clientesAct);
    renderClientes();
  };

  const editarCliente = (id: string) => {
    const cliente = storage.getClientes().find((c: any) => c.id === id);
    if (!cliente) return;

    document.getElementById('cli-editId')!.value = cliente.id;
    document.getElementById('cli-tipoId')!.value = cliente.tipoId || '05';
    document.getElementById('cli-identificacion')!.value = cliente.identificacion;
    document.getElementById('cli-nombre')!.value = cliente.nombre;
    document.getElementById('cli-email')!.value = cliente.email || '';
    document.getElementById('cli-direccion')!.value = cliente.direccion || '';
    document.getElementById('cli-telefono')!.value = cliente.telefono || '';
    document.getElementById('cli-fechaNacimiento')!.value = cliente.fechaNacimiento || '';
    document.getElementById('cli-alergias')!.value = cliente.alergias || '';
    document.getElementById('cli-grupoSanguineo')!.value = cliente.grupoSanguineo || '';
    document.getElementById('cli-condiciones')!.value = cliente.condiciones || '';
    document.getElementById('cli-edadLabel')!.textContent = '';

    document.getElementById('cli-formTitle')!.textContent = '✏️ Editar Cliente';
    document.getElementById('cli-btnGuardar')!.textContent = '💾 Actualizar Cliente';
    document.getElementById('cli-btnConsentimiento')!.classList.remove('hidden');
    document.getElementById('cli-btnCancelar')!.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicionCliente = () => {
    document.getElementById('cli-editId')!.value = '';
    ['cli-tipoId', 'cli-identificacion', 'cli-nombre', 'cli-email', 'cli-direccion', 'cli-telefono', 'cli-fechaNacimiento', 'cli-alergias', 'cli-condiciones'].forEach((id) => {
      (document.getElementById(id) as HTMLInputElement).value = '';
    });
    document.getElementById('cli-grupoSanguineo')!.value = '';
    document.getElementById('cli-edadLabel')!.textContent = '';
    document.getElementById('cli-formTitle')!.textContent = '➕ Nuevo Cliente';
    document.getElementById('cli-btnGuardar')!.textContent = '💾 Guardar Cliente';
    document.getElementById('cli-btnConsentimiento')!.classList.add('hidden');
    document.getElementById('cli-btnCancelar')!.classList.add('hidden');
  };

  const eliminarCliente = (id: string) => {
    if (!confirm('¿Eliminar cliente?')) return;
    const clientesAct = storage.getClientes().filter((c: any) => c.id !== id);
    storage.saveClientes(clientesAct);
    setClientes(clientesAct);
    if (document.getElementById('cli-editId')!.value === id) cancelarEdicionCliente();
    renderClientes();
    alert('Cliente eliminado.');
  };

  const imprimirConsentimiento = (id: string) => {
    const cliente = storage.getClientes().find((c: any) => c.id === id);
    if (!cliente) {
      alert('Cliente no encontrado.');
      return;
    }
    // Generar consentimiento simple
    alert('Consentimiento generado para: ' + cliente.nombre);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📋 Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm text-[#aaa] mb-2">Buscar cliente (nombre, cédula o email)</label>
            <div className="combobox" id="cli-buscadorCombo">
              <div className="cb-input-wrap">
                <span className="cb-icon">🔍</span>
                <Input
                  id="cli-buscador"
                  type="text"
                  placeholder="Escribe para filtrar..."
                  onInput={toggleClearBuscador}
                  autoComplete="off"
                />
                <Button type="button" className="cb-clear" onClick={() => {
      document.getElementById('cli-buscador')!.value = '';
      toggleClearBuscador();
      renderClientes();
    }}>✕</Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={() => setShowForm(true)} className="bg-[#d4af37] text-[#0f0f0f] py-2 px-4 rounded hover:bg-[#e8c84a] transition-colors">
              ➕ Nuevo Cliente
            </Button>
          </div>

          <div id="listaClientes"></div>
        </CardContent>
      </Card>

      {/* Modal para agregar/editar cliente */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border-[#333] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-[#d4af37] mb-4">{editId ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Tipo ID</label>
                <Select id="cli-tipoId" className="w-full">
                  <SelectTrigger>
                    <SelectValue>{document.getElementById('cli-tipoId')?.value || '05'}</SelectValue>
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
                  id="cli-identificacion"
                  type="text"
                  value={document.getElementById('cli-identificacion')?.value || ''}
                  onChange={(e) => (document.getElementById('cli-identificacion') as HTMLInputElement).value = e.target.value}
                  className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
                />
              </div>
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Nombre completo</label>
                <Input
                  id="cli-nombre"
                  type="text"
                  value={document.getElementById('cli-nombre')?.value || ''}
                  onChange={(e) => (document.getElementById('cli-nombre') as HTMLInputElement).value = e.target.value}
                  className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
                />
              </div>
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Email</label>
                <Input
                  id="cli-email"
                  type="email"
                  value={document.getElementById('cli-email')?.value || ''}
                  onChange={(e) => (document.getElementById('cli-email') as HTMLInputElement).value = e.target.value}
                  className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Dirección</label>
                <Input
                  id="cli-direccion"
                  type="text"
                  value={document.getElementById('cli-direccion')?.value || ''}
                  onChange={(e) => (document.getElementById('cli-direccion') as HTMLInputElement).value = e.target.value}
                  className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
                />
              </div>
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Teléfono</label>
                <Input
                  id="cli-telefono"
                  type="text"
                  value={document.getElementById('cli-telefono')?.value || ''}
                  onChange={(e) => (document.getElementById('cli-telefono') as HTMLInputElement).value = e.target.value}
                  className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-[#aaa] mb-1">Fecha de nacimiento</label>
              <Input
                id="cli-fechaNacimiento"
                type="date"
                value={document.getElementById('cli-fechaNacimiento')?.value || ''}
                onChange={(e) => (document.getElementById('cli-fechaNacimiento') as HTMLInputElement).value = e.target.value}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
              />
              <div id="cli-edadLabel" className="text-sm text-[#d4af37] mt-1"></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Alergias conocidas</label>
                <textarea
                  id="cli-alergias"
                  rows={2}
                  value={document.getElementById('cli-alergias')?.value || ''}
                  onChange={(e) => (document.getElementById('cli-alergias') as HTMLTextAreaElement).value = e.target.value}
                  className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Grupo sanguíneo</label>
                <Select
                  id="cli-grupoSanguineo"
                  className="w-full"
                >
                  <SelectTrigger>
                    <SelectValue>{document.getElementById('cli-grupoSanguineo')?.value || ''}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- Seleccionar --</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="No sabe">No sabe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-[#aaa] mb-1">Condiciones médicas / Medicamentos</label>
              <textarea
                id="cli-condiciones"
                rows={2}
                value={document.getElementById('cli-condiciones')?.value || ''}
                onChange={(e) => (document.getElementById('cli-condiciones') as HTMLTextAreaElement).value = e.target.value}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]}"
              ></textarea>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={cancelarEdicionCliente}
                variant="outline"
                className="flex-1 bg-transparent border-[#444] text-[#aaa] py-2 rounded hover:bg-[#2a2a2a] transition-colors"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarCliente}
                className="flex-1 bg-[#d4af37] text-[#0f0f0f] py-2 rounded hover:bg-[#e8c84a] transition-colors"
              >
                {editId ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}