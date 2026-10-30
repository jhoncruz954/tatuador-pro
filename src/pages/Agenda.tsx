import { useState, useEffect } from 'react';
import { useStorage, generarId } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function Agenda() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [citas, setCitas] = useState<any[]>([]);
  const [editId, setEditId] = useState<string>('');

  // Form state
  const [form, setForm] = useState({
    fecha: '',
    hora: '',
    clienteId: '',
    clienteNombre: '',
    servicioId: '',
    servicioNombre: '',
    estado: 'Pendiente',
    notas: '',
  });

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = () => {
    const c = storage.getCitas();
    setCitas(c);
  };

  const renderCalendario = () => {
    const div = document.getElementById('calendario');
    if (!div) return;
    const hoy = new Date();
    const ano = hoy.getFullYear();
    const mes = hoy.getMonth();
    const diasEnMes = new Date(ano, mes + 1, 0).getDate();
    const primerDia = new Date(ano, mes, 1).getDay();

    let html = '<div class="calendario-header">';
    html += '<span class="mes-ano" id="calendarioMes-ano">' + ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mes] + ' ' + ano + '</span>';
    html += '<span class="calendario-anno">' + ano + '</span>';
    html += '</div>';
    html += '<div class="calendario-dias-semana">';
    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach((d) => {
      html += '<span>' + d + '</span>';
    });
    html += '</div>';
    html += '<div class="calendario-grid">';

    const diasVacios = primerDia === 0 ? 6 : primerDia - 1;
    for (let i = 0; i < diasVacios; i++) {
      html += '<div class="dia vacio"></div>';
    }

    const fechaISO = (d: number) => {
      const mm = String(mes + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return ano + '-' + mm + '-' + dd;
    };

    for (let d = 1; d <= diasEnMes; d++) {
      const iso = fechaISO(d);
      const diaCitas = citas.filter((c) => c.fecha === iso);
      const esHoy = iso === new Date().toISOString().split('T')[0];
      html += `<div class="dia ${esHoy ? 'hoy' : ''}" data-fecha="${iso}">`;
      html += `<span class="dia-numero">${d}</span>`;
      html += `<div class="dia-citas">`;
      diaCitas.forEach((c) => {
        html += `<div class="dia-cita" data-cita="${c.id}">`;
        html += `<span class="dia-cita-hora">${c.hora}</span>`;
        html += `<span class="dia-cita-nombre">${c.clienteNombre.substring(0, 12)}</span>`;
        html += `</div>`;
      });
      html += '</div></div>';
    }

    html += '</div>';
    div.innerHTML = html;
  };

  const loadCita = (id: string) => {
    const c = storage.getCitas().find((x: any) => x.id === id);
    if (!c) return;
    setEditId(c.id);
    setForm({
      fecha: c.fecha || '',
      hora: c.hora || '',
      clienteId: c.clienteId || '',
      clienteNombre: c.clienteNombre || '',
      servicioId: c.servicioId || '',
      servicioNombre: c.servicioNombre || '',
      estado: c.estado || 'Pendiente',
      notas: c.notas || '',
    });
    document.getElementById('cit-formTitle')!.textContent = '✏️ Editar Cita';
    document.getElementById('cit-btnGuardar')!.textContent = '💾 Actualizar Cita';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardarCita = () => {
    const { fecha, hora, clienteId, clienteNombre, servicioId, servicioNombre, estado, notas } = form;

    if (!fecha || !hora || !clienteId || !servicioId) {
      alert('Fecha, hora, cliente y servicio son obligatorios.');
      return;
    }

    const citasAct = storage.getCitas();
    if (editId) {
      const idx = citasAct.findIndex((c: any) => c.id === editId);
      if (idx !== -1) {
        citasAct[idx] = { ...citasAct[idx], fecha, hora, clienteId, clienteNombre, servicioId, servicioNombre, estado, notas };
        storage.saveCitas(citasAct);
        alert('Cita actualizada.');
      }
    } else {
      const nueva = { id: generarId(), fecha, hora, clienteId, clienteNombre, servicioId, servicioNombre, estado, notas };
      citasAct.push(nueva);
      storage.saveCitas(citasAct);
      alert('Cita agendada.');
    }

    loadCitas();
    cancelarEdicionCita();
    renderCalendario();
  };

  const cancelarEdicionCita = () => {
    setEditId('');
    setForm({
      fecha: '',
      hora: '',
      clienteId: '',
      clienteNombre: '',
      servicioId: '',
      servicioNombre: '',
      estado: 'Pendiente',
      notas: '',
    });
    document.getElementById('cit-formTitle')!.textContent = '➕ Agendar Cita';
    document.getElementById('cit-btnGuardar')!.textContent = '💾 Guardar Cita';
  };

  const eliminarCita = (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    const citasAct = storage.getCitas().filter((c: any) => c.id !== id);
    storage.saveCitas(citasAct);
    loadCitas();
    renderCalendario();
    alert('Cita eliminada.');
  };

  const renderCitas = () => {
    const div = document.getElementById('listaCitas');
    if (!div) return;
    const c = storage.getCitas();
    if (c.length === 0) {
      div.innerHTML = '<p style="color:#888;">Sin citas.</p>';
      return;
    }
    let html = '<table><thead><tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    c.forEach((item: any) => {
      html += `<tr>
        <td>${item.fecha}</td>
        <td>${item.hora}</td>
        <td>${item.clienteNombre}</td>
        <td>${item.servicioNombre}</td>
        <td><span class="badge badge-${item.estado}">${item.estado}</span></td>
        <td>
          <button className="btn-sm btn-outline" onclick="window.loadCita('${item.id}')">Editar</button>
          <button className="btn-sm btn-danger" onclick="window.eliminarCita('${item.id}')">Elim</button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
  };

  useEffect(() => {
    renderCalendario();
    renderCitas();
  }, [citas]);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📅 Agenda / Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Fecha</label>
              <Input
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                type="date"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Hora</label>
              <Input
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                type="time"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Cliente ID</label>
              <Input
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                placeholder="ID del cliente"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Cliente Nombre</label>
              <Input
                value={form.clienteNombre}
                onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })}
                placeholder="Nombre del cliente"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Servicio ID</label>
              <Input
                value={form.servicioId}
                onChange={(e) => setForm({ ...form, servicioId: e.target.value })}
                placeholder="ID del servicio"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Servicio Nombre</label>
              <Input
                value={form.servicioNombre}
                onChange={(e) => setForm({ ...form, servicioNombre: e.target.value })}
                placeholder="Nombre del servicio"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Estado</label>
              <Select
                value={form.estado}
                onValueChange={(v) => setForm({ ...form, estado: v })}
              >
                <SelectTrigger>
                  <SelectValue>{form.estado}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Confirmada">Confirmada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Notas</label>
              <Input
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Notas de la cita"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              id="cit-btnGuardar"
              onClick={guardarCita}
              className="bg-[#d4af37] text-[#0f0f0f] py-2 px-4 rounded hover:bg-[#e8c84a] transition-colors"
            >
              💾 Guardar Cita
            </Button>
            <Button
              variant="outline"
              onClick={cancelarEdicionCita}
              className="bg-transparent border-[#444] text-[#aaa] py-2 px-4 rounded hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </Button>
          </div>
          <h3 id="cit-formTitle" className="mt-6 text-[#d4af37]">➕ Agendar Cita</h3>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📅 Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="calendario"></div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📋 Citas Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="listaCitas"></div>
        </CardContent>
      </Card>
    </div>
  );
}