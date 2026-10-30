import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="text-4xl mb-4">🔱</div>
        <h2 className="text-[#d4af37] text-xl">Tatuador Pro</h2>
        <p className="text-[#888] mt-2">Redirigiendo al Dashboard...</p>
      </div>
    </div>
  );
}