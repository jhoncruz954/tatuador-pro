import { useState, useEffect } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function Inventario() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<any[]>([]);
  const [kardex, setKardex] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string>('');
  const [showKardex, setShowKardex] = useState(false);
  const [kardexData, setKardexData] = useState<any>({});

  useEffect(() => {
    loadDatos();
  }, []);

  const loadDatos = () => {
    setProductos(storage.getProductos());
    setKardex(storage.getKardex());
  };

  const renderKardex = () => {
    const div = document.getElementById('listaKardex');
    if (!div) return;
    const k = storage.getKardex();
    setKardex(k);
    if (k.length === 0) {
      div.innerHTML = '<p style="color:#888;">No hay movimientos.</p>';
      return;
    }
    let html = '<table><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Qty</th><th>Costo</th><th>Total</th><th>Factura</th><th>Acciones</th></tr></thead><tbody>';
    k.forEach((m: any) => {
      const total = (m.cantidad || 0) * (m.costoUnitario || 0);
      html += `<tr>
        <td>${m.fecha}</td>
        <td>${m.productoNombre}</td>
        <td>${m.tipo}</td>
        <td>${m.cantidad}</td>
        <td>${(m.costoUnitario || 0).toFixed(2)}</td>
        <td>${total.toFixed(2)}</td>
        <td>${m.factura || '-'}</td>
        <td>
          <Button size="sm" variant="danger" onClick={() => eliminarKardex(m.id)}>Elim</Button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
  };

  const guardarProducto = () => {
    const nombre = document.getElementById('prd-nombre')?.value?.trim() || '';
    const categoria = document.getElementById('prd-categoria')?.value?.trim() || '';
    const stock = parseInt(document.getElementById('prd-stock')?.value) || 0;
    const minimo = parseInt(document.getElementById('prd-minimo')?.value) || 0;
    const costo = parseFloat(document.getElementById('prd-costo')?.value) || 0;

    if (!nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    const productosAct = storage.getProductos();
    if (editId) {
      const idx = productosAct.findIndex((p: any) => p.id === editId);
      if (idx !== -1) {
        productosAct[idx] = { ...productosAct[idx], nombre, categoria, stock, minimo, costo };
        storage.saveProductos(productosAct);
        alert('Producto actualizado.');
      }
    } else {
      const nuevo = { id: 'PRD-' + Date.now().toString(36), nombre, categoria, stock, minimo, costo };
      productosAct.push(nuevo);
      storage.saveProductos(productosAct);
      alert('Producto agregado.');
    }

    setProductos(productosAct);
    cancelarEdicionProducto();
  };

  const cancelarEdicionProducto = () => {
    document.getElementById('prd-editId')!.value = '';
    ['prd-nombre', 'prd-categoria', 'prd-stock', 'prd-minimo', 'prd-costo'].forEach((id) => {
      (document.getElementById(id) as HTMLInputElement).value = '';
    });
    document.getElementById('prd-formTitle')!.textContent = '➕ Nuevo Producto';
    document.getElementById('prd-btnGuardar')!.textContent = '💾 Guardar Producto';
  };

  const editarProducto = (id: string) => {
    const p = storage.getProductos().find((x: any) => x.id === id);
    if (!p) return;
    document.getElementById('prd-editId')!.value = p.id;
    document.getElementById('prd-nombre')!.value = p.nombre;
    document.getElementById('prd-categoria')!.value = p.categoria;
    document.getElementById('prd-stock')!.value = String(p.stock);
    document.getElementById('prd-minimo')!.value = String(p.minimo);
    document.getElementById('prd-costo')!.value = String(p.costo);
    document.getElementById('prd-formTitle')!.textContent = '✏️ Editar Producto';
    document.getElementById('prd-btnGuardar')!.textContent = '💾 Actualizar Producto';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarProducto = (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    const productosAct = storage.getProductos().filter((p: any) => p.id !== id);
    storage.saveProductos(productosAct);
    setProductos(productosAct);
    if (document.getElementById('prd-editId')!.value === id) cancelarEdicionProducto();
    alert('Producto eliminado.');
  };

  const registrarKardex = () => {
    const productoId = document.getElementById('krd-productoId')?.value || '';
    const productoNombre = document.getElementById('krd-productoNombre')?.value || '';
    const tipo = document.getElementById('krd-tipo')?.value || 'Entrada';
    const cantidad = parseInt(document.getElementById('krd-cantidad')?.value) || 0;
    const costoUnitario = parseFloat(document.getElementById('krd-costoUnitario')?.value) || 0;
    const proveedor = document.getElementById('krd-proveedor')?.value || '';
    const factura = document.getElementById('krd-factura')?.value || '';

    if (!productoId || !productoNombre || !cantidad) {
      alert('Producto, tipo y cantidad son obligatorios.');
      return;
    }

    const kardexAct = storage.getKardex();
    const nuevo = {
      id: 'KRD-' + Date.now().toString(36),
      fecha: new Date().toISOString().split('T')[0],
      productoId,
      productoNombre,
      tipo,
      cantidad,
      costoUnitario,
      proveedor,
      factura,
    };
    kardexAct.push(nuevo);
    storage.saveKardex(kardexAct);

    // Actualizar stock del producto
    const productosAct = storage.getProductos();
    const idx = productosAct.findIndex((p: any) => p.id === productoId);
    if (idx !== -1) {
      if (tipo === 'Entrada') {
        productosAct[idx].stock += cantidad;
      } else if (tipo === 'Salida') {
        productosAct[idx].stock = Math.max(0, productosAct[idx].stock - cantidad);
      }
      storage.saveProductos(productosAct);
      setProductos(productosAct);
    }

    setKardex(kardexAct);
    ['krd-productoId', 'krd-productoNombre', 'krd-cantidad', 'krd-costoUnitario', 'krd-proveedor', 'krd-factura'].forEach((id) => {
      (document.getElementById(id) as HTMLInputElement).value = '';
    });
    document.getElementById('krd-tipo')!.value = 'Entrada';
    alert('Movimiento registrado.');
    renderKardex();
  };

  const eliminarKardex = (id: string) => {
    if (!confirm('¿Eliminar movimiento?')) return;
    const kardexAct = storage.getKardex().filter((k: any) => k.id !== id);
    storage.saveKardex(kardexAct);
    setKardex(kardexAct);
    renderKardex();
    alert('Movimiento eliminado.');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📦 Gestión de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Nombre</label>
              <Input
                id="prd-nombre"
                type="text"
                placeholder="Nombre del producto"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Categoría</label>
              <Input
                id="prd-categoria"
                type="text"
                placeholder="Categoría"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Stock</label>
              <Input
                id="prd-stock"
                type="number"
                value={0}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Mínimo</label>
              <Input
                id="prd-minimo"
                type="number"
                value={0}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Costo ($)</label>
              <Input
                id="prd-costo"
                type="number"
                step="0.01"
                value={0}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              id="prd-btnGuardar"
              onClick={guardarProducto}
              className="bg-[#d4af37] text-[#0f0f0f] py-2 px-4 rounded hover:bg-[#e8c84a] transition-colors"
            >
              💾 Guardar Producto
            </Button>
            <Button
              variant="outline"
              onClick={cancelarEdicionProducto}
              className="bg-transparent border-[#444] text-[#aaa] py-2 px-4 rounded hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </Button>
          </div>
          <h3 id="prd-formTitle" className="mt-6 text-[#d4af37]">➕ Nuevo Producto</h3>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">📋 Listado de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="listaProd"></div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardHeader>
          <CardTitle className="text-[#d4af37]">🔍 Kardex / Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Tipo</label>
              <Select
                id="krd-tipo"
                className="w-full"
              >
                <SelectTrigger>
                  <SelectValue>Entrada</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Salida">Salida</SelectItem>
                  <SelectItem value="Ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Producto ID</label>
              <Input
                id="krd-productoId"
                type="text"
                placeholder="ID del producto"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Nombre</label>
              <Input
                id="krd-productoNombre"
                type="text"
                placeholder="Nombre del producto"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Qty</label>
              <Input
                id="krd-cantidad"
                type="number"
                value={0}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Costo Unitario ($)</label>
              <Input
                id="krd-costoUnitario"
                type="number"
                step="0.01"
                value={0}
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Factura / Doc</label>
              <Input
                id="krd-factura"
                type="text"
                placeholder="Factura"
                className="w-full rounded border-[#444] bg-[#222] px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={registrarKardex}
              className="bg-[#d4af37] text-[#0f0f0f] py-2 px-4 rounded hover:bg-[#e8c84a] transition-colors"
            >
              ➕ Registrar Movimiento
            </Button>
          </div>
          <div className="mt-4">
            <div id="listaKardex"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}