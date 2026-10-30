import { useState } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function Configuracion() {
  const storage = useStorage();
  const navigate = useNavigate();
  const config = storage.getConfig();

  const guardarConfig = () => {
    const newConfig = {
      ruc: document.getElementById('cfg-ruc')?.value?.trim() || '',
      razonSocial: document.getElementById('cfg-razonSocial')?.value?.trim() || '',
      nombreComercial: document.getElementById('cfg-nombreComercial')?.value?.trim() || '',
      dirMatriz: document.getElementById('cfg-dirMatriz')?.value?.trim() || '',
      estab: document.getElementById('cfg-estab')?.value?.trim().padStart(3, '0') || '001',
      ptoEmi: document.getElementById('cfg-ptoEmi')?.value?.trim().padStart(3, '0') || '001',
      secuencial: parseInt(document.getElementById('cfg-secuencial')?.value) || 1,
      obligadoContabilidad: document.getElementById('cfg-obligadoContabilidad')?.value || 'NO',
      ambiente: '1',
      registroSanitario: document.getElementById('cfg-registroSanitario')?.value?.trim() || '',
      pieFactura: document.getElementById('cfg-pieFactura')?.value?.trim() || '',
      pieTicket: document.getElementById('cfg-pieTicket')?.value?.trim() || '',
    };

    if (!newConfig.ruc || !newConfig.razonSocial) {
      alert('RUC y Razón Social son obligatorios.');
      return;
    }

    storage.saveConfig(newConfig);
    alert('Configuración guardada correctamente.');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">🏢 Datos del Emisor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">RUC</label>
              <Input
                id="cfg-ruc"
                type="text"
                value={config.ruc}
                onChange={(e) => (document.getElementById('cfg-ruc') as HTMLInputElement).value = e.target.value}
                maxLength={13}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Razón Social</label>
              <Input
                id="cfg-razonSocial"
                type="text"
                value={config.razonSocial}
                onChange={(e) => (document.getElementById('cfg-razonSocial') as HTMLInputElement).value = e.target.value}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Nombre Comercial</label>
              <Input
                id="cfg-nombreComercial"
                type="text"
                value={config.nombreComercial}
                onChange={(e) => (document.getElementById('cfg-nombreComercial') as HTMLInputElement).value = e.target.value}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Dirección Matriz</label>
              <Input
                id="cfg-dirMatriz"
                type="text"
                value={config.dirMatriz}
                onChange={(e) => (document.getElementById('cfg-dirMatriz') as HTMLInputElement).value = e.target.value}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Establecimiento</label>
              <Input
                id="cfg-estab"
                type="text"
                value={config.estab}
                onChange={(e) => (document.getElementById('cfg-estab') as HTMLInputElement).value = e.target.value}
                maxLength={3}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Punto de Emisión</label>
              <Input
                id="cfg-ptoEmi"
                type="text"
                value={config.ptoEmi}
                onChange={(e) => (document.getElementById('cfg-ptoEmi') as HTMLInputElement).value = e.target.value}
                maxLength={3}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Secuencial Actual</label>
              <Input
                id="cfg-secuencial"
                type="number"
                value={String(config.secuencial)}
                onChange={(e) => (document.getElementById('cfg-secuencial') as HTMLInputElement).value = e.target.value}
                min={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Obligado a Contabilidad</label>
              <Select
                id="cfg-obligadoContabilidad"
                className="w-full"
              >
                <SelectTrigger>
                  <SelectValue>{config.obligadoContabilidad}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO">NO</SelectItem>
                  <SelectItem value="SI">SÍ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Registro Sanitario / Permiso</label>
            <Input
              id="cfg-registroSanitario"
              type="text"
              value={config.registroSanitario}
              onChange={(e) => (document.getElementById('cfg-registroSanitario') as HTMLInputElement).value = e.target.value}
              placeholder="Ej: MSP-2026-XXXX"
              className="w-full"
            />
          </div>
                  </div>
                </CardContent>
                </Card>
          
                <Card className="bg-[#1a1a1a] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-[#d4af37]">🔐 Pie de Documentos</CardTitle>
                  </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Pie de Factura (RIDE)</label>
              <textarea
                id="cfg-pieFactura"
                rows={2}
                value={config.pieFactura}
                onChange={(e) => (document.getElementById('cfg-pieFactura') as HTMLTextAreaElement).value = e.target.value}
                placeholder="Texto legal al pie de la factura..."
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Pie de Ticket</label>
              <textarea
                id="cfg-pieTicket"
                rows={2}
                value={config.pieTicket}
                onChange={(e) => (document.getElementById('cfg-pieTicket') as HTMLTextAreaElement).value = e.target.value}
                placeholder="Texto al pie del ticket..."
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              ></textarea>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">💾 Guardar Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={guardarConfig} className="w-full bg-[#d4af37] text-[#0f0f0f] py-3 font-bold rounded-lg hover:bg-[#e8c84a] transition-colors">
            Guardar Configuración
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}