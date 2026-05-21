import { User, Service, Barber, Booking, Coupon, SystemSettings, Notification } from './types';

// Default Barber seed
export const DEFAULT_BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Gordo (O Chefão)',
    avatarUrl: 'https://images.unsplash.com/photo-1517832606589-7a598b647192?w=150&auto=format&fit=crop&q=80',
    specialty: 'Cortes Artísticos, Degradê e Barboterapia',
    rating: 4.9,
    reviewsCount: 148,
    isActive: true
  },
  {
    id: 'b2',
    name: 'Beto Navalha',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialty: 'Barba Clássica com Toalha Quente e Navalha',
    rating: 4.8,
    reviewsCount: 112,
    isActive: true
  },
  {
    id: 'b3',
    name: 'Júnior Barber',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Infantil, Degradê Moderno e Sombrancelha',
    rating: 4.7,
    reviewsCount: 89,
    isActive: true
  },
  {
    id: 'b4',
    name: 'Felipe Freestyle',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialty: 'Platinados, Listras e Pigmentação',
    rating: 4.6,
    reviewsCount: 64,
    isActive: true
  }
];

// Default Services seed
export const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Corte Degradê / Clássico',
    price: 45.00,
    durationMinutes: 40,
    description: 'Lavagem inclusa + finalização com pomada modeladora importada.',
    category: 'cabelo'
  },
  {
    id: 's2',
    name: 'Barba de Respeito',
    price: 35.00,
    durationMinutes: 30,
    description: 'Modelagem com toalha quente, navalha e óleo especial premium.',
    category: 'barba'
  },
  {
    id: 's3',
    name: 'Combo: Corte + Barba',
    price: 70.00,
    durationMinutes: 60,
    description: 'O combo mais pedido! Corte completo e barba com toalha quente e massagem facial.',
    category: 'combo'
  },
  {
    id: 's4',
    name: 'Tratamento Capilar & Botox',
    price: 60.00,
    durationMinutes: 45,
    description: 'Alinhamento dos fios, hidratação profunda e redução de frizz.',
    category: 'outros'
  },
  {
    id: 's5',
    name: 'Sobrancelha na Navalha',
    price: 15.00,
    durationMinutes: 15,
    description: 'Desenho limpo e preciso com acabamento em navalha.',
    category: 'outros'
  }
];

// Default Coupons
export const DEFAULT_COUPONS: Coupon[] = [
  { code: 'GORDO20', discountPercentage: 20, isActive: true, minBookingValue: 50 },
  { code: 'CLIENTENOVO', discountPercentage: 15, isActive: true },
  { code: 'BARBA5', discountPercentage: 5, isActive: true }
];

// Default Settings
export const DEFAULT_SETTINGS: SystemSettings = {
  whatsappNumber: '5511999998888', // Exemplo de WhatsApp para redirecionamento
  address: 'Rua das Barbearias Elegantes, 1200 - Centro, São Paulo - SP',
  googleMapsUrl: 'https://goo.gl/maps/ExampleBarberShop',
  openHour: '09:00',
  closeHour: '20:00',
  intervalMinutes: 30
};

// Default Admin user for fast testing
export const DEFAULT_ADMIN: User = {
  id: 'admin',
  name: 'Administrador Gordo',
  phone: '11988887777',
  email: 'admin@barbeariadogordo.com.br',
  password: 'admin',
  isAdmin: true,
  loyaltyPoints: 0
};

// Default Customer user for fast testing
export const DEFAULT_CUSTOMER: User = {
  id: 'c1',
  name: 'Kleber Silva',
  phone: '11977776666',
  email: 'kleber.kmsm@gmail.com',
  password: 'user123',
  isAdmin: false,
  loyaltyPoints: 4 // Quase ganhando um corte! (10 points = free)
};

// Seed Bookings
export const DEFAULT_BOOKINGS = (): Booking[] => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dayBeforeYesterday = new Date(Date.now() - 172800000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  return [
    {
      id: 'bk-1',
      userId: 'c1',
      userName: 'Kleber Silva',
      userPhone: '11977776666',
      serviceId: 's3', // Combo Corte + Barba
      barberId: 'b1', // Gordo
      date: yesterday,
      time: '14:30',
      status: 'confirmed',
      price: 70.00,
      rating: 5,
      review: 'O Gordo é sensacional! Atendimento de primeira e a toalha quente é relaxante demais.',
      createdAt: new Date(Date.now() - 100000000).toISOString()
    },
    {
      id: 'bk-2',
      userId: 'user-temp-1',
      userName: 'Carlos Silva',
      userPhone: '11999995555',
      serviceId: 's1', // Corte
      barberId: 'b2',
      date: dayBeforeYesterday,
      time: '11:00',
      status: 'confirmed',
      price: 45.00,
      rating: 4,
      review: 'Beto manda muito no degradê. Voltarei com certeza.',
      createdAt: new Date(Date.now() - 200000000).toISOString()
    },
    {
      id: 'bk-3',
      userId: 'user-temp-2',
      userName: 'Marcos Oliveira',
      userPhone: '11999994444',
      serviceId: 's2', // Barba
      barberId: 'b2',
      date: today,
      time: '09:30',
      status: 'confirmed',
      price: 35.00,
      rating: 5,
      review: 'Excelente óleo de barba e ambiente nostálgico legal.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-4',
      userId: 'c1',
      userName: 'Kleber Silva',
      userPhone: '11977776666',
      serviceId: 's1',
      barberId: 'b3',
      date: tomorrow,
      time: '10:00',
      status: 'confirmed',
      price: 45.00,
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-5',
      userId: 'user-temp-3',
      userName: 'Ronaldo Nazário',
      userPhone: '11988883333',
      serviceId: 's3',
      barberId: 'b1',
      date: tomorrow,
      time: '16:00',
      status: 'pending',
      price: 70.00,
      createdAt: new Date().toISOString()
    }
  ];
};

export const DEFAULT_NOTIFICATIONS = (userId: string): Notification[] => [
  {
    id: 'n-1',
    userId: userId,
    title: 'Cadastro Realizado! 💈',
    message: 'Seja bem-vindo à Barbearia do Gordo. Complete 10 serviços para ganhar um corte de graça no nosso Programa de Fidelidade!',
    type: 'promo',
    createdAt: new Date(Date.now() - 36000000).toISOString(),
    isRead: false
  },
  {
    id: 'n-2',
    userId: userId,
    title: 'Próximo horário confirmado!',
    message: 'Agendamento de Combo confirmado com Gordo (O Chefão) para amanhã às 10:00.',
    type: 'confirm',
    createdAt: new Date().toISOString(),
    isRead: false
  }
];

// Utility: Local Storage sync keys
const STORAGE_KEYS = {
  USERS: 'gordo_users',
  SERVICES: 'gordo_services',
  BARBERS: 'gordo_barbers',
  BOOKINGS: 'gordo_bookings',
  COUPONS: 'gordo_coupons',
  SETTINGS: 'gordo_settings',
  NOTIFICATIONS: 'gordo_notifications'
};

// Data Initializers & Local Storage helper wrapper
export const getStoredData = () => {
  if (typeof window === 'undefined') {
    return {
      users: [DEFAULT_ADMIN, DEFAULT_CUSTOMER],
      services: DEFAULT_SERVICES,
      barbers: DEFAULT_BARBERS,
      bookings: DEFAULT_BOOKINGS(),
      coupons: DEFAULT_COUPONS,
      settings: DEFAULT_SETTINGS,
      notifications: DEFAULT_NOTIFICATIONS(DEFAULT_CUSTOMER.id)
    };
  }

  const getOrSet = <T>(key: string, defaultVal: T): T => {
    const val = localStorage.getItem(key);
    if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        console.error('Failed to parse storage key: ', key, e);
      }
    }
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  };

  const users = getOrSet<User[]>(STORAGE_KEYS.USERS, [DEFAULT_ADMIN, DEFAULT_CUSTOMER]);
  const services = getOrSet<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  const barbers = getOrSet<Barber[]>(STORAGE_KEYS.BARBERS, DEFAULT_BARBERS);
  const bookings = getOrSet<Booking[]>(STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS());
  const coupons = getOrSet<Coupon[]>(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
  const settings = getOrSet<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const notifications = getOrSet<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS(DEFAULT_CUSTOMER.id));

  return { users, services, barbers, bookings, coupons, settings, notifications };
};

export const saveStoredData = (data: {
  users?: User[];
  services?: Service[];
  barbers?: Barber[];
  bookings?: Booking[];
  coupons?: Coupon[];
  settings?: SystemSettings;
  notifications?: Notification[];
}) => {
  if (typeof window === 'undefined') return;
  Object.entries(data).forEach(([key, val]) => {
    const storageKey = STORAGE_KEYS[key.toUpperCase() as keyof typeof STORAGE_KEYS];
    if (storageKey && val !== undefined) {
      localStorage.setItem(storageKey, JSON.stringify(val));
    }
  });
};

// Formatting helpers
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const translateCategory = (cat: string): string => {
  switch (cat) {
    case 'cabelo': return 'Cabelo';
    case 'barba': return 'Barba';
    case 'combo': return 'Combo';
    default: return 'Outros';
  }
};

export const formatPortugueseDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(dateObj);
};
