import { CategoryInfo } from '@/types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'baterias-bms',
    name: 'Baterías y BMS Inteligente',
    description: 'Packs de litio NMC y LiFePO4 de alta densidad, con BMS Bluetooth y protección térmica.',
    iconName: 'BatteryCharging',
    itemCount: 42,
    featuredImageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'motores-controladores',
    name: 'Motores y Controladores BLDC',
    description: 'Motores Hub en rueda y centrales de 1500W a 8000W con controladores programables sin escobillas.',
    iconName: 'Cpu',
    itemCount: 38,
    featuredImageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'frenos-regenerativos',
    name: 'Frenos y Sensores Regenerativos',
    description: 'Discos sobredimensionados, mordazas hidráulicas y manetas con micro-switch de corte regenerativo.',
    iconName: 'Disc',
    itemCount: 29,
    featuredImageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'electronica-display',
    name: 'Displays LCD, Aceleradores y DC-DC',
    description: 'Tableros digitales con velocímetro e indicador de SoC, conversores 72V/60V a 12V y aceleradores regulables.',
    iconName: 'Gauge',
    itemCount: 54,
    featuredImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cargadores-rapidos',
    name: 'Cargadores Rápidos Inteligentes',
    description: 'Cargadores en carcasa de aluminio CNC con disipación activa, protección de sobrevoltaje y carga en 3 horas.',
    iconName: 'Zap',
    itemCount: 21,
    featuredImageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'accesorios-chasis',
    name: 'Suspensión, Llantas e Iluminación LED',
    description: 'Amortiguadores regulables cargados con nitrógeno, llantas radiales de bajo roce y faros LED diurnos.',
    iconName: 'ShieldCheck',
    itemCount: 65,
    featuredImageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
  },
];
