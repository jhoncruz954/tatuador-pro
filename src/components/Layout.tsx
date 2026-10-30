import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorage } from '@/hooks/useStorage';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'configuracion', label: 'Configuración', icon: '⚙️' },
  { key: 'clientes', label: 'Clientes', icon: '👥' },
  { key: 'servicios', label: 'Servicios', icon: '💇' },
  { key: 'agenda', label: 'Agenda', icon: '📅' },
  { key: 'inventario', label: 'Inventario', icon: '📦' },
  { key: 'facturacion', label: 'Facturar (POS)', icon: '🧾' },
  { key: 'caja', label: 'Caja / Arqueo', icon: '💰' },
  { key: 'comprobantes', label: 'Comprobantes', icon: '📄' },
  { key: 'compras', label: 'Compras & Gastos', icon: '🛒' },
  { key: 'reportes', label: 'Reportes', icon: '📈' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { storageOk } = useStorage();
  const [activeView, setActiveView] = useState('dashboard');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace('/', '');
    if (path && NAV_ITEMS.some(i => i.key === path)) {
      setActiveView(path);
    }
  }, [location.pathname]);

  const navegar = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e0e0e0] font-sans">
      <Toaster />
      <Sonner />

      <nav className="navbar bg-[#1a1a1a] border-b-2 border-[#d4af37] px-4 py-3 sticky top-0 z-100 flex items-center gap-2 flex-wrap">
        <Link to="/" className="brand text-[#d4af37] font-bold text-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
          🔱 Tatuador Pro
          <Badge variant="secondary" className="bg-[#d4af37] text-[#0f0f0f] text-xs">SIMULACIÓN</Badge>
        </Link>

        <div className="flex-1 min-w-[200px]">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => navegar(item.key)}
                className={`nav-btn px-3 py-2 text-xs font-medium rounded border transition-all ${
                  activeView === item.key
                    ? 'bg-[#d4af37] text-[#0f0f0f] font-bold border-transparent'
                    : 'bg-transparent text-[#ccc] border-transparent hover:bg-[#2a2a2a] hover:text-[#fff]'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-6 max-w-[1300px]">
        {activeView === 'dashboard' && !storageOk && (
          <Alert className="mb-4">
            <AlertTitle>⚠️ localStorage no disponible</AlertTitle>
            <AlertDescription>Los datos se guardarán solo en esta sesión. Usa Exportar para respaldar.</AlertDescription>
          </Alert>
        )}
        {children}
      </div>
    </div>
  );
}
