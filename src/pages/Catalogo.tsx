import { Drill, Hammer, Bolt, PaintBucket, Ruler, HardHat, Package, Wrench } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';

// TODO: conectar a datos reales (endpoint de catálogo del backend).
const productos = [
  { nombre: 'Taladro percutor 1/2"', precio: '$185.000', icon: Drill },
  { nombre: 'Martillo de uña', precio: '$32.500', icon: Hammer },
  { nombre: 'Tornillos surtidos (caja x100)', precio: '$18.900', icon: Bolt },
  { nombre: 'Pintura acrílica blanca 1 gal', precio: '$76.000', icon: PaintBucket },
  { nombre: 'Cinta métrica 5m', precio: '$14.500', icon: Ruler },
  { nombre: 'Guantes de trabajo (par)', precio: '$9.900', icon: HardHat },
  { nombre: 'Cemento gris 50kg', precio: '$42.000', icon: Package },
  { nombre: 'Llave inglesa ajustable', precio: '$28.700', icon: Wrench },
];

export function Catalogo() {
  const { usuario } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-navy">Hola, {usuario?.nombre}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {productos.map(({ nombre, precio, icon: Icon }) => (
          <Card key={nombre} className="flex flex-col items-center gap-3 p-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Icon className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-navy">{nombre}</p>
            <p className="text-sm font-semibold text-gold">{precio}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
